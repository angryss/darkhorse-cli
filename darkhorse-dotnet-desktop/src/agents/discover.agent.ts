import { logger } from '../core/logger.js';

export async function discoverAgent(_opts: Record<string, unknown>): Promise<void> {
  logger.warn('Discover agent not yet implemented (see workflows/skills/discovery.md)');
}
