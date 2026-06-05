import { Command } from 'commander';
import { logger } from '../core/logger.js';

export function registerImplementCommand(program: Command): void {
  program
    .command('implement')
    .description('Execute an approved proposal inside-out (domain → application → infrastructure → presentation)')
    .option('-p, --proposal <id>', 'Proposal ID to implement')
    .option('-c, --context <context>', 'Bounded context to implement')
    .option('--mvp <mvp>', 'Target MVP milestone (e.g. 1.0)')
    .action(async (_opts) => {
      logger.warn('Implement command not yet implemented');
      logger.info('See workflows/skills/implementation.md for the implementation workflow.');
    });
}
