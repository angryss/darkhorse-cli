/**
 * MCP Server — exposes DarkHorse commands as MCP tools for VS Code.
 *
 * Started via: darkhorse-dotnet mcp-serve
 *
 * This is the infrastructure stub. The MCP protocol implementation
 * will be wired up when the @modelcontextprotocol/sdk is integrated.
 */
export interface McpTool {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
    handler: (args: Record<string, unknown>) => Promise<unknown>;
}
export declare function registerTool(tool: McpTool): void;
export declare function getRegisteredTools(): McpTool[];
/**
 * Start the MCP server. Listens on stdio for MCP protocol messages.
 */
export declare function startMcpServer(): Promise<void>;
//# sourceMappingURL=server.d.ts.map