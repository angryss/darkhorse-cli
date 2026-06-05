import { logger } from '../core/logger.js';
import { type DarkhorseConfig, type SkillResult, FEATURE_ARCHETYPE_LABELS } from '../core/index.js';
import { scaffoldFeature } from '../skills/scaffolding.js';

/**
 * Add agent — scaffolds a new bounded context (feature module) into an existing project.
 */
export async function addAgent(
  config: DarkhorseConfig,
  contextName: string,
  archetype: string,
): Promise<void> {
  logger.header(`Adding bounded context: ${contextName}`);
  logger.info(`Archetype: ${FEATURE_ARCHETYPE_LABELS[archetype as keyof typeof FEATURE_ARCHETYPE_LABELS] ?? archetype}`);
  logger.info(`Namespace: ${config.dotnet.namespace}`);
  logger.info(`Project: ${config.paths.root}`);
  logger.blank();

  const results: SkillResult[] = [];

  logger.step('Scaffolding bounded context structure...');
  results.push(await scaffoldFeature(config, contextName));

  logger.blank();
  const totalCreated = results.flatMap((r) => r.filesCreated);
  const totalErrors = results.flatMap((r) => r.errors);

  if (totalErrors.length > 0) {
    logger.warn(`Completed with ${totalErrors.length} warning(s):`);
    totalErrors.forEach((e) => logger.warn(`  ${e}`));
  }

  logger.success(`Bounded context scaffolded: ${contextName}`);
  logger.info(`${totalCreated.length} files created`);
  logger.blank();
  logger.info('Next steps:');
  logger.step(`Define the ${contextName} domain in openspec/specs/domain/${contextName}.md`);
  logger.step(`Implement entities in src/${config.dotnet.namespace}.Domain/Entities/`);
  logger.step(`Implement handlers in src/${config.dotnet.namespace}.Application/Commands/${contextName}/`);
  logger.step(`Build the UI in src/${config.dotnet.namespace}.Presentation/Views/${contextName}/`);
}
