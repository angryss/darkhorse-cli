import { Command } from 'commander';
import { startMcpServer } from '../mcp/server.js';

export function registerMcpCommand(program: Command): void {
  program
    .command('mcp-serve')
    .description('Start MCP server for VS Code integration')
    .action(async () => {
      await startMcpServer();
    });
}
