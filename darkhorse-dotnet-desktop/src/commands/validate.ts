import { Command } from 'commander';
import { logger } from '../core/logger.js';

export function registerValidateCommand(program: Command): void {
  program
    .command('validate')
    .description('Validate architecture rules for the current WPF project')
    .option('-p, --project <dir>', 'Project root directory (default: cwd)', '.')
    .action(async (_opts) => {
      logger.warn('Validate command not yet implemented');
      logger.info('See openspec/specs/architecture/architecture-rules.md for the rules to validate against.');
    });
}
