import { Command } from 'commander';
import { delegateProjectLocalVisu, reportLifecycleBoundaryError } from './validate.js';

export function registerCloseCommand(program: Command): void {
  program
    .command('close')
    .description('Delegate Close eligibility and lifecycle closure to project-local VEP')
    .argument('[visu-arguments...]', 'Arguments passed unchanged to project-local visu')
    .option('--project-root <dir>', 'Generated project root', '.')
    .allowUnknownOption(true)
    .allowExcessArguments(true)
    .action(async (visuArguments: string[], opts: { projectRoot: string }) => {
      try {
        process.exitCode = await delegateProjectLocalVisu(opts.projectRoot, 'close', visuArguments);
      } catch (error) {
        reportLifecycleBoundaryError(error);
        process.exitCode = 1;
      }
    });
}
