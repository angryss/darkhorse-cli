import { logger } from '../core/logger.js';
export function registerValidateCommand(program) {
    program
        .command('validate')
        .description('Validate project structure and architecture compliance')
        .action(async () => {
        // TODO: Implement validation skill orchestration
        logger.warn('validate command is not yet implemented');
    });
}
//# sourceMappingURL=validate.js.map