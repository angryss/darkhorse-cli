import { Command } from 'commander';
import inquirer, { type DistinctQuestion } from 'inquirer';
import path from 'node:path';
import { logger } from '../core/logger.js';
import { type InitInput, type ProjectArchetype, type FrontendPlatform, type AiToolsConfig, ARCHETYPE_LABELS, buildConfig } from '../core/types.js';
import { initAgent } from '../agents/init.agent.js';
import { fsUtil } from '../core/index.js';

const VALID_ARCHETYPES: ProjectArchetype[] = ['api', 'bff-api', 'microservice'];

const VALID_PLATFORMS: FrontendPlatform[] = ['web', 'mobile', 'both'];

export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('Scaffold a new DarkHorse Java project')
    .option('-t, --type <type>', 'Project archetype: api, bff-api, microservice')
    .option('-n, --name <name>', 'Project name')
    .option('-d, --description <description>', 'Project description')
    .option('-g, --group-id <groupId>', 'Maven group ID')
    .option('-j, --java-version <version>', 'Java version (17 or 21)', '21')
    .option('--frontend', 'Include frontend application')
    .option('--no-frontend', 'Skip frontend')
    .option('--platform <platform>', 'Frontend platform: web (React), mobile (React Native), or both')
    .option('--kiro', 'Generate Kiro steering files (.kiro/steering/)')
    .option('--no-kiro', 'Skip Kiro steering files')
    .option('-o, --output <dir>', 'Output directory', '.')
    .action(async (opts) => {
      logger.header('DarkHorse Java — Project Init');
      logger.blank();

      // Validate --type if provided via flag
      if (opts.type && !VALID_ARCHETYPES.includes(opts.type)) {
        logger.error(`Invalid archetype: "${opts.type}". Must be one of: ${VALID_ARCHETYPES.join(', ')}`);
        process.exit(1);
      }

      // Validate --platform if provided via flag
      if (opts.platform && !VALID_PLATFORMS.includes(opts.platform)) {
        logger.error(`Invalid platform: "${opts.platform}". Must be one of: ${VALID_PLATFORMS.join(', ')}`);
        process.exit(1);
      }

      const answers = await promptMissing(opts);
      const input: InitInput = {
        name: answers.name,
        description: answers.description,
        groupId: answers.groupId,
        javaVersion: answers.javaVersion as 17 | 21,
        archetype: answers.archetype,
        includeFrontend: answers.includeFrontend,
        frontendPlatform: answers.frontendPlatform,
        includeToolkit: answers.includeFrontend, // toolkit included when frontend is
        outputDir: path.resolve(answers.output),
        aiTools: { copilot: true, kiro: opts.kiro === true },
      };

      const projectDir = path.join(input.outputDir, input.name);
      if (await fsUtil.pathExists(projectDir)) {
        logger.error(`Directory already exists: ${projectDir}`);
        process.exit(1);
      }

      const config = buildConfig(input);
      await initAgent(config);
    });
}

// ---------------------------------------------------------------------------
// Interactive prompts for missing options
// ---------------------------------------------------------------------------

interface PromptAnswers {
  name: string;
  description: string;
  groupId: string;
  javaVersion: number;
  archetype: ProjectArchetype;
  includeFrontend: boolean;
  frontendPlatform: FrontendPlatform;
  output: string;
}

async function promptMissing(opts: Record<string, unknown>): Promise<PromptAnswers> {
  const questions: DistinctQuestion[] = [];

  if (!opts.type) {
    questions.push({
      type: 'list',
      name: 'archetype',
      message: 'Project archetype:',
      choices: VALID_ARCHETYPES.map((a) => ({ name: ARCHETYPE_LABELS[a], value: a })),
    });
  }

  if (!opts.name) {
    questions.push({
      type: 'input',
      name: 'name',
      message: 'Project name:',
      validate: (v: string) => /^[a-z][a-z0-9-]*$/.test(v) || 'lowercase alphanumeric with hyphens',
    });
  }

  if (!opts.description) {
    questions.push({
      type: 'input',
      name: 'description',
      message: 'Project description:',
      validate: (v: string) => v.length > 0 || 'Description is required',
    });
  }

  if (!opts.groupId) {
    questions.push({
      type: 'input',
      name: 'groupId',
      message: 'Maven group ID (e.g. com.example):',
      default: 'com.darkhorse',
      validate: (v: string) =>
        /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)*$/.test(v) || 'Valid Java package name required',
    });
  }

  if (opts.frontend === undefined) {
    questions.push({
      type: 'confirm',
      name: 'includeFrontend',
      message: 'Include React frontend?',
      default: false,
    });
  }

  const prompted = questions.length > 0
    ? await inquirer.prompt(questions)
    : ({} as Record<string, unknown>);

  const includeFrontend = opts.frontend !== undefined ? Boolean(opts.frontend) : (prompted.includeFrontend as boolean ?? false);

  // Prompt for platform if frontend is enabled and --platform not provided
  let frontendPlatform: FrontendPlatform = 'web';
  if (includeFrontend && !opts.platform) {
    const platformAnswer = await inquirer.prompt([{
      type: 'list',
      name: 'frontendPlatform',
      message: 'Frontend platform:',
      choices: [
        { name: 'Web — React + Vite', value: 'web' },
        { name: 'Mobile — React Native + Expo', value: 'mobile' },
        { name: 'Both — Web + Mobile', value: 'both' },
      ],
    }]);
    frontendPlatform = platformAnswer.frontendPlatform as FrontendPlatform;
  } else if (opts.platform) {
    frontendPlatform = opts.platform as FrontendPlatform;
  }

  return {
    name: (opts.name as string) ?? prompted.name as string,
    description: (opts.description as string) ?? prompted.description as string,
    groupId: (opts.groupId as string) ?? prompted.groupId as string,
    javaVersion: Number(opts.javaVersion) || 21,
    archetype: (opts.type as ProjectArchetype) ?? prompted.archetype as ProjectArchetype,
    includeFrontend,
    frontendPlatform,
    output: (opts.output as string) ?? '.',
  };
}
