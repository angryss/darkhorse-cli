import { Command } from 'commander';
import { logger } from '../core/logger.js';

export function registerTroubleshootCommand(program: Command): void {
  program
    .command('troubleshoot')
    .description('Diagnose bugs and architecture violations in the WPF project')
    .option('-s, --symptom <symptom>', 'Describe the problem or error')
    .option('-c, --context <context>', 'Related bounded context')
    .action(async (_opts) => {
      logger.warn('Troubleshoot command not yet implemented');
      logger.info('See workflows/skills/troubleshooting.md for the troubleshoot workflow.');
    });
}
