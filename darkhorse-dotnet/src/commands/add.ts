import { Command } from 'commander';
import inquirer, { type DistinctQuestion } from 'inquirer';
import path from 'node:path';
import { logger } from '../core/logger.js';
import {
  type AddInput,
  type ProjectArchetype,
  ARCHETYPE_LABELS,
  buildServiceConfig,
} from '../core/types.js';
import { readConfig, configExists } from '../core/config.js';
import { addAgent } from '../agents/add.agent.js';

const VALID_ARCHETYPES: ProjectArchetype[] = ['api', 'bff-api', 'microservice'];

export function registerAddCommand(program: Command): void {
  program
    .command('add [type]')
    .description('Add a service to the current DarkHorse workspace')
    .option('-n, --name <name>', 'Service name (e.g. order-api)')
    .option('-ns, --namespace <namespace>', 'Root namespace (e.g. MyCompany.Orders)')
    .option('--dotnet-version <version>', '.NET version (8 or 9)', '8')
    .option('-p, --project <dir>', 'Workspace root directory (default: cwd)', '.')
    .action(async (typeArg: string | undefined, opts) => {
      logger.header('DarkHorse .NET — Add Service');
      logger.blank();

      // Resolve project root
      const projectRoot = path.resolve(opts.project);
      if (!(await configExists(projectRoot))) {
        logger.error('No .darkhorse.yaml found. Run `darkhorse-dotnet init` first.');
        process.exit(1);
      }

      if (typeArg && !VALID_ARCHETYPES.includes(typeArg as ProjectArchetype)) {
        logger.error(`Invalid type: "${typeArg}". Must be one of: ${VALID_ARCHETYPES.join(', ')}`);
        process.exit(1);
      }

      const answers = await promptMissing(opts, typeArg);
      const projectConfig = await readConfig(projectRoot);

      const input: AddInput = {
        archetype: answers.archetype,
        name: answers.name,
        namespace: answers.namespace,
        dotnetVersion: answers.dotnetVersion as 8 | 9,
        projectRoot,
      };

      const serviceConfig = buildServiceConfig(input, projectConfig);
      await addAgent(serviceConfig);
    });
}

// ---------------------------------------------------------------------------
// Interactive prompts
// ---------------------------------------------------------------------------

interface PromptAnswers {
  archetype: ProjectArchetype;
  name: string;
  namespace: string;
  dotnetVersion: number;
}

async function promptMissing(opts: Record<string, unknown>, typeArg?: string): Promise<PromptAnswers> {
  const questions: DistinctQuestion[] = [];

  if (!typeArg) {
    questions.push({
      type: 'list',
      name: 'archetype',
      message: 'Service type:',
      choices: VALID_ARCHETYPES.map((a) => ({ name: ARCHETYPE_LABELS[a], value: a })),
    });
  }

  if (!opts.name) {
    questions.push({
      type: 'input',
      name: 'name',
      message: 'Service name (e.g. order-api):',
      validate: (v: string) => /^[a-z][a-z0-9-]*$/.test(v) || 'lowercase alphanumeric with hyphens',
    });
  }

  if (!opts.namespace) {
    questions.push({
      type: 'input',
      name: 'namespace',
      message: 'Root namespace (e.g. MyCompany.Orders):',
      validate: (v: string) =>
        /^[A-Z][a-zA-Z0-9]*(\.[A-Z][a-zA-Z0-9]*)*$/.test(v) || 'Valid C# namespace required',
    });
  }

  const prompted = questions.length > 0
    ? await inquirer.prompt(questions)
    : ({} as Record<string, unknown>);

  return {
    archetype: (typeArg as ProjectArchetype) ?? prompted.archetype as ProjectArchetype,
    name: (opts.name as string) ?? prompted.name as string,
    namespace: (opts.namespace as string) ?? prompted.namespace as string,
    dotnetVersion: Number(opts.dotnetVersion) || 8,
  };
}
