import { logger } from '../core/logger.js';

export interface DiscoveryInput {
  idea: string;
  mode?: 'discovery' | 'adjustment';
  mvp?: string;
  context?: string;
}

export interface DiscoveryOutput {
  success: boolean;
  mode: 'discovery' | 'adjustment';
  summary: string;
  errors: string[];
}

/**
 * Discovery skill — guided product discovery and MVP shaping.
 *
 * Explores scope, identifies tradeoffs, compares options, and produces
 * planning-ready output that feeds directly into the planning workflow.
 *
 * Two modes:
 * - discovery: expand, refine, and narrow a new idea into MVP shape
 * - adjustment: re-evaluate existing plans when new ideas or constraints appear
 */
export async function runDiscovery(_input: DiscoveryInput): Promise<DiscoveryOutput> {
  logger.warn('Discovery skill not yet implemented');
  logger.info('See workflows/skills/discovery.md for the discovery workflow.');

  return {
    success: false,
    mode: _input.mode ?? 'discovery',
    summary: 'Discovery skill execution pending implementation.',
    errors: ['Discovery skill not yet implemented'],
  };
}
