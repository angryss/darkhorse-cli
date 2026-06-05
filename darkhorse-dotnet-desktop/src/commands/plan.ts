import { Command } from 'commander';
import { logger } from '../core/logger.js';

export function registerPlanCommand(program: Command): void {
  program
    .command('plan')
    .description('Create a DDD-compliant proposal for a feature or change')
    .option('-f, --feature <feature>', 'Feature or requirement to plan')
    .option('-c, --context <context>', 'Target bounded context')
    .option('--mvp <mvp>', 'Target MVP milestone (e.g. 1.0)')
    .action(async (_opts) => {
      logger.warn('Plan command not yet implemented');
      logger.info('See workflows/skills/planning.md for the planning workflow.');
    });
}
