import { Command } from 'commander';
import { logger } from '../core/logger.js';

export function registerDiscoverCommand(program: Command): void {
  program
    .command('discover')
    .description('Run a discovery session for a Rust/Tauri project')
    .action(async () => {
      // TODO: Implement discovery skill orchestration
      logger.warn('discover command is not yet implemented');
    });
}
