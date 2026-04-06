import { logger } from '../core/logger.js';
export function registerMcpCommand(program) {
    program
        .command('mcp-serve')
        .description('Start MCP server for AI agent integration')
        .action(async () => {
        // TODO: Implement MCP server
        logger.warn('mcp-serve command is not yet implemented');
    });
}
//# sourceMappingURL=mcp-serve.js.map