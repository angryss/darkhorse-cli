/**
 * MCP Server — exposes DarkHorse commands as MCP tools for VS Code.
 *
 * Started via: darkhorse-java mcp-serve
 *
 * This is the infrastructure stub. The MCP protocol implementation
 * will be wired up when the @modelcontextprotocol/sdk is integrated.
 */

import { logger } from '../core/logger.js';

export interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (args: Record<string, unknown>) => Promise<unknown>;
}

const tools: McpTool[] = [];

export function registerTool(tool: McpTool): void {
  tools.push(tool);
}

export function getRegisteredTools(): McpTool[] {
  return [...tools];
}

/**
 * Start the MCP server. Listens on stdio for MCP protocol messages.
 */
export async function startMcpServer(): Promise<void> {
  logger.header('DarkHorse Java — MCP Server');
  logger.info(`Registered tools: ${tools.map((t) => t.name).join(', ') || 'none'}`);
  logger.info('MCP server started on stdio');
  logger.blank();
  logger.warn('MCP protocol handler not yet implemented.');
  logger.info('Install @modelcontextprotocol/sdk to enable full MCP support.');

  // TODO: Wire up @modelcontextprotocol/sdk
  // const server = new Server({ name: 'darkhorse-java', version: '0.1.0' });
  // for (const tool of tools) { server.tool(tool.name, tool.inputSchema, tool.handler); }
  // await server.connect(new StdioServerTransport());

  // Keep process alive for stdio
  process.stdin.resume();
}
