import path from 'node:path';
import { fsUtil, TemplateEngine, type DarkhorseConfig, type SkillResult, type TemplateContext } from '../core/index.js';
import { getTemplatesDir, getRulesDir, getGuidesDir, getWorkflowsDir } from './registry.js';

/**
 * OpenSpec skill — seeds specs, rules, guides, and workflow definitions.
 */
export async function seedOpenSpec(config: DarkhorseConfig): Promise<SkillResult> {
  const filesCreated: string[] = [];
  const errors: string[] = [];
  const specsDir = path.join(config.paths.openspec, 'specs');

  try {
    const engine = new TemplateEngine(getTemplatesDir());
    const ctx: TemplateContext = {
      project: config,
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

    // 4. Seed workflow skills (from workflows/skills/)
    const workflowDir = path.join(specsDir, 'workflow');
    const skillsDest = path.join(workflowDir, 'skills');
    await fsUtil.ensureDir(skillsDest);
    const skillFiles = await copyMarkdownDir(path.join(getWorkflowsDir(), 'skills'), skillsDest);
    filesCreated.push(...skillFiles);

    // 5. Seed domain README (empty bounded context scaffold)
    const domainDir = path.join(specsDir, 'domain');
    await fsUtil.ensureDir(domainDir);
    const domainReadme = path.join(domainDir, 'README.md');
    await engine.render('openspec/specs/domain/README.md.hbs', ctx, domainReadme);
    filesCreated.push(domainReadme);

    // 6. Seed project roadmap + mvps structure
    const projectDir = path.join(specsDir, 'project');
    await fsUtil.ensureDir(path.join(projectDir, 'mvps'));
    const roadmapPath = path.join(projectDir, 'roadmap.md');
    await engine.render('openspec/specs/project/roadmap.md.hbs', ctx, roadmapPath);
    filesCreated.push(roadmapPath);

    // 7. Seed progress tracker into changes/mvp-1.0/
    const mvp10Dir = path.join(config.paths.openspec, 'changes', 'mvp-1.0');
    await fsUtil.ensureDir(mvp10Dir);
    const progressPath = path.join(mvp10Dir, 'progress-tracker.md');
    await engine.render('openspec/specs/project/progress-tracker.md.hbs', ctx, progressPath);
    filesCreated.push(progressPath);

    // 8. Archive directory (empty)
    await fsUtil.ensureDir(path.join(config.paths.openspec, 'archive'));

    // 9. Copilot adapter: .github/agents/ + .github/prompts/ + copilot-instructions.md
    if (config.ai.tools.copilot) {
      const githubAgentsDir = path.join(config.paths.root, '.github', 'agents');
      await fsUtil.ensureDir(githubAgentsDir);
      const agentFiles = await copyMarkdownDir(path.join(getWorkflowsDir(), 'agents'), githubAgentsDir);
      filesCreated.push(...agentFiles);

      const promptsDir = path.join(config.paths.root, '.github', 'prompts');
      await fsUtil.ensureDir(promptsDir);
      const promptFiles = await copyMarkdownDir(path.join(getWorkflowsDir(), 'commands'), promptsDir);
      filesCreated.push(...promptFiles);

      const copilotInstructions = path.join(config.paths.root, '.github', 'copilot-instructions.md');
      await engine.render('github/copilot-instructions.md.hbs', ctx, copilotInstructions);
      filesCreated.push(copilotInstructions);
    }

    // 10. Kiro adapter: .kiro/steering/ + .kiro/prompts/
    if (config.ai.tools.kiro) {
      const kiroFiles = await seedKiroSteering(config, engine, ctx);
      filesCreated.push(...kiroFiles);
      const kiroPrompts = await seedKiroPrompts(config, engine, ctx);
      filesCreated.push(...kiroPrompts);
    }

  } catch (err) {
    errors.push(`OpenSpec seeding error: ${err instanceof Error ? err.message : String(err)}`);
  }

  return { success: errors.length === 0, filesCreated, filesModified: [], errors };
}

// ---------------------------------------------------------------------------
// Kiro adapter — generates .kiro/steering/ files
// ---------------------------------------------------------------------------

const KIRO_STEERING_TEMPLATES: Array<{ template: string; filename: string }> = [
  { template: 'kiro/steering/00-project.md.hbs', filename: '00-project.md' },
  { template: 'kiro/steering/01-workflow.md.hbs', filename: '01-workflow.md' },
  { template: 'kiro/steering/02-architecture.md.hbs', filename: '02-architecture.md' },
  { template: 'kiro/steering/03-tooling.md.hbs', filename: '03-tooling.md' },
];

/**
 * Seed Kiro steering files into .kiro/steering/.
 * Idempotent: skips files that already exist so customizations are preserved.
 * Pass force=true to overwrite existing files.
 */
export async function seedKiroSteering(
  config: DarkhorseConfig,
  engine?: TemplateEngine,
  ctx?: TemplateContext,
  force = false,
): Promise<string[]> {
  const created: string[] = [];
  const steeringDir = path.join(config.paths.root, '.kiro', 'steering');
  await fsUtil.ensureDir(steeringDir);

  const resolvedEngine = engine ?? new TemplateEngine(getTemplatesDir());
  const resolvedCtx: TemplateContext = ctx ?? {
    project: config,
    timestamp: new Date().toISOString().split('T')[0],
    cliVersion: '0.1.0',
  };

  for (const { template, filename } of KIRO_STEERING_TEMPLATES) {
    const destPath = path.join(steeringDir, filename);
    const alreadyExists = await fsUtil.pathExists(destPath);
    if (alreadyExists && !force) {
      continue;
    }
    await resolvedEngine.render(template, resolvedCtx, destPath);
    created.push(destPath);
  }

  return created;
}

// ---------------------------------------------------------------------------
// Kiro adapter — generates .kiro/prompts/ files
// ---------------------------------------------------------------------------

const KIRO_PROMPTS_TEMPLATES: Array<{ template: string; filename: string }> = [
  { template: 'kiro/prompts/discover-next.md.hbs', filename: 'discover-next.md' },
  { template: 'kiro/prompts/plan-next.md.hbs', filename: 'plan-next.md' },
  { template: 'kiro/prompts/implement-next.md.hbs', filename: 'implement-next.md' },
  { template: 'kiro/prompts/troubleshoot-next.md.hbs', filename: 'troubleshoot-next.md' },
];

/**
 * Seed Kiro prompt files into .kiro/prompts/.
 * Idempotent: skips files that already exist so customizations are preserved.
 * Pass force=true to overwrite existing files.
 */
export async function seedKiroPrompts(
  config: DarkhorseConfig,
  engine?: TemplateEngine,
  ctx?: TemplateContext,
  force = false,
): Promise<string[]> {
  const created: string[] = [];
  const promptsDir = path.join(config.paths.root, '.kiro', 'prompts');
  await fsUtil.ensureDir(promptsDir);

  const resolvedEngine = engine ?? new TemplateEngine(getTemplatesDir());
  const resolvedCtx: TemplateContext = ctx ?? {
    project: config,
    timestamp: new Date().toISOString().split('T')[0],
    cliVersion: '0.1.0',
  };

  for (const { template, filename } of KIRO_PROMPTS_TEMPLATES) {
    const destPath = path.join(promptsDir, filename);
    const alreadyExists = await fsUtil.pathExists(destPath);
    if (alreadyExists && !force) {
      continue;
    }
    await resolvedEngine.render(template, resolvedCtx, destPath);
    created.push(destPath);
  }

  return created;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function copyMarkdownDir(srcDir: string, destDir: string): Promise<string[]> {
  const copied: string[] = [];
  try {
    const entries = await import('node:fs/promises').then(fs => fs.readdir(srcDir, { withFileTypes: true }));
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
      const srcPath = path.join(srcDir, entry.name);
      const destPath = path.join(destDir, entry.name);
      await fsUtil.copyFile(srcPath, destPath);
      copied.push(destPath);
    }
  } catch {
    // Directory may not exist — skip silently
  }
  return copied;
}
