import chalk from 'chalk';
const PREFIXES = {
    info: chalk.blue('ℹ'),
    success: chalk.green('✔'),
    warn: chalk.yellow('⚠'),
    error: chalk.red('✖'),
    step: chalk.cyan('→'),
    debug: chalk.gray('⊡'),
};
let verbose = false;
export function setVerbose(v) {
    verbose = v;
}
function log(level, message, ...args) {
    if (level === 'debug' && !verbose)
        return;
    console.log(`${PREFIXES[level]} ${message}`, ...args);
}
export const logger = {
    info: (msg, ...args) => log('info', msg, ...args),
    success: (msg, ...args) => log('success', msg, ...args),
    warn: (msg, ...args) => log('warn', msg, ...args),
    error: (msg, ...args) => log('error', msg, ...args),
    step: (msg, ...args) => log('step', msg, ...args),
    debug: (msg, ...args) => log('debug', msg, ...args),
    /** Log a blank line for spacing. */
    blank: () => console.log(),
    /** Log a header for a major phase. */
    header: (msg) => {
        console.log();
        console.log(chalk.bold.underline(msg));
    },
};
//# sourceMappingURL=logger.js.map