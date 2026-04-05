import { logger } from '../core/logger.js';
import { ARCHETYPE_LABELS, type DarkhorseConfig, type SkillResult } from '../core/index.js';

import { scaffoldService } from '../skills/scaffolding.js';

/**
 * Add agent — scaffolds a new backend service within an existing DarkHorse workspace.
 * Expects config.archetype and config.dotnet to be fully populated.
 * config.paths.backend points to root/backend/<category>/<serviceName>/.
 */
export async function addAgent(config: DarkhorseConfig): Promise<void> {
  const archetype = config.archetype!;
  const dotnet = config.dotnet!;

  logger.header(`Adding service: ${config.name}`);
  logger.info(`Archetype: ${ARCHETYPE_LABELS[archetype]}`);
  logger.info(`Namespace: ${dotnet.namespace}`);
  logger.info(`Framework: ASP.NET Core (.NET ${dotnet.dotnetVersion})`);
  logger.info(`Location: ${config.paths.backend}`);
  logger.blank();

  const results: SkillResult[] = [];

  // Create service directory structure, .sln, .csproj, and CQRS examples
  logger.step('Scaffolding service structure...');
  results.push(await scaffoldService(config));

  // Report
  logger.blank();
  const totalCreated = results.flatMap((r) => r.filesCreated);
  const totalErrors = results.flatMap((r) => r.errors);

  if (totalErrors.length > 0) {
    logger.warn(`Completed with ${totalErrors.length} warning(s):`);
    totalErrors.forEach((e) => logger.warn(`  ${e}`));
  }

  logger.success(`Service scaffolded: ${config.paths.backend}`);
  logger.info(`${totalCreated.length} files created`);
  logger.blank();
  logger.info('Next steps:');
  logger.step('Review context/00-START-HERE.md — updated workspace structure');
  logger.step(`Open openspec/AGENTS.md and register the new ${config.name} service`);
  logger.step(`Run: dotnet build ${config.paths.backend}/${dotnet.namespace}.sln`);
}
