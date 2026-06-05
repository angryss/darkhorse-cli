import { logger } from '../core/logger.js';

export async function troubleshootAgent(_opts: Record<string, unknown>): Promise<void> {
  logger.warn('Troubleshoot agent not yet implemented (see workflows/skills/troubleshooting.md)');
}
