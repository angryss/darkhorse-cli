/**
 * MCP tool: init — scaffold a new project via MCP.
 */

import { registerTool } from '../server.js';

registerTool({
  name: 'darkhorse_init',
  description: 'Scaffold a new DarkHorse .NET project with DDD, ASP.NET Core, and Clean Architecture',
  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Project name (lowercase, hyphenated)' },
      description: { type: 'string', description: 'Project description' },
      namespace: { type: 'string', description: 'Root C# namespace' },
      dotnetVersion: { type: 'number', enum: [8, 9], description: '.NET version' },
      includeFrontend: { type: 'boolean', description: 'Include React frontend' },
      outputDir: { type: 'string', description: 'Output directory' },
    },
    required: ['name', 'description'],
  },
  handler: async (_args) => {
    return { status: 'not-implemented', message: 'Init via MCP coming soon' };
  },
});
