const chalk = require("chalk");
const dayjs = require("dayjs");
const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "../../../../logs.txt");

// Función para obtener timestamp
function timestamp() {
  return dayjs().format("YYYY-MM-DD HH:mm:ss");
}

// Función para escribir en el archivo de logs
function writeToFile(message) {
  fs.appendFile(logFile, message + "\n", (err) => {
    if (err) {
      console.error(chalk.red("Error al escribir en el archivo de logs:"), err);
    }
  });
}

// Logger principal
module.exports = {
  info: (...msg) => {
    const logMessage = `[INFO ${timestamp()}] ${msg.join(" ")}`;
    console.log(chalk.blue(logMessage));
    writeToFile(logMessage);
  },
  warn: (...msg) => {
    const logMessage = `[WARN ${timestamp()}] ${msg.join(" ")}`;
    console.log(chalk.yellow(logMessage));
    writeToFile(logMessage);
  },
  error: (...msg) => {
    const logMessage = `[ERROR ${timestamp()}] ${msg.join(" ")}`;
    console.error(chalk.red(logMessage));
    writeToFile(logMessage);
  },
  success: (...msg) => {
    const logMessage = `[SUCCESS ${timestamp()}] ${msg.join(" ")}`;
    console.log(chalk.green(logMessage));
    writeToFile(logMessage);
  },
  log: (...msg) => {
    const logMessage = `[LOG ${timestamp()}] ${msg.join(" ")}`;
    console.log(chalk.white(logMessage));
    writeToFile(logMessage);
  },
};