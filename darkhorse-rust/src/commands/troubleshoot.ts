import { Command } from 'commander';
import { logger } from '../core/logger.js';

export function registerTroubleshootCommand(program: Command): void {
  program
    .command('troubleshoot')
    .description('Open independent diagnostics without changing VEP lifecycle state')
    .action(async () => {
      logger.info('Troubleshoot is independent Darkhorse tooling; it cannot change VEP state or authority.');
      logger.info('Use the project-local lifecycle command after diagnosis to obtain a governed result.');
    });
}
