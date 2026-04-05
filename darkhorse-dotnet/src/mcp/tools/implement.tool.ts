/**
 * MCP tool: implement — execute a proposal's tasks via MCP.
 */

import { registerTool } from '../server.js';

registerTool({
  name: 'darkhorse_implement',
  description: 'Implement a planned proposal following DDD and Clean Architecture',
  inputSchema: {
    type: 'object',
    properties: {
      proposalId: { type: 'string', description: 'Proposal ID (e.g. REQ-1.0-001)' },
      task: { type: 'string', description: 'What to implement' },
      service: { type: 'string', description: 'Target bounded context' },
    },
    required: ['proposalId'],
  },
  handler: async (_args) => {
    return { status: 'not-implemented', message: 'Implement via MCP coming soon' };
  },
});
