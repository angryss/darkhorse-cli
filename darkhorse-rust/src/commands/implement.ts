import { Command } from 'commander';
import { logger } from '../core/logger.js';

export function registerImplementCommand(program: Command): void {
  program
    .command('implement')
    .description('Execute an approved implementation proposal')
    .action(async () => {
      // TODO: Implement implementation skill orchestration
      logger.warn('implement command is not yet implemented');
    });
}
