// ──────────────────────────────────────────────────────────────────
// Agent: init
// Orchestrates the full init pipeline — scaffolds the runtime
// product structure, seeds OpenSpec, generates context, writes config.
// ──────────────────────────────────────────────────────────────────

import type { DarkhorseConfig, SkillResult } from '../core/types.js';
import { logger } from '../core/logger.js';
import { writeConfig } from '../core/config.js';
import { scaffoldProject } from '../skills/scaffolding.js';
import { seedOpenSpec } from '../skills/openspec.js';
import { generateContext } from '../skills/context.js';

export async function initAgent(config: DarkhorseConfig): Promise<void> {
  logger.header(`Initializing project: ${config.name}`);
  logger.info(`Archetype: Tauri Desktop Application`);
  logger.info(`Crate prefix: ${config.rust.cratePrefix}`);
  logger.info(`Rust edition: ${config.rust.edition}`);
  if (config.features.frontend) {
    logger.info('Frontend: Vite + TypeScript');
  }
  logger.blank();

  const results: SkillResult[] = [];

  // 1. Create project directory structure + runtime files
  logger.step('Creating project structure...');
  results.push(await scaffoldProject(config));

  // 2. Seed OpenSpec specs, rules, guides, workflows
  logger.step('Seeding OpenSpec specs and rules...');
  results.push(await seedOpenSpec(config));

  // 3. Generate context/ navigation files
  logger.step('Generating context files...');
  results.push(await generateContext(config));

  // 4. Write .darkhorse.yaml
  logger.step('Writing project config...');
  await writeConfig(config);

  // Report results
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
  logger.step('Define your project roadmap in openspec/specs/project/roadmap.md');
  logger.step('Run: cargo check');
}
