import { Command } from 'commander';
import inquirer, { type DistinctQuestion } from 'inquirer';
import { logger } from '../core/logger.js';
import { nxMonorepoAgent } from '../agents/nx-monorepo.agent.js';
import {
  type NxMode,
  type NxEcosystem,
  type NxAnalysisInput,
  type NxProjectIntent,
  type NxScalePrediction,
  type NxExistingProject,
} from '../skills/nx-monorepo.js';

const VALID_MODES: NxMode[] = ['plan-ahead', 'migration'];
const VALID_ECOSYSTEMS: NxEcosystem[] = ['dotnet', 'java', 'desktop', 'frontend', 'mixed'];

export function registerNxMonorepoCommand(program: Command): void {
  program
    .command('nx-monorepo')
    .description('Analyze and plan Nx monorepo strategy — plan-ahead or migration')
    .option('-m, --mode <mode>', 'Mode: plan-ahead or migration')
    .option('-n, --name <name>', 'Product name')
    .option('-d, --description <description>', 'Product description')
    .option('-e, --ecosystem <ecosystem>', 'Ecosystem: dotnet, java, desktop, frontend, mixed')
    .option('--projects <projects>', 'Comma-separated list of intended project names (plan-ahead mode)')
    .option('--pain-points <painPoints>', 'Comma-separated known pain points (migration mode)')
    .action(async (opts) => {
      logger.header('DarkHorse — Nx Monorepo Strategy');
      logger.blank();

      if (opts.mode && !VALID_MODES.includes(opts.mode)) {
        logger.error(`Invalid mode: "${opts.mode}". Must be one of: ${VALID_MODES.join(', ')}`);
        process.exit(1);
      }

      if (opts.ecosystem && !VALID_ECOSYSTEMS.includes(opts.ecosystem)) {
        logger.error(`Invalid ecosystem: "${opts.ecosystem}". Must be one of: ${VALID_ECOSYSTEMS.join(', ')}`);
        process.exit(1);
      }

      const answers = await promptMissing(opts);
      const input = await buildInput(answers, opts);

      await nxMonorepoAgent(input);
    });
}

interface PromptAnswers {
  mode: NxMode;
  name: string;
  description: string;
  ecosystem: NxEcosystem;
}

async function promptMissing(opts: Record<string, unknown>): Promise<PromptAnswers> {
  const questions: DistinctQuestion[] = [];

  if (!opts.mode) {
    questions.push({
      type: 'list',
      name: 'mode',
      message: 'Nx analysis mode:',
      choices: [
        { name: 'Plan Ahead — designing a new product as Nx monorepo', value: 'plan-ahead' },
        { name: 'Migration — converting an existing product to Nx', value: 'migration' },
      ],
    });
  }

  if (!opts.name) {
    questions.push({
      type: 'input',
      name: 'name',
      message: 'Product name:',
      validate: (v: string) => v.length > 0 || 'Product name is required',
    });
  }

  if (!opts.description) {
    questions.push({
      type: 'input',
      name: 'description',
      message: 'Product description:',
      validate: (v: string) => v.length > 0 || 'Description is required',
    });
  }

  if (!opts.ecosystem) {
    questions.push({
      type: 'list',
      name: 'ecosystem',
      message: 'Primary ecosystem:',
      choices: [
        { name: 'Java — Quarkus, Maven/Gradle', value: 'java' },
        { name: '.NET — ASP.NET Core, C#, dotnet toolchain', value: 'dotnet' },
        { name: 'Desktop — Tauri, Rust, native + web', value: 'desktop' },
        { name: 'Frontend — React, Vite, TypeScript', value: 'frontend' },
        { name: 'Mixed — multiple ecosystems in one workspace', value: 'mixed' },
      ],
    });
  }

  const prompted = questions.length > 0
    ? await inquirer.prompt(questions)
    : ({} as Record<string, unknown>);

  return {
    mode: (opts.mode as NxMode) ?? prompted.mode as NxMode,
    name: (opts.name as string) ?? prompted.name as string,
    description: (opts.description as string) ?? prompted.description as string,
    ecosystem: (opts.ecosystem as NxEcosystem) ?? prompted.ecosystem as NxEcosystem,
  };
}

async function buildInput(answers: PromptAnswers, opts: Record<string, unknown>): Promise<NxAnalysisInput> {
  const input: NxAnalysisInput = {
    mode: answers.mode,
    productName: answers.name,
    description: answers.description,
    ecosystem: answers.ecosystem,
  };

  if (answers.mode === 'plan-ahead') {
    const projectDetails = await promptPlanAhead(opts);
    input.intendedProjects = projectDetails.projects;
    input.scalePrediction = projectDetails.scale;
  } else {
    const migrationDetails = await promptMigration(opts);
    input.currentStructure = migrationDetails.structure;
    input.knownPainPoints = migrationDetails.painPoints;
  }

  return input;
}

