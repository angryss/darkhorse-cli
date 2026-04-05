/**
 * MCP resource: rules — exposes architecture rules as MCP resources.
 */

import { logger } from '../../core/logger.js';

// TODO: Implement MCP resource provider for rules
// This will allow VS Code agents to read rules directly via MCP
// without needing to find files on disk.

export function registerRulesResource(): void {
  logger.debug('Rules MCP resource registered (stub)');
}
