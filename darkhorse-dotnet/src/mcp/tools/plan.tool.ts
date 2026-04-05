/**
 * MCP tool: plan — create an architecture-compliant proposal via MCP.
 */

import { registerTool } from '../server.js';

registerTool({
  name: 'darkhorse_plan',
  description: 'Create a DDD-compliant proposal for a feature, enhancement, or bug fix',
  inputSchema: {
    type: 'object',
    properties: {
      feature: { type: 'string', description: 'What feature or change to plan' },
      mvp: { type: 'string', description: 'Target MVP milestone (e.g. 1.0)' },
      priority: { type: 'string', enum: ['P0', 'P1', 'P2', 'P3'], description: 'Priority level' },
      context: { type: 'string', description: 'Target bounded context name' },
      type: { type: 'string', enum: ['feature', 'enhancement', 'bug-fix'], description: 'Proposal type' },
    },
    required: ['feature', 'type'],
  },
  handler: async (_args) => {
    return { status: 'not-implemented', message: 'Plan via MCP coming soon' };
  },
});
