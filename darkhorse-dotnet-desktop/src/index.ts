#!/usr/bin/env node

import { Command } from 'commander';
import { registerInitCommand } from './commands/init.js';
import { registerAddCommand } from './commands/add.js';
import { registerDiscoverCommand } from './commands/discover.js';
import { registerPlanCommand } from './commands/plan.js';
import { registerImplementCommand } from './commands/implement.js';
import { registerTroubleshootCommand } from './commands/troubleshoot.js';
import { registerValidateCommand } from './commands/validate.js';
import { registerMcpCommand } from './commands/mcp-serve.js';
import { registerDeployCommand } from './commands/deploy.js';
import { setVerbose } from './core/logger.js';

const program = new Command();

program
  .name('darkhorse-dotnet-desktop')
  .description('Opinionated WPF desktop project scaffolding CLI — DDD, Onion Architecture, CQRS, MVVM')
  .version('0.1.0')
  .option('--verbose', 'Enable verbose logging')
  .hook('preAction', (thisCommand) => {
    const opts = thisCommand.optsWithGlobals();
    if (opts.verbose) setVerbose(true);
  });

registerInitCommand(program);
registerAddCommand(program);
registerDiscoverCommand(program);
registerPlanCommand(program);
registerImplementCommand(program);
registerTroubleshootCommand(program);
registerValidateCommand(program);
registerMcpCommand(program);
registerDeployCommand(program);

program.parse();
