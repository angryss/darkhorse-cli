import path from 'node:path';
import { fsUtil, TemplateEngine, type DarkhorseConfig, type SkillResult, type TemplateContext } from '../core/index.js';
import { ARCHETYPE_CATEGORIES } from '../core/types.js';
import { getTemplatesDir, getRulesDir, getGuidesDir, getWorkflowsDir } from './registry.js';

/**
 * OpenSpec skill — seeds specs, rules, guides, and workflow definitions into the project.
 */
export async function seedOpenSpec(config: DarkhorseConfig): Promise<SkillResult> {
  const filesCreated: string[] = [];
  const errors: string[] = [];
  const specsDir = path.join(config.paths.openspec, 'specs');

  try {
    const engine = new TemplateEngine(getTemplatesDir());
    const ctx: TemplateContext = {
      project: config,
      archetypeCategory: config.archetype ? ARCHETYPE_CATEGORIES[config.archetype] : undefined,
      timestamp: new Date().toISOString().split('T')[0],
      cliVersion: '0.1.0',
    };

    // 1. AGENTS.md — the file AI agents read first
    const agentsPath = path.join(config.paths.openspec, 'AGENTS.md');
    await engine.render('openspec/AGENTS.md.hbs', ctx, agentsPath);
    filesCreated.push(agentsPath);

    // 2. Seed architecture specs (from rules/)
    const archDir = path.join(specsDir, 'architecture');
    await fsUtil.ensureDir(archDir);
    const ruleFiles = await copyMarkdownDir(getRulesDir(), archDir);
    filesCreated.push(...ruleFiles);

    // 3. Seed pattern specs (from guides/)
    const patternsDir = path.join(specsDir, 'patterns');
    await fsUtil.ensureDir(patternsDir);
    const guideFiles = await copyMarkdownDir(getGuidesDir(), patternsDir);
    filesCreated.push(...guideFiles);

    // 4. Seed workflow specs (from workflows/)
    const workflowDir = path.join(specsDir, 'workflow');
    await fsUtil.ensureDir(workflowDir);
    const workflowFiles = await seedWorkflows(getWorkflowsDir(), workflowDir);
    filesCreated.push(...workflowFiles);

    // 5. Seed domain templates (empty structure for project to fill)
    const domainDir = path.join(specsDir, 'domain');
    await fsUtil.ensureDir(domainDir);
    const domainReadme = path.join(domainDir, 'README.md');
    await engine.render('openspec/specs/domain/README.md.hbs', ctx, domainReadme);
    filesCreated.push(domainReadme);

    // 6. Seed project templates (roadmap, mvps)
    const projectDir = path.join(specsDir, 'project');
    await fsUtil.ensureDir(path.join(projectDir, 'mvps'));
    const roadmapPath = path.join(projectDir, 'roadmap.md');
    await engine.render('openspec/specs/project/roadmap.md.hbs', ctx, roadmapPath);
    filesCreated.push(roadmapPath);

    // 7. Seed progress tracker into changes/mvp-1.0/ (lives with MVP requirements)
    const mvp10Dir = path.join(config.paths.openspec, 'changes', 'mvp-1.0');
    await fsUtil.ensureDir(mvp10Dir);
    const progressPath = path.join(mvp10Dir, 'progress-tracker.md');
    await engine.render('openspec/specs/project/progress-tracker.md.hbs', ctx, progressPath);
    filesCreated.push(progressPath);

    // 8. Seed toolkit specs (if frontend is included)
    if (config.features.frontend) {
      const toolkitDir = path.join(specsDir, 'toolkit');
      await fsUtil.ensureDir(toolkitDir);
      const toolkitReadme = path.join(toolkitDir, 'README.md');
      await engine.render('openspec/specs/toolkit/README.md.hbs', ctx, toolkitReadme);
      filesCreated.push(toolkitReadme);
    }

    // 9. Seed Copilot agent definitions into .github/agents/
    const githubAgentsDir = path.join(config.paths.root, '.github', 'agents');
    await fsUtil.ensureDir(githubAgentsDir);
    const agentFiles = await copyMarkdownDir(path.join(getWorkflowsDir(), 'agents'), githubAgentsDir);
    filesCreated.push(...agentFiles);
  } catch (err) {
    errors.push(`OpenSpec seeding error: ${err instanceof Error ? err.message : String(err)}`);
  }

  return { success: errors.length === 0, filesCreated, filesModified: [], errors };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Copy all .md files from source dir to dest dir (non-recursive).
 */
async function copyMarkdownDir(srcDir: string, destDir: string): Promise<string[]> {
  const copied: string[] = [];
  try {
    const { readdir } = await import('node:fs/promises');
    const entries = await readdir(srcDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.md')) {
        const dest = path.join(destDir, entry.name);
        await fsUtil.copyFile(path.join(srcDir, entry.name), dest);
        copied.push(dest);
      }
    }
  } catch {
    // Directory may not exist yet during development — non-fatal
  }
  return copied;
}

/**
 * Seed workflow specs from both commands/ and skills/ subdirectories.
 * Skills land in destDir/skills/, commands land in destDir/commands/.
 */
async function seedWorkflows(workflowsDir: string, destDir: string): Promise<string[]> {
  const copied: string[] = [];

  // Skills go into destDir/skills/ (explicit subfolder, machine-readable as skills)
  const skillsDest = path.join(destDir, 'skills');
  await fsUtil.ensureDir(skillsDest);
  const skillFiles = await copyMarkdownDir(path.join(workflowsDir, 'skills'), skillsDest);
  copied.push(...skillFiles);

  // Commands go into destDir/commands/
  const cmdsDest = path.join(destDir, 'commands');
  await fsUtil.ensureDir(cmdsDest);
  const cmdFiles = await copyMarkdownDir(path.join(workflowsDir, 'commands'), cmdsDest);
  copied.push(...cmdFiles);

  return copied;
}
