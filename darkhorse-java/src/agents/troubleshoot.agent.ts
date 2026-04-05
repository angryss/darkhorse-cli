import { logger } from '../core/logger.js';

/**
 * Troubleshoot agent — orchestrates the troubleshooting workflow.
 * Thin orchestrator; real logic lives in skills.
 */
export async function troubleshootAgent(): Promise<void> {
  logger.warn('Troubleshoot agent not yet implemented');
}
