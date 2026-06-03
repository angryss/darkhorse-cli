import { Command } from 'commander';
import path from 'node:path';
import { logger } from '../core/logger.js';
import { readConfig, configExists } from '../core/config.js';
import { validateScaffold } from '../skills/validation.js';
import { pathExists } from '../core/fs.js';

const KIRO_STEERING_FILES = [
  '00-project.md',
  '01-workflow.md',
  '02-architecture.md',
  '03-tooling.md',
];

export function registerValidateCommand(program: Command): void {
  program
    .command('validate')
    .description('Validate project structure and architecture compliance')
    .argument('[dir]', 'Project directory to validate', '.')
    .action(async (dir: string) => {
      const projectRoot = dir === '.' ? process.cwd() : dir;

      if (!(await configExists(projectRoot))) {
        logger.error('No .darkhorse.yaml found - is this a DarkHorse project?');
        process.exitCode = 1;
        return;
      }

      const config = await readConfig(projectRoot);
      logger.header(`Validating project: ${config.name}`);

      // --- Scaffold validation ---
      const result = await validateScaffold(config);

      if (result.success) {
        logger.success('Project structure is valid — no defects found.');
      } else {
        logger.error(`Found ${result.errors.length} validation error(s):`);
        for (const err of result.errors) {
          logger.warn(`  ${err}`);
        }
        process.exitCode = 1;
      }

      // --- Copilot adapter ---
      if (config.ai.tools.copilot) {
        logger.step('Checking Copilot adapter...');
        const copilotChecks = [
          { path: path.join(projectRoot, '.github', 'copilot-instructions.md'), label: '.github/copilot-instructions.md' },
          { path: path.join(projectRoot, '.github', 'agents'), label: '.github/agents/' },
          { path: path.join(projectRoot, '.github', 'prompts'), label: '.github/prompts/' },
        ];
        for (const check of copilotChecks) {
          if (!(await pathExists(check.path))) {
            logger.error(`  Missing: ${check.label}`);
            logger.info(`    Fix: darkhorse-rust ai sync --tools copilot`);
            if (process.exitCode !== 1) process.exitCode = 1;
          } else {
            logger.success(`  OK: ${check.label}`);
          }
        }
      }

      // --- Kiro adapter ---
      if (config.ai.tools.kiro) {
        logger.step('Checking Kiro steering files...');
        const steeringDir = path.join(projectRoot, '.kiro', 'steering');
        for (const filename of KIRO_STEERING_FILES) {
          const filePath = path.join(steeringDir, filename);
          if (!(await pathExists(filePath))) {
            logger.error(`  Missing: .kiro/steering/${filename}`);
            logger.info(`    Fix: darkhorse-rust ai sync --tools kiro`);
            if (process.exitCode !== 1) process.exitCode = 1;
          } else {
            logger.success(`  OK: .kiro/steering/${filename}`);
          }
        }
      } else {
        logger.info('Kiro not enabled. Run `darkhorse-rust ai sync --tools kiro` to add Kiro support.');
      }
    });
}

