/**
 * MCP Server — exposes DarkHorse commands as MCP tools for VS Code.
 *
 * Started via: darkhorse-dotnet mcp-serve
 *
 * This is the infrastructure stub. The MCP protocol implementation
 * will be wired up when the @modelcontextprotocol/sdk is integrated.
 */
import { logger } from '../core/logger.js';
const tools = [];
export function registerTool(tool) {
    tools.push(tool);
}
export function getRegisteredTools() {
    return [...tools];
}
/**
 * Start the MCP server. Listens on stdio for MCP protocol messages.
 */
export async function startMcpServer() {
    logger.header('DarkHorse .NET — MCP Server');
    logger.info(`Registered tools: ${tools.map((t) => t.name).join(', ') || 'none'}`);
    logger.info('MCP server started on stdio');
    logger.blank();
    logger.warn('MCP protocol handler not yet implemented.');
    logger.info('Install @modelcontextprotocol/sdk to enable full MCP support.');
    // Keep process alive for stdio
    process.stdin.resume();
}
//# sourceMappingURL=server.js.map