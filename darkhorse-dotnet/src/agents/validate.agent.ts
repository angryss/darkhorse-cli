import { logger } from '../core/logger.js';

/**
 * Validate agent — orchestrates spec and architecture validation.
 * Thin orchestrator; real logic lives in skills.
 */
export async function validateAgent(): Promise<void> {
  logger.info('Validation assistance is non-authoritative and performs no VEP lifecycle transition.');
}
