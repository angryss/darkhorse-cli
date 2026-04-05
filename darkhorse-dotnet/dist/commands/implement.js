import { logger } from '../core/logger.js';
export function registerImplementCommand(program) {
    program
        .command('implement')
        .description('Implement a planned proposal')
        .option('-i, --proposal-id <id>', 'Proposal ID (e.g. REQ-1.0-001)')
        .option('-t, --task <task>', 'What to implement')
        .option('-s, --service <service>', 'Target bounded context')
        .action(async (_opts) => {
        logger.warn('Implement command not yet implemented (v1 priority: 8/8)');
        logger.info('See workflows/skills/implement.md for the implementation workflow.');
    });
}
//# sourceMappingURL=implement.js.map