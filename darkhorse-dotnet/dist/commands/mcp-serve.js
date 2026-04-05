import { startMcpServer } from '../mcp/server.js';
export function registerMcpCommand(program) {
    program
        .command('mcp-serve')
        .description('Start MCP server for VS Code integration')
        .action(async () => {
        // Import tool registrations so they self-register
        await import('../mcp/tools/init.tool.js');
        await import('../mcp/tools/discover.tool.js');
        await import('../mcp/tools/plan.tool.js');
        await import('../mcp/tools/implement.tool.js');
        await import('../mcp/tools/troubleshoot.tool.js');
        await startMcpServer();
    });
}
//# sourceMappingURL=mcp-serve.js.map