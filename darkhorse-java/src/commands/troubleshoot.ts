import { Command } from 'commander';
import { logger } from '../core/logger.js';

export function registerTroubleshootCommand(program: Command): void {
  program
    .command('troubleshoot')
    .description('Open independent diagnostics without changing VEP lifecycle state')
    .option('-b, --bug-id <id>', 'Bug ID (e.g. BUG-1.0-003)')
    .option('-s, --symptom <symptom>', 'What is broken')
    .option('-c, --context <context>', 'Target bounded context')
    .action(async (_opts) => {
      logger.info('Troubleshoot is independent Darkhorse tooling; it cannot change VEP state or authority.');
      logger.info('Use the project-local lifecycle command after diagnosis to obtain a governed result.');
    });
}