async function promptPlanAhead(opts: Record<string, unknown>): Promise<{
  projects: NxProjectIntent[];
  scale: NxScalePrediction;
}> {
  // Parse CLI project list if provided
  const cliProjects = opts.projects
    ? String(opts.projects).split(',').map((name) => name.trim()).filter(Boolean)
    : [];

  let projectNames = cliProjects;

  if (projectNames.length === 0) {
    const { projectList } = await inquirer.prompt([{
      type: 'input',
      name: 'projectList',
      message: 'List intended projects (comma-separated, e.g. web-app, order-api, shared-lib):',
      validate: (v: string) => v.trim().length > 0 || 'At least one project is needed',
    }]);
    projectNames = String(projectList).split(',').map((n: string) => n.trim()).filter(Boolean);
  }

  const projects: NxProjectIntent[] = [];
  for (const name of projectNames) {
    const { type, technology } = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: `${name} — project type:`,
        choices: [
          { name: 'App — deployable application or service', value: 'app' },
          { name: 'Lib — shared library or module', value: 'lib' },
          { name: 'Tool — internal tooling, scripts, or generators', value: 'tool' },
          { name: 'Spec — planning assets, docs, or specs', value: 'spec' },
        ],
      },
      {
        type: 'input',
        name: 'technology',
        message: `${name} — technology (e.g. java, react, rust):`,
        default: 'java',
      },
    ]);
    projects.push({ name, type, technology, description: `${type}: ${name}` });
  }

  const scaleAnswers = await inquirer.prompt([
    {
      type: 'number',
      name: 'expectedApps',
      message: 'Expected number of apps (1-year horizon):',
      default: projects.filter((p) => p.type === 'app').length || 2,
    },
    {
      type: 'number',
      name: 'expectedLibs',
      message: 'Expected number of shared libraries:',
      default: projects.filter((p) => p.type === 'lib').length || 1,
    },
    {
      type: 'number',
      name: 'expectedTeamSize',
      message: 'Expected team size:',
      default: 3,
    },
    {
      type: 'confirm',
      name: 'multiLanguage',
      message: 'Will the workspace include multiple languages/platforms?',
      default: false,
    },
    {
      type: 'confirm',
      name: 'sharedCodeNeeded',
      message: 'Will projects share common code (contracts, models, utils)?',
      default: true,
    },
    {
      type: 'list',
      name: 'ciComplexity',
      message: 'Expected CI/CD complexity:',
      choices: [
        { name: 'Low — simple build and deploy', value: 'low' },
        { name: 'Medium — multiple services, staged deployment', value: 'medium' },
        { name: 'High — many services, complex pipelines, multiple environments', value: 'high' },
      ],
    },
  ]);

  return {
    projects,
    scale: {
      expectedApps: scaleAnswers.expectedApps as number,
      expectedLibs: scaleAnswers.expectedLibs as number,
      expectedTeamSize: scaleAnswers.expectedTeamSize as number,
      multiLanguage: scaleAnswers.multiLanguage as boolean,
      sharedCodeNeeded: scaleAnswers.sharedCodeNeeded as boolean,
      ciComplexity: scaleAnswers.ciComplexity as 'low' | 'medium' | 'high',
    },
  };
}

async function promptMigration(opts: Record<string, unknown>): Promise<{
  structure: { rootPath: string; projects: NxExistingProject[]; sharedAssets: string[]; buildCommands: Record<string, string> };
  painPoints: string[];
}> {
  const { rootPath } = await inquirer.prompt([{
    type: 'input',
    name: 'rootPath',
    message: 'Current repository root path:',
    default: '.',
  }]);

  const { projectList } = await inquirer.prompt([{
    type: 'input',
    name: 'projectList',
    message: 'List existing projects/services (comma-separated):',
    validate: (v: string) => v.trim().length > 0 || 'At least one project is needed',
  }]);

  const projectNames = String(projectList).split(',').map((n: string) => n.trim()).filter(Boolean);
  const projects: NxExistingProject[] = [];

  for (const name of projectNames) {
    const { projectPath, type, technology, buildTool } = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectPath',
        message: `${name} — current path (relative to repo root):`,
        default: name,
      },
      {
        type: 'list',
        name: 'type',
        message: `${name} — project type:`,
        choices: [
          { name: 'App — deployable application or service', value: 'app' },
          { name: 'Lib — shared library or module', value: 'lib' },
          { name: 'Tool — internal tooling', value: 'tool' },
          { name: 'Unknown — unclear or mixed', value: 'unknown' },
        ],
      },
      {
        type: 'input',
        name: 'technology',
        message: `${name} — technology:`,
        default: 'java',
      },
      {
        type: 'input',
        name: 'buildTool',
        message: `${name} — build tool (maven, gradle, npm, etc.):`,
        default: 'maven',
      },
    ]);
    projects.push({ name, path: projectPath as string, type, technology, buildTool });
  }

  const { sharedAssetList } = await inquirer.prompt([{
    type: 'input',
    name: 'sharedAssetList',
    message: 'Shared assets or directories (comma-separated, or blank):',
    default: '',
  }]);
  const sharedAssets = String(sharedAssetList).split(',').map((s: string) => s.trim()).filter(Boolean);

  // Pain points
  const cliPainPoints = opts.painPoints
    ? String(opts.painPoints).split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  let painPoints = cliPainPoints;
  if (painPoints.length === 0) {
    const { painPointList } = await inquirer.prompt([{
      type: 'input',
      name: 'painPointList',
      message: 'Known pain points (comma-separated, or blank):',
      default: '',
    }]);
    painPoints = String(painPointList).split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  return {
    structure: {
      rootPath: rootPath as string,
      projects,
      sharedAssets,
      buildCommands: {},
    },
    painPoints,
  };
}
