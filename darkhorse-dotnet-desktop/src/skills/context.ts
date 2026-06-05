import path from 'node:path';
import { TemplateEngine, type DarkhorseConfig, type SkillResult, type TemplateContext } from '../core/index.js';
import { getTemplatesDir } from './registry.js';

/**
 * Context skill — generates the context/ AI navigation layer.
 */
export async function generateContext(config: DarkhorseConfig): Promise<SkillResult> {
  const filesCreated: string[] = [];
  const errors: string[] = [];

  try {
    const engine = new TemplateEngine(getTemplatesDir());
    const ctx: TemplateContext = {
      project: config,
      timestamp: new Date().toISOString().split('T')[0],
      cliVersion: '0.1.0',
    };

    const contextDir = config.paths.context;

    const startHerePath = path.join(contextDir, '00-START-HERE.md');
    await engine.render('context/00-START-HERE.md.hbs', ctx, startHerePath);
    filesCreated.push(startHerePath);

    const repoMapPath = path.join(contextDir, '10-REPO-MAP.md');
    await engine.render('context/10-REPO-MAP.md.hbs', ctx, repoMapPath);
    filesCreated.push(repoMapPath);

    const bcPath = path.join(contextDir, '30-BOUNDED-CONTEXTS.md');
    await engine.render('context/30-BOUNDED-CONTEXTS.md.hbs', ctx, bcPath);
    filesCreated.push(bcPath);

    const searchPath = path.join(contextDir, '50-SEARCH-QUERIES.md');
    await engine.render('context/50-SEARCH-QUERIES.md.hbs', ctx, searchPath);
    filesCreated.push(searchPath);

  } catch (err) {
    errors.push(`Context generation error: ${err instanceof Error ? err.message : String(err)}`);
  }

  return { success: errors.length === 0, filesCreated, filesModified: [], errors };
}
