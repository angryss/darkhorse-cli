import { Command } from 'commander';
import { logger } from '../core/logger.js';

export function registerValidateCommand(program: Command): void {
  program
    .command('validate')
    .description('Validate project specs and architecture compliance')
    .option('-p, --path <path>', 'Project path', '.')
    .action(async (_opts) => {
      logger.warn('Validate command not yet implemented (v1 priority: 6/8)');
      logger.info('Will check: OpenSpec structure, architecture rules, bounded context integrity.');
    });
}
