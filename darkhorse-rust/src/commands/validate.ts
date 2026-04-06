import { Command } from 'commander';
import { logger } from '../core/logger.js';
import { readConfig, configExists } from '../core/config.js';
import { validateScaffold } from '../skills/validation.js';

export function registerValidateCommand(program: Command): void {
  program
    .command('validate')
    .description('Validate project structure and architecture compliance')
    .argument('[dir]', 'Project directory to validate', '.')
    .action(async (dir: string) => {
      const projectRoot = dir === '.' ? process.cwd() : dir;

      if (!(await configExists(projectRoot))) {
        logger.error('No .darkhorse.yaml found — is this a Dark Horse project?');
        process.exitCode = 1;
        return;
      }

      const config = await readConfig(projectRoot);
      logger.header(`Validating project: ${config.name}`);

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
    });
}
