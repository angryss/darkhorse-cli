import { Command } from 'commander';
import path from 'node:path';
import { logger } from '../core/logger.js';
import { readConfig, configExists } from '../core/config.js';
import { fsUtil } from '../core/index.js';

const KIRO_STEERING_FILES = [
  '00-project.md',
  '01-workflow.md',
  '02-architecture.md',
  '03-tooling.md',
];

export function registerValidateCommand(program: Command): void {
  program
    .command('validate')
    .description('Validate project specs and architecture compliance')
    .option('-p, --path <path>', 'Project path', '.')
    .action(async (opts) => {
      const projectRoot = path.resolve(opts.path as string);

      if (!(await configExists(projectRoot))) {
        logger.error(`No .darkhorse.yaml found at: ${projectRoot}`);
        logger.info('Run `darkhorse-java init` first to initialize a project.');
        process.exit(1);
      }

      const config = await readConfig(projectRoot);
      let hasErrors = false;

      logger.header('DarkHorse Java — Validate Project');
      logger.blank();

      // --- OpenSpec structure ---
      logger.step('Checking OpenSpec structure...');
      const openspecChecks = [
        { path: path.join(config.paths.openspec, 'AGENTS.md'), label: 'openspec/AGENTS.md' },
        { path: path.join(config.paths.openspec, 'specs', 'architecture'), label: 'openspec/specs/architecture/' },
        { path: path.join(config.paths.openspec, 'specs', 'workflow', 'skills'), label: 'openspec/specs/workflow/skills/' },
      ];
      for (const check of openspecChecks) {
        if (!(await fsUtil.pathExists(check.path))) {
          logger.error(`  Missing: ${check.label}`);
          hasErrors = true;
        } else {
          logger.success(`  OK: ${check.label}`);
        }
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
          if (!(await fsUtil.pathExists(check.path))) {
            logger.error(`  Missing: ${check.label}`);
            logger.info(`    Fix: darkhorse-java ai sync --tools copilot`);
            hasErrors = true;
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
          if (!(await fsUtil.pathExists(filePath))) {
            logger.error(`  Missing: .kiro/steering/${filename}`);
            logger.info(`    Fix: darkhorse-java ai sync --tools kiro`);
            hasErrors = true;
          } else {
            logger.success(`  OK: .kiro/steering/${filename}`);
          }
        }
      } else {
        logger.info('Kiro not enabled (ai.tools.kiro = false). Run `darkhorse-java ai sync --tools kiro` to add Kiro support.');
      }

      logger.blank();
      if (hasErrors) {
        logger.error('Validation failed. See errors above.');
        process.exit(1);
      } else {
        logger.success('All checks passed.');
      }
    });
}

