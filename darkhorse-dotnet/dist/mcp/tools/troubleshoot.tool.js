/**
 * MCP tool: troubleshoot — investigate and fix bugs via MCP.
 */
import { registerTool } from '../server.js';
registerTool({
    name: 'darkhorse_troubleshoot',
    description: 'Investigate and fix bugs following DDD troubleshooting workflow',
    inputSchema: {
        type: 'object',
        properties: {
            bugId: { type: 'string', description: 'Bug ID (e.g. BUG-1.0-003)' },
            symptom: { type: 'string', description: 'What is broken' },
            context: { type: 'string', description: 'Target bounded context' },
        },
        required: ['symptom'],
    },
    handler: async (_args) => {
        return { status: 'not-implemented', message: 'Troubleshoot via MCP coming soon' };
    },
});
//# sourceMappingURL=troubleshoot.tool.js.map