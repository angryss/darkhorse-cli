/**
 * MCP tool: init — scaffold a new project via MCP.
 */

import { registerTool } from '../server.js';

registerTool({
  name: 'darkhorse_init',
  description: 'Scaffold a new DarkHorse Java project with DDD, Quarkus, and Clean Architecture',
  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Project name (lowercase, hyphenated)' },
      description: { type: 'string', description: 'Project description' },
      groupId: { type: 'string', description: 'Maven group ID' },
      javaVersion: { type: 'number', enum: [17, 21], description: 'Java version' },
      includeFrontend: { type: 'boolean', description: 'Include React frontend' },
      outputDir: { type: 'string', description: 'Output directory' },
    },
    required: ['name', 'description'],
  },
  handler: async (args) => {
    // TODO: Wire to initAgent via shared input model
    return { status: 'not-implemented', message: 'Init via MCP coming soon' };
  },
});
