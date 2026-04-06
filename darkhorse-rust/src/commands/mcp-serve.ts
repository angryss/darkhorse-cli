import { Command } from 'commander';
import { logger } from '../core/logger.js';

export function registerMcpCommand(program: Command): void {
  program
    .command('mcp-serve')
    .description('Start MCP server for AI agent integration')
    .action(async () => {
      // TODO: Implement MCP server
      logger.warn('mcp-serve command is not yet implemented');
    });
}
