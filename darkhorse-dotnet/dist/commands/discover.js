import { logger } from '../core/logger.js';
export function registerDiscoverCommand(program) {
    program
        .command('discover')
        .description('Explore and shape product ideas before formal planning')
        .option('-i, --idea <idea>', 'Idea, feature, or change to explore')
        .option('-m, --mode <mode>', 'Mode: discovery or adjustment', 'discovery')
        .option('--mvp <mvp>', 'Target MVP milestone (e.g. 1.0)')
        .option('-c, --context <context>', 'Related bounded context')
        .action(async (_opts) => {
        logger.warn('Discover command not yet implemented (v1 priority: 7/8)');
        logger.info('See workflows/skills/discovery.md for the discovery workflow.');
    });
}
//# sourceMappingURL=discover.js.map