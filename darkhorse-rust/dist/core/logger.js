import chalk from 'chalk';
let verbose = false;
export function setVerbose(v) {
    verbose = v;
}
export const logger = {
    header(msg) {
        console.log(chalk.bold.cyan(`\n${msg}`));
    },
    step(msg) {
        console.log(chalk.gray(`  → ${msg}`));
    },
    info(msg) {
        console.log(chalk.white(`  ${msg}`));
    },
    success(msg) {
        console.log(chalk.green(`  ✓ ${msg}`));
    },
    warn(msg) {
        console.log(chalk.yellow(`  ⚠ ${msg}`));
    },
    error(msg) {
        console.log(chalk.red(`  ✗ ${msg}`));
    },
    debug(msg) {
        if (verbose)
            console.log(chalk.dim(`  [debug] ${msg}`));
    },
    blank() {
        console.log();
    },
};
//# sourceMappingURL=logger.js.map