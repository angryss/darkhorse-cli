/**
 * MCP tool: discover — explore and shape product ideas via MCP.
 */

import { registerTool } from '../server.js';

registerTool({
  name: 'darkhorse_discover',
  description: 'Explore and shape a product idea before formal planning',
  inputSchema: {
    type: 'object',
    properties: {
      idea: { type: 'string', description: 'The idea, feature, or change to explore' },
      mode: { type: 'string', enum: ['discovery', 'adjustment'], description: 'Discovery mode or adjustment mode' },
      mvp: { type: 'string', description: 'Target MVP milestone (e.g. 1.0)' },
      context: { type: 'string', description: 'Related bounded context or existing plan' },
    },
    required: ['idea'],
  },
  handler: async (_args) => {
    return { status: 'not-implemented', message: 'Discover via MCP coming soon' };
  },
});
