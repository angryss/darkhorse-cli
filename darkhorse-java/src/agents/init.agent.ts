import { logger } from '../core/logger.js';
import { writeConfig, ARCHETYPE_LABELS, type DarkhorseConfig, type SkillResult } from '../core/index.js';
import { scaffold } from '../skills/scaffolding.js';
import { seedOpenSpec } from '../skills/openspec.js';
import { generateContext } from '../skills/context.js';
import { materializeVepReadiness, prepareVepReadiness } from '../skills/vep.js';

/**
 * Init agent — thin orchestrator.
 * Calls skills in sequence and reports results. No business logic here.
 */
export async function initAgent(config: DarkhorseConfig): Promise<void> {
  const vepPlan = await prepareVepReadiness(config);
  logger.header(`Scaffolding: ${config.name}`);
  logger.info(`Archetype: ${ARCHETYPE_LABELS[config.archetype]}`);
  logger.info(`Framework: Quarkus | Java ${config.java.javaVersion} | ${config.java.groupId}`);
  if (config.features.frontend) {
    let fwName: string;
    if (config.frontend?.platform === 'both') {
      fwName = 'React (Web) + React Native (Mobile)';
    } else if (config.frontend?.platform === 'mobile') {
      fwName = 'React Native (Expo)';
    } else {
      fwName = 'React';
    }
    logger.info('Frontend: ' + fwName + (config.frontend?.toolkit ? ' + Toolkit' : ''));
  }
  logger.blank();

  const results: SkillResult[] = [];

  // 1. Create canonical directory structure + base project files
  logger.step('Creating project structure...');
  results.push(await scaffold(config));

  // 2. Seed OpenSpec specs, rules, guides, workflows
  logger.step('Seeding OpenSpec specs and rules...');
  results.push(await seedOpenSpec(config));

  // 3. Generate context/ navigation files
  logger.step('Generating context files...');
  results.push(await generateContext(config));

  // 4. Write .darkhorse.yaml
  logger.step('Writing project config...');
  await writeConfig(config);

  // 5. Materialize the project-owned VEP dependency and starter Contract
  logger.step('Generating VEP-ready project boundary...');
  results.push(await materializeVepReadiness(vepPlan));

  // Report
  logger.blank();
  const totalCreated = results.flatMap((r) => r.filesCreated);
  const totalErrors = results.flatMap((r) => r.errors);

  if (totalErrors.length > 0) {
    logger.warn(`Completed with ${totalErrors.length} warning(s):`);
    totalErrors.forEach((e) => logger.warn(`  ${e}`));
  }

  logger.success(`Project scaffolded: ${config.paths.root}`);
  logger.info(`${totalCreated.length} files created`);
  logger.blank();
  logger.info('Next steps:');
  logger.step(`cd ${config.name}`);
  logger.step('Read context/00-START-HERE.md and openspec/AGENTS.md');
  logger.step('Define your first bounded context in openspec/specs/domain/');
  logger.step('Create your first MVP in openspec/specs/project/mvps/');
}
