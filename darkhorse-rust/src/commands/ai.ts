import { Command } from 'commander';
import path from 'node:path';
import { logger } from '../core/logger.js';
import { readConfig, writeConfig, configExists } from '../core/config.js';
import { aiSyncAgent } from '../agents/ai.agent.js';

export function registerAiCommand(program: Command): void {
  const ai = program
    .command('ai')
    .description('Manage AI tool adapters for the project');

  ai
    .command('sync')
    .description('Add or refresh AI tool adapter files (Kiro steering, Copilot instructions)')
    .option('-p, --path <path>', 'Project root path', '.')
    .option('--tools <tools>', 'Comma-separated list of tools to sync: copilot, kiro', 'kiro')
    .option('--force', 'Overwrite existing adapter files (use this to refresh templates)', false)
    .action(async (opts) => {
      const projectRoot = path.resolve(opts.path as string);

      if (!(await configExists(projectRoot))) {
        logger.error(`No .darkhorse.yaml found at: ${projectRoot}`);
        logger.info('Run `darkhorse-rust init` first to initialize a project.');
        process.exit(1);
      }

      const config = await readConfig(projectRoot);

      const requestedTools = (opts.tools as string)
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const validTools = ['copilot', 'kiro'];
      const invalidTools = requestedTools.filter((t) => !validTools.includes(t));
      if (invalidTools.length > 0) {
        logger.error(`Unknown tool(s): ${invalidTools.join(', ')}. Valid options: ${validTools.join(', ')}`);
        process.exit(1);
      }

      // Update config flags for requested tools
      if (requestedTools.includes('copilot')) config.ai.tools.copilot = true;
      if (requestedTools.includes('kiro')) config.ai.tools.kiro = true;

      logger.header('DarkHorse Rust — AI Sync');
      logger.blank();
      logger.info(`Project:  ${config.name}`);
      logger.info(`Tools:    ${requestedTools.join(', ')}`);
      logger.info(`Force:    ${opts.force ? 'yes (overwrite existing files)' : 'no (skip existing files)'}`);
      logger.blank();

      const result = await aiSyncAgent(config, requestedTools, opts.force as boolean);

      if (result.success) {
        await writeConfig(config);

        if (result.filesCreated.length > 0) {
          logger.success(`Created ${result.filesCreated.length} file(s):`);
          for (const f of result.filesCreated) {
            logger.step(path.relative(projectRoot, f));
          }
        } else {
          logger.info('All adapter files already exist. Use --force to overwrite.');
        }
        logger.blank();
        logger.success('AI sync complete.');
      } else {
        for (const err of result.errors) {
          logger.error(err);
        }
        process.exit(1);
      }
    });
}
