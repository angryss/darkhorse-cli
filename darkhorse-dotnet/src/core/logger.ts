import chalk from 'chalk';

type LogLevel = 'info' | 'success' | 'warn' | 'error' | 'step' | 'debug';

const PREFIXES: Record<LogLevel, string> = {
  info: chalk.blue('ℹ'),
  success: chalk.green('✔'),
  warn: chalk.yellow('⚠'),
  error: chalk.red('✖'),
  step: chalk.cyan('→'),
  debug: chalk.gray('⊡'),
};

let verbose = false;

export function setVerbose(v: boolean): void {
  verbose = v;
}

function log(level: LogLevel, message: string, ...args: unknown[]): void {
  if (level === 'debug' && !verbose) return;
  console.log(`${PREFIXES[level]} ${message}`, ...args);
}

export const logger = {
  info: (msg: string, ...args: unknown[]) => log('info', msg, ...args),
  success: (msg: string, ...args: unknown[]) => log('success', msg, ...args),
  warn: (msg: string, ...args: unknown[]) => log('warn', msg, ...args),
  error: (msg: string, ...args: unknown[]) => log('error', msg, ...args),
  step: (msg: string, ...args: unknown[]) => log('step', msg, ...args),
  debug: (msg: string, ...args: unknown[]) => log('debug', msg, ...args),

  /** Log a blank line for spacing. */
  blank: () => console.log(),

  /** Log a header for a major phase. */
  header: (msg: string) => {
    console.log();
    console.log(chalk.bold.underline(msg));
  },
};
