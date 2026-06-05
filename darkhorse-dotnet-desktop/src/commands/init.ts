import { Command } from 'commander';
import inquirer, { type DistinctQuestion } from 'inquirer';
import path from 'node:path';
import { logger } from '../core/logger.js';
import {
  type InitInput,
  type UiFramework,
  type DotnetVersion,
  type AiToolsConfig,
  type CiCdProvider,
  UI_FRAMEWORK_LABELS,
  CICD_PROVIDER_LABELS,
  buildConfig,
} from '../core/types.js';
import { fsUtil } from '../core/index.js';
import { initAgent } from '../agents/init.agent.js';

const VALID_UI_FRAMEWORKS: UiFramework[] = ['materialdesign', 'fluent'];
const VALID_DOTNET_VERSIONS: DotnetVersion[] = [8, 9];
const VALID_CICD_PROVIDERS: CiCdProvider[] = ['github-actions', 'ado', 'none'];

export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('Initialize a new DarkHorse WPF desktop project')
    .option('-n, --name <name>', 'Project name (kebab-case)')
    .option('-d, --description <description>', 'Project description')
    .option('-ns, --namespace <namespace>', 'Root C# namespace (default: PascalCase of name)')
    .option('--dotnet-version <version>', '.NET version (8 or 9)', '8')
    .option('--ui <framework>', 'UI framework: materialdesign | fluent', 'materialdesign')
    .option('--persistence', 'Include EF Core SQLite persistence')
    .option('--no-persistence', 'Skip persistence layer')
    .option('--cicd <provider>', 'CI/CD pipeline: github-actions | ado | none', 'none')
    .option('--ado-url <url>', 'Azure DevOps organization URL (required when --cicd=ado)')
    .option('--kiro', 'Generate Kiro steering + prompt files (.kiro/steering/ + .kiro/prompts/)')
    .option('--no-kiro', 'Skip Kiro files')
    .option('-o, --output <dir>', 'Output directory', '.')
    .action(async (opts) => {
      logger.header('DarkHorse .NET Desktop — Initialize WPF Project');
      logger.blank();

      const uiFramework = opts.ui as UiFramework;
      if (opts.ui && !VALID_UI_FRAMEWORKS.includes(uiFramework)) {
        logger.error(`Invalid UI framework: "${opts.ui}". Must be one of: ${VALID_UI_FRAMEWORKS.join(', ')}`);
        process.exit(1);
      }

      const dotnetVersionParsed = parseInt(opts.dotnetVersion, 10) as DotnetVersion;
      if (!VALID_DOTNET_VERSIONS.includes(dotnetVersionParsed)) {
        logger.error(`Invalid .NET version: "${opts.dotnetVersion}". Must be 8 or 9.`);
        process.exit(1);
      }

      const cicd = (opts.cicd ?? 'none') as CiCdProvider;
      if (!VALID_CICD_PROVIDERS.includes(cicd)) {
        logger.error(`Invalid CI/CD provider: "${opts.cicd}". Must be one of: ${VALID_CICD_PROVIDERS.join(', ')}`);
        process.exit(1);
      }

      if (cicd === 'ado' && !opts.adoUrl) {
        logger.error('--ado-url is required when --cicd=ado');
        process.exit(1);
      }

      const answers = await promptMissing(opts);
      const input: InitInput = {
        name: answers.name,
        description: answers.description,
        namespace: answers.namespace,
        dotnetVersion: dotnetVersionParsed,
        uiFramework: (answers.uiFramework ?? uiFramework) as UiFramework,
        persistence: answers.persistence,
        cicd: (answers.cicd ?? cicd) as CiCdProvider,
        adoOrgUrl: answers.adoOrgUrl ?? opts.adoUrl as string | undefined,
        outputDir: path.resolve(answers.output),
        aiTools: answers.aiTools,
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
  uiFramework?: UiFramework;
  persistence: boolean;
  cicd?: CiCdProvider;
  adoOrgUrl?: string;
  output: string;
  aiTools: Partial<AiToolsConfig>;
}

async function promptMissing(opts: Record<string, unknown>): Promise<PromptAnswers> {
  const questions: DistinctQuestion[] = [];

  if (!opts.name) {
    questions.push({
      type: 'input',
      name: 'name',
      message: 'Project name (kebab-case):',
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

  if (!opts.ui) {
    questions.push({
      type: 'list',
      name: 'uiFramework',
      message: 'WPF UI framework:',
      choices: VALID_UI_FRAMEWORKS.map((f) => ({ name: UI_FRAMEWORK_LABELS[f], value: f })),
      default: 'materialdesign',
    });
  }

  if (opts.persistence === undefined) {
    questions.push({
      type: 'confirm',
      name: 'persistence',
      message: 'Include EF Core SQLite persistence?',
      default: true,
    });
  }

  if (!opts.cicd || opts.cicd === 'none') {
    questions.push({
      type: 'list',
      name: 'cicd',
      message: 'CI/CD pipeline:',
      choices: VALID_CICD_PROVIDERS.map((p) => ({ name: CICD_PROVIDER_LABELS[p], value: p })),
      default: 'none',
    });
  }

  const prompted = questions.length > 0
    ? await inquirer.prompt(questions)
    : ({} as Record<string, unknown>);

  const resolvedCicd = (prompted.cicd ?? opts.cicd ?? 'none') as CiCdProvider;
  let adoOrgUrl: string | undefined = opts.adoUrl as string | undefined;

  // Follow-up: ADO org URL
  if (resolvedCicd === 'ado' && !adoOrgUrl) {
    const { url } = await inquirer.prompt<{ url: string }>([
      {
        type: 'input',
        name: 'url',
        message: 'Azure DevOps organization URL (e.g. https://dev.azure.com/myorg):',
        validate: (v: string) => v.startsWith('https://') || 'Must start with https://',
      },
    ]);
    adoOrgUrl = url;
  }

  return {
    name: (opts.name ?? prompted.name) as string,
    description: (opts.description ?? prompted.description) as string,
    namespace: opts.namespace as string | undefined,
    uiFramework: (prompted.uiFramework ?? opts.ui) as UiFramework | undefined,
    persistence: (opts.persistence ?? prompted.persistence ?? true) as boolean,
    cicd: resolvedCicd,
    adoOrgUrl,
    output: (opts.output ?? '.') as string,
    aiTools: {
      copilot: true,
      kiro: (opts.kiro ?? false) as boolean,
    },
  };
}
