import { Command } from 'commander';
import inquirer, { type DistinctQuestion } from 'inquirer';
import path from 'node:path';
import { logger } from '../core/logger.js';
import { type InitInput, type FrontendPlatform, buildConfig } from '../core/types.js';
import { initAgent } from '../agents/init.agent.js';
import { fsUtil } from '../core/index.js';

const VALID_PLATFORMS: FrontendPlatform[] = ['web', 'mobile', 'both'];

export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('Initialize a new DarkHorse .NET workspace')
    .option('-n, --name <name>', 'Project name')
    .option('-d, --description <description>', 'Project description')
    .option('-ns, --namespace <namespace>', 'Workspace namespace (default: PascalCase of name)')
    .option('--frontend', 'Include React frontend scaffold')
    .option('--no-frontend', 'Skip frontend')
    .option('--platform <platform>', 'Frontend platform: web, mobile, or both')
    .option('-o, --output <dir>', 'Output directory', '.')
    .action(async (opts) => {
      logger.header('DarkHorse .NET — Initialize Workspace');
      logger.blank();

      if (opts.platform && !VALID_PLATFORMS.includes(opts.platform)) {
        logger.error(`Invalid platform: "${opts.platform}". Must be one of: ${VALID_PLATFORMS.join(', ')}`);
        process.exit(1);
      }

      const answers = await promptMissing(opts);
      const input: InitInput = {
        name: answers.name,
        description: answers.description,
        namespace: answers.namespace,
        includeFrontend: answers.includeFrontend,
        frontendPlatform: answers.frontendPlatform,
        outputDir: path.resolve(answers.output),
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
  namespace?: string;
  includeFrontend: boolean;
  frontendPlatform: FrontendPlatform;
  output: string;
}

async function promptMissing(opts: Record<string, unknown>): Promise<PromptAnswers> {
  const questions: DistinctQuestion[] = [];

  if (!opts.name) {
    questions.push({
      type: 'input',
      name: 'name',
      message: 'Workspace name:',
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
    namespace: (opts.namespace as string) ?? undefined,
    includeFrontend,
    frontendPlatform,
    output: (opts.output as string) ?? '.',
  };
}
