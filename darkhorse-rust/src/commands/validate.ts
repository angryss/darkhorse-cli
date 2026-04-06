import { Command } from 'commander';
import { logger } from '../core/logger.js';

export function registerValidateCommand(program: Command): void {
  program
    .command('validate')
    .description('Validate project structure and architecture compliance')
    .action(async () => {
      // TODO: Implement validation skill orchestration
      logger.warn('validate command is not yet implemented');
    });
}
