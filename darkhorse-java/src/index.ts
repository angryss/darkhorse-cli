#!/usr/bin/env node

import { Command } from 'commander';
import { registerInitCommand } from './commands/init.js';
import { registerDiscoverCommand } from './commands/discover.js';
import { registerPlanCommand } from './commands/plan.js';
import { registerImplementCommand } from './commands/implement.js';
import { registerTroubleshootCommand } from './commands/troubleshoot.js';
import { registerValidateCommand } from './commands/validate.js';
import { registerNxMonorepoCommand } from './commands/nx-monorepo.js';
import { registerMcpCommand } from './commands/mcp-serve.js';
import { setVerbose } from './core/logger.js';

const program = new Command();

program
  .name('darkhorse-java')
  .description('Opinionated Java project scaffolding — DDD, Quarkus, Clean Architecture')
  .version('0.1.0')
  .option('--verbose', 'Enable verbose logging')
  .hook('preAction', (thisCommand) => {
    const opts = thisCommand.optsWithGlobals();
    if (opts.verbose) setVerbose(true);
  });

registerInitCommand(program);
registerDiscoverCommand(program);
registerPlanCommand(program);
registerImplementCommand(program);
registerTroubleshootCommand(program);
registerValidateCommand(program);
registerNxMonorepoCommand(program);
registerMcpCommand(program);

program.parse();
