import { logger } from '../core/logger.js';
export function registerTroubleshootCommand(program) {
    program
        .command('troubleshoot')
        .description('Diagnose and resolve project issues')
        .action(async () => {
        // TODO: Implement troubleshooting skill orchestration
        logger.warn('troubleshoot command is not yet implemented');
    });
}
//# sourceMappingURL=troubleshoot.js.map