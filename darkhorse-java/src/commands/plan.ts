import { Command } from 'commander';
import { logger } from '../core/logger.js';

export function registerPlanCommand(program: Command): void {
  program
    .command('plan')
    .description('Create an architecture-compliant proposal')
    .option('-f, --feature <feature>', 'Feature or change to plan')
    .option('-m, --mvp <mvp>', 'Target MVP milestone (e.g. 1.0)')
    .option('-p, --priority <priority>', 'Priority: P0, P1, P2, P3')
    .option('-c, --context <context>', 'Target bounded context')
    .option('-t, --type <type>', 'Type: feature, enhancement, bug-fix')
    .action(async (_opts) => {
      logger.warn('Plan command not yet implemented (v1 priority: 8/8)');
      logger.info('See workflows/skills/plan.md for the planning workflow.');
    });
}
