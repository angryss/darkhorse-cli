import { logger } from '../core/logger.js';
import { writeConfig, type DarkhorseConfig, type SkillResult } from '../core/index.js';
import { scaffoldProject } from '../skills/scaffolding.js';
import { scaffoldDeployment } from '../skills/deployment.js';
import { seedOpenSpec } from '../skills/openspec.js';
import { generateContext } from '../skills/context.js';
import { materializeVepReadiness, prepareVepReadiness } from '../skills/vep.js';

/**
 * Init agent — initializes a new DarkHorse WPF desktop project.
 * Creates the five-layer Onion Architecture skeleton, seeds OpenSpec specs, and generates context files.
 */
export async function initAgent(config: DarkhorseConfig): Promise<void> {
  const vepPlan = await prepareVepReadiness(config);
  const ns = config.dotnet.namespace;
  const uiLabel = config.dotnet.uiFramework === 'materialdesign'
    ? 'Material Design in XAML Toolkit'
    : 'WPF UI (Fluent Design)';
  const cicdLabel: Record<string, string> = {
    'github-actions': 'GitHub Actions',
    'ado': 'Azure DevOps',
    'none': 'None',
  };

  logger.header(`Initializing WPF project: ${config.name}`);
  logger.info(`Namespace: ${ns}`);
  logger.info(`.NET Version: ${config.dotnet.dotnetVersion}`);
  logger.info(`UI Framework: ${uiLabel}`);
  logger.info(`Persistence: ${config.features.persistence ? 'EF Core SQLite' : 'None'}`);
  logger.info(`Installer: WiX 4 MSI`);
  logger.info(`CI/CD: ${cicdLabel[config.deployment.cicd] ?? 'None'}`);
  logger.blank();

  const results: SkillResult[] = [];

  // 1. Scaffold the five-layer project structure
  logger.step('Creating project structure...');
  results.push(await scaffoldProject(config));

  // 2. Scaffold WiX installer + CI/CD pipeline
  logger.step('Creating installer and pipeline files...');
  results.push(await scaffoldDeployment(config));

  // 3. Seed OpenSpec specs, rules, guides, workflows
  logger.step('Seeding OpenSpec specs and rules...');
  results.push(await seedOpenSpec(config));

  // 4. Generate context/ navigation files
  logger.step('Generating context files...');
  results.push(await generateContext(config));

  // 5. Write .darkhorse.yaml
  logger.step('Writing project config...');
  await writeConfig(config);

  // 6. Materialize the project-owned VEP dependency and starter Contract
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

  logger.success(`Project initialized: ${config.paths.root}`);
  logger.info(`${totalCreated.length} files created`);
  logger.blank();
  logger.info('Next steps:');
  logger.step(`cd ${config.name}`);
  logger.step('Read context/00-START-HERE.md and openspec/AGENTS.md');
  logger.step('Define your domain in openspec/specs/domain/ and openspec/specs/project/roadmap.md');
  logger.step(`Build: dotnet build ${ns}.sln`);
  logger.step('Add a feature: darkhorse-dotnet-desktop add --context <ContextName>');
}
