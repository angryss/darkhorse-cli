// ──────────────────────────────────────────────────────────────────
// Skill: generateContext
// Generates the context/ AI navigation layer for the generated
// project — START-HERE, REPO-MAP, BOUNDED-CONTEXTS, SEARCH-QUERIES.
// ──────────────────────────────────────────────────────────────────

import path from 'node:path';
import type { DarkhorseConfig, SkillResult, TemplateContext } from '../core/types.js';
import { TemplateEngine } from '../core/template-engine.js';
import { ensureDir } from '../core/fs.js';
import { getTemplatesDir } from './registry.js';

export async function generateContext(config: DarkhorseConfig): Promise<SkillResult> {
  const filesCreated: string[] = [];
  const errors: string[] = [];
  const engine = new TemplateEngine(getTemplatesDir());
  const { context } = config.paths;

  const ctx: TemplateContext = {
    project: config,
    timestamp: new Date().toISOString().split('T')[0],
    cliVersion: '0.1.0',
  };

  try {
    await ensureDir(context);

    const contextFiles = [
      { template: 'context/00-START-HERE.md.hbs', output: '00-START-HERE.md' },
      { template: 'context/10-REPO-MAP.md.hbs', output: '10-REPO-MAP.md' },
      { template: 'context/30-BOUNDED-CONTEXTS.md.hbs', output: '30-BOUNDED-CONTEXTS.md' },
      { template: 'context/50-SEARCH-QUERIES.md.hbs', output: '50-SEARCH-QUERIES.md' },
    ];

    for (const file of contextFiles) {
      await engine.render(file.template, ctx, path.join(context, file.output));
      filesCreated.push(`context/${file.output}`);
    }
  } catch (err) {
    errors.push(`generateContext failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  return {
    success: errors.length === 0,
    filesCreated,
    filesModified: [],
    errors,
  };
}
