const os = require("os");
const { exec } = require("child_process");

const platform = os.platform();
const pathToSearch = process.argv[2] || ".";

function handleUserFlow() {
  switch (platform) {
    case "darwin":
    case "linux":
      FetchDirListAndCleanUp(
        `find ${pathToSearch} -name "node_modules" -type d -prune -print | xargs du -chs`
      );
      break;

    case "win32":
      FetchDirListAndCleanUp(
        `FOR /d /r ${pathToSearch} %d in (node_modules) DO @IF EXIST "%d" echo %d`
      );
      break;

    default:
      break;
  }
}

function FetchDirListAndCleanUp(cmd) {
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }

    const lines = stdout.split("\n");

    console.log('List of directories with "node_modules" in them:');
    lines.forEach((line, index) => {
      console.log(`${index + 1}. ${line}`);
    });

    const readline = require("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      "Enter the index of the directory to remove --- (CTRL+C) to quit: ",
      (answer) => {
        rl.close();
        const directoryIndex = parseInt(answer) - 1;

        if (
          isNaN(directoryIndex) ||
          directoryIndex < 0 ||
          directoryIndex >= lines.length
        ) {
          console.log("Invalid input. Please enter a valid index.");
          handleUserFlow();
          return;
        }

        RemoveFolder(lines[directoryIndex]);
        handleUserFlow();
      }
    );
  });
}

function RemoveFolder(path) {
  exec(`rm -rf ${path}`, (error) => {
    if (error) {
      console.log(`Failed to remove directory: ${error.message}`);
    }
  });
}

handleUserFlow();
