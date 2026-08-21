import { Command } from 'commander';
import { logger } from '../core/logger.js';
import { reportLifecycleBoundaryError, verifyApprovedImplementationA1 } from './validate.js';

export function registerImplementCommand(program: Command): void {
  program
    .command('implement')
    .description('Verify the approved canonical A1 before normal implementation work')
    .argument('<change-id>', 'Governed VEP change identifier')
    .option('--project-root <dir>', 'Generated project root', '.')
    .option('--json', 'Emit the non-transitioning implementation boundary result as JSON')
    .action(async (changeId: string, opts: { projectRoot: string; json?: boolean }) => {
      try {
        const verified = await verifyApprovedImplementationA1(opts.projectRoot, changeId);
        const result = {
          status: 'PASS',
          stage: 'IMPLEMENT',
          authority: 'APPROVED_A1',
          processAuthority: 'PROJECT_LOCAL_VISU',
          package: `${verified.packageName}@${verified.version}`,
          changeId: verified.changeId,
          projectRoot: verified.projectRoot,
          lifecycleTransition: false,
          nextAction: 'Implement only the approved A1 scope, then run the Darkhorse test command.',
        };
        if (opts.json) {
          process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
        } else {
          logger.success(`Approved A1 verified for ${verified.changeId}.`);
          logger.info('Implement only its authorized scope. No lifecycle transition was performed.');
          logger.info('Next: run the Darkhorse test command with the VEP proof input.');
        }
      } catch (error) {
        reportLifecycleBoundaryError(error);
        process.exitCode = 1;
      }
    });
}
