import { Command } from 'commander';
import { logger } from '../core/logger.js';

export function registerPlanCommand(program: Command): void {
  program
    .command('plan')
    .description('Create or refine an implementation plan')
    .action(async () => {
      // TODO: Implement planning skill orchestration
      logger.warn('plan command is not yet implemented');
    });
}
