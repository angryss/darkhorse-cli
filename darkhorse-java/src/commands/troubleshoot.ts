import { Command } from 'commander';
import { logger } from '../core/logger.js';

export function registerTroubleshootCommand(program: Command): void {
  program
    .command('troubleshoot')
    .description('Investigate and fix bugs')
    .option('-b, --bug-id <id>', 'Bug ID (e.g. BUG-1.0-003)')
    .option('-s, --symptom <symptom>', 'What is broken')
    .option('-c, --context <context>', 'Target bounded context')
    .action(async (_opts) => {
      logger.warn('Troubleshoot command not yet implemented (v1 priority: 8/8)');
      logger.info('See workflows/skills/troubleshoot.md for the troubleshooting workflow.');
    });
}
