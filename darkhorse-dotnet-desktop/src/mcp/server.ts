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

export async function startMcpServer(): Promise<void> {
  logger.header('DarkHorse .NET Desktop — MCP Server');
  logger.info(`Registered tools: ${tools.map((t) => t.name).join(', ') || 'none'}`);
  logger.info('MCP server started on stdio');
  logger.blank();
  logger.warn('MCP protocol handler not yet implemented.');
  logger.info('Install @modelcontextprotocol/sdk to enable full MCP support.');

  process.stdin.resume();
}
