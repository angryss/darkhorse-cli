import chalk from 'chalk';

let verbose = false;

export function setVerbose(v: boolean): void {
  verbose = v;
}

export const logger = {
  header(msg: string): void {
    console.log(chalk.bold.cyan(`\n${msg}`));
  },
  step(msg: string): void {
    console.log(chalk.gray(`  → ${msg}`));
  },
  info(msg: string): void {
    console.log(chalk.white(`  ${msg}`));
  },
  success(msg: string): void {
    console.log(chalk.green(`  ✓ ${msg}`));
  },
  warn(msg: string): void {
    console.log(chalk.yellow(`  ⚠ ${msg}`));
  },
  error(msg: string): void {
    console.log(chalk.red(`  ✗ ${msg}`));
  },
  debug(msg: string): void {
    if (verbose) console.log(chalk.dim(`  [debug] ${msg}`));
  },
  blank(): void {
    console.log();
  },
};
