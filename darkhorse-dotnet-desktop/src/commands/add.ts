import { Command } from 'commander';
import inquirer, { type DistinctQuestion } from 'inquirer';
import path from 'node:path';
import { logger } from '../core/logger.js';
import { type FeatureArchetype, FEATURE_ARCHETYPE_LABELS, buildFeatureConfig } from '../core/types.js';
import { readConfig, configExists } from '../core/config.js';
import { addAgent } from '../agents/add.agent.js';

const VALID_ARCHETYPES: FeatureArchetype[] = ['crud', 'event-driven', 'service-integration'];

export function registerAddCommand(program: Command): void {
  program
    .command('add')
    .description('Add a bounded context (feature module) to the current WPF project')
    .option('-c, --context <name>', 'Bounded context name (PascalCase, e.g. OrderManagement)')
    .option('-t, --type <archetype>', 'Feature archetype: crud | event-driven | service-integration')
    .option('-p, --project <dir>', 'Project root directory (default: cwd)', '.')
    .action(async (opts) => {
      logger.header('DarkHorse .NET Desktop — Add Bounded Context');
      logger.blank();

      const projectRoot = path.resolve(opts.project);
      if (!(await configExists(projectRoot))) {
        logger.error('No .darkhorse.yaml found. Run `darkhorse-dotnet-desktop init` first.');
        process.exit(1);
      }

      if (opts.type && !VALID_ARCHETYPES.includes(opts.type as FeatureArchetype)) {
        logger.error(`Invalid type: "${opts.type}". Must be one of: ${VALID_ARCHETYPES.join(', ')}`);
        process.exit(1);
      }

      const answers = await promptMissing(opts);
      const projectConfig = await readConfig(projectRoot);
      const featureConfig = buildFeatureConfig(
        { archetype: answers.archetype, contextName: answers.contextName, projectRoot },
        projectConfig,
      );

      await addAgent(featureConfig, answers.contextName, answers.archetype);
    });
}

// ---------------------------------------------------------------------------
// Interactive prompts
// ---------------------------------------------------------------------------

interface PromptAnswers {
  contextName: string;
  archetype: FeatureArchetype;
}

async function promptMissing(opts: Record<string, unknown>): Promise<PromptAnswers> {
  const questions: DistinctQuestion[] = [];

  if (!opts.context) {
    questions.push({
      type: 'input',
      name: 'contextName',
      message: 'Bounded context name (PascalCase, e.g. OrderManagement):',
      validate: (v: string) =>
        /^[A-Z][a-zA-Z0-9]*$/.test(v) || 'PascalCase name required (e.g. OrderManagement)',
    });
  }

  if (!opts.type) {
    questions.push({
      type: 'list',
      name: 'archetype',
      message: 'Feature archetype:',
      choices: VALID_ARCHETYPES.map((a) => ({ name: FEATURE_ARCHETYPE_LABELS[a], value: a })),
    });
  }

  const prompted = questions.length > 0
    ? await inquirer.prompt(questions)
    : ({} as Record<string, unknown>);

  return {
    contextName: (opts.context ?? prompted.contextName) as string,
    archetype: ((opts.type ?? prompted.archetype) as FeatureArchetype) ?? 'crud',
  };
}
