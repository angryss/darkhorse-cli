import { logger } from '../core/logger.js';
import { writeConfig } from '../core/index.js';
import { scaffoldWorkspace } from '../skills/scaffolding.js';
import { seedOpenSpec } from '../skills/openspec.js';
import { generateContext } from '../skills/context.js';
/**
 * Init agent — initializes a new DarkHorse workspace.
 * Creates the project skeleton, seeds OpenSpec specs, and generates context files.
 * No service archetype at this stage — use `darkhorse-dotnet add <type>` to add services.
 */
export async function initAgent(config) {
    logger.header(`Initializing workspace: ${config.name}`);
    if (config.features.frontend) {
        const plat = config.frontend?.platform ?? 'web';
        const fwName = plat === 'both' ? 'React (Web) + React Native (Mobile)'
            : plat === 'mobile' ? 'React Native (Expo)' : 'React';
        logger.info('Frontend: ' + fwName);
    }
    logger.blank();
    const results = [];
    // 1. Create workspace directory structure + root files
    logger.step('Creating workspace structure...');
    results.push(await scaffoldWorkspace(config));
    // 2. Seed OpenSpec specs, rules, guides, workflows
    logger.step('Seeding OpenSpec specs and rules...');
    results.push(await seedOpenSpec(config));
    // 3. Generate context/ navigation files
    logger.step('Generating context files...');
    results.push(await generateContext(config));
    // 4. Write .darkhorse.yaml
    logger.step('Writing workspace config...');
    await writeConfig(config);
    // Report
    logger.blank();
    const totalCreated = results.flatMap((r) => r.filesCreated);
    const totalErrors = results.flatMap((r) => r.errors);
    if (totalErrors.length > 0) {
        logger.warn(`Completed with ${totalErrors.length} warning(s):`);
        totalErrors.forEach((e) => logger.warn(`  ${e}`));
    }
    logger.success(`Workspace initialized: ${config.paths.root}`);
    logger.info(`${totalCreated.length} files created`);
    logger.blank();
    logger.info('Next steps:');
    logger.step(`cd ${config.name}`);
    logger.step('Read context/00-START-HERE.md and openspec/AGENTS.md');
    logger.step('Define your project roadmap in openspec/specs/project/roadmap.md');
    logger.step('Add your first service: darkhorse-dotnet add api');
}
//# sourceMappingURL=init.agent.js.map