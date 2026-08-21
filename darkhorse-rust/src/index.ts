#!/usr/bin/env node

import { Command } from 'commander';
import { registerInitCommand } from './commands/init.js';
import { registerDiscoverCommand } from './commands/discover.js';
import { registerPlanCommand } from './commands/plan.js';
import { registerImplementCommand } from './commands/implement.js';
import { registerTestCommand } from './commands/test.js';
import { registerReviewCommand } from './commands/review.js';
import { registerCloseCommand } from './commands/close.js';
import { registerTroubleshootCommand } from './commands/troubleshoot.js';
import { registerValidateCommand } from './commands/validate.js';
import { registerMcpCommand } from './commands/mcp-serve.js';
import { registerAiCommand } from './commands/ai.js';
import { setVerbose } from './core/logger.js';

const program = new Command();

program
  .name('darkhorse-rust')
  .description('Scaffold Rust/Tauri desktop projects with the full DarkHorse development guidance system')
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
registerTestCommand(program);
registerReviewCommand(program);
registerCloseCommand(program);
registerTroubleshootCommand(program);
registerValidateCommand(program);
registerMcpCommand(program);
registerAiCommand(program);

program.parse();
