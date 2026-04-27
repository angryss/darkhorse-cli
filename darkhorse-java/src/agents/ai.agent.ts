import path from 'node:path';
import { logger } from '../core/logger.js';
import type { DarkhorseConfig, SkillResult, TemplateContext } from '../core/types.js';
import { ARCHETYPE_CATEGORIES } from '../core/types.js';
import { seedKiroSteering, seedKiroPrompts } from '../skills/openspec.js';
import { TemplateEngine } from '../core/template-engine.js';
import { getTemplatesDir, getWorkflowsDir } from '../skills/registry.js';
import { fsUtil } from '../core/index.js';

/**
 * AI Sync Agent — adds or refreshes AI tool adapter files without touching
 * code, OpenSpec specs, or any other generated project files.
 */
export async function aiSyncAgent(
  config: DarkhorseConfig,
  tools: string[],
  force: boolean,
): Promise<SkillResult> {
  const filesCreated: string[] = [];
  const errors: string[] = [];

  const engine = new TemplateEngine(getTemplatesDir());
  const ctx: TemplateContext = {
    project: config,
    archetypeCategory: ARCHETYPE_CATEGORIES[config.archetype],
    timestamp: new Date().toISOString().split('T')[0],
    cliVersion: '0.1.0',
  };

  try {
    if (tools.includes('kiro')) {
      logger.step('Syncing Kiro steering files...');
      const kiroFiles = await seedKiroSteering(config, engine, ctx, force);
      filesCreated.push(...kiroFiles);
      const kiroPrompts = await seedKiroPrompts(config, engine, ctx, force);
      filesCreated.push(...kiroPrompts);
      if (kiroFiles.length === 0 && kiroPrompts.length === 0) {
        logger.info('  Kiro: all steering and prompt files already present.');
      } else {
        logger.success(`  Kiro: created ${kiroFiles.length + kiroPrompts.length} file(s) in .kiro/`);
      }
    }

    if (tools.includes('copilot')) {
      logger.step('Syncing Copilot adapter files...');
      const copilotFiles = await syncCopilotAdapter(config, engine, ctx, force);
      filesCreated.push(...copilotFiles);
      if (copilotFiles.length === 0) {
        logger.info('  Copilot: all adapter files already present.');
      } else {
        logger.success(`  Copilot: created ${copilotFiles.length} file(s) in .github/`);
      }
    }
  } catch (err) {
    errors.push(`AI sync error: ${err instanceof Error ? err.message : String(err)}`);
  }

  return { success: errors.length === 0, filesCreated, filesModified: [], errors };
}

// ---------------------------------------------------------------------------
// Copilot adapter sync
// ---------------------------------------------------------------------------

async function syncCopilotAdapter(
  config: DarkhorseConfig,
  engine: TemplateEngine,
  ctx: TemplateContext,
  force: boolean,
): Promise<string[]> {
  const created: string[] = [];
  const root = config.paths.root;

  const githubAgentsDir = path.join(root, '.github', 'agents');
  await fsUtil.ensureDir(githubAgentsDir);
  const agentFiles = await syncMarkdownDir(path.join(getWorkflowsDir(), 'agents'), githubAgentsDir, force);
  created.push(...agentFiles);

  const promptsDir = path.join(root, '.github', 'prompts');
  await fsUtil.ensureDir(promptsDir);
  const promptFiles = await syncMarkdownDir(path.join(getWorkflowsDir(), 'commands'), promptsDir, force);
  created.push(...promptFiles);

  const copilotInstructions = path.join(root, '.github', 'copilot-instructions.md');
  const alreadyExists = await fsUtil.pathExists(copilotInstructions);
  if (!alreadyExists || force) {
    await engine.render('github/copilot-instructions.md.hbs', ctx, copilotInstructions);
    created.push(copilotInstructions);
  }

  return created;
}

async function syncMarkdownDir(srcDir: string, destDir: string, force: boolean): Promise<string[]> {
  const synced: string[] = [];
  try {
    const { readdir } = await import('node:fs/promises');
    const entries = await readdir(srcDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.md')) {
        const dest = path.join(destDir, entry.name);
        const alreadyExists = await fsUtil.pathExists(dest);
        if (!alreadyExists || force) {
          await fsUtil.copyFile(path.join(srcDir, entry.name), dest);
          synced.push(dest);
        }
      }
    }
  } catch {
    // Source directory may not exist — non-fatal
  }
  return synced;
}
