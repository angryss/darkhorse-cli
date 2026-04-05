import { logger } from '../core/logger.js';
import { runDiscovery } from '../skills/discovery.js';
/**
 * Discover agent — orchestrates the product discovery workflow.
 * Thin orchestrator; real logic lives in the discovery skill.
 */
export async function discoverAgent(input) {
    logger.step('Starting product discovery…');
    const result = await runDiscovery(input);
    if (result.success) {
        logger.success('Discovery complete.');
    }
    else {
        for (const err of result.errors) {
            logger.error(err);
        }
    }
    return result;
}
//# sourceMappingURL=discover.agent.js.map