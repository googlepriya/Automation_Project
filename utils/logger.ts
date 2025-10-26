// utils/logger.ts
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';

const logFilePath = path.resolve('logs/test.log');
fs.ensureFileSync(logFilePath);

export function logStep(message: string, level: 'info' | 'warn' | 'error' = 'info') {
  const timestamp = new Date().toISOString();
  let prefix = '';
  let coloredMessage = '';

  switch (level) {
    case 'info':
      prefix = '📝';
      coloredMessage = chalk.cyan(`${prefix} [${timestamp}] ${message}`);
      break;
    case 'warn':
      prefix = '⚠️';
      coloredMessage = chalk.yellow(`${prefix} [${timestamp}] ${message}`);
      break;
    case 'error':
      prefix = '❌';
      coloredMessage = chalk.red(`${prefix} [${timestamp}] ${message}`);
      break;
  }

  console.log(coloredMessage);

  // Log to file (plain text)
  const logLine = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
  fs.appendFileSync(logFilePath, logLine);
}
