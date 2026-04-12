// ──────────────────────────────────────────────────────────────────
// Skill: seedOpenSpec
// Seeds the OpenSpec system into the generated project — AGENTS.md,
// architecture rules, pattern guides, workflow docs, domain starters,
// roadmap/progress trackers, and GitHub agent files.
// ──────────────────────────────────────────────────────────────────

import path from 'node:path';
import fs from 'node:fs/promises';
import type { DarkhorseConfig, SkillResult, TemplateContext } from '../core/types.js';
import { TemplateEngine } from '../core/template-engine.js';
import { ensureDir, pathExists } from '../core/fs.js';
import { getTemplatesDir, getRulesDir, getGuidesDir, getWorkflowsDir } from './registry.js';

export async function seedOpenSpec(config: DarkhorseConfig): Promise<SkillResult> {
  const filesCreated: string[] = [];
  const errors: string[] = [];
  const engine = new TemplateEngine(getTemplatesDir());
  const { root, openspec } = config.paths;

  const ctx: TemplateContext = {
    project: config,
    timestamp: new Date().toISOString().split('T')[0],
    cliVersion: '0.1.0',
  };

  try {
    // ── AGENTS.md ──────────────────────────────────────────────

    await engine.render('openspec/AGENTS.md.hbs', ctx, path.join(openspec, 'AGENTS.md'));
    filesCreated.push('openspec/AGENTS.md');

    // ── Architecture specs (copied from rules/) ────────────────

    const archDir = path.join(openspec, 'specs', 'architecture');
    await ensureDir(archDir);
    const copied = await copyMarkdownDir(getRulesDir(), archDir);
    filesCreated.push(...copied.map((f) => `openspec/specs/architecture/${path.basename(f)}`));

    // ── Pattern specs (copied from guides/) ────────────────────

    const patternDir = path.join(openspec, 'specs', 'patterns');
    await ensureDir(patternDir);
    const patternCopied = await copyMarkdownDir(getGuidesDir(), patternDir);
    filesCreated.push(...patternCopied.map((f) => `openspec/specs/patterns/${path.basename(f)}`));

    // ── Workflow skills (copied from workflows/skills/) ────────────

    const workflowDir = path.join(openspec, 'specs', 'workflow');
    const skillsDest = path.join(workflowDir, 'skills');
    await ensureDir(skillsDest);
    const skillCopied = await copyMarkdownDir(path.join(getWorkflowsDir(), 'skills'), skillsDest);
    filesCreated.push(...skillCopied.map((f) => `openspec/specs/workflow/skills/${path.basename(f)}`));

    // ── Domain starter ─────────────────────────────────────────

    const domainDir = path.join(openspec, 'specs', 'domain');
    await ensureDir(domainDir);
    await engine.render('openspec/specs/domain/README.md.hbs', ctx, path.join(domainDir, 'README.md'));
    filesCreated.push('openspec/specs/domain/README.md');

    // ── Project roadmap + progress tracker ─────────────────────

    const projectDir = path.join(openspec, 'specs', 'project');
    await ensureDir(projectDir);
    await engine.render('openspec/specs/project/roadmap.md.hbs', ctx, path.join(projectDir, 'roadmap.md'));
    filesCreated.push('openspec/specs/project/roadmap.md');

    const progressDir = path.join(openspec, 'changes', 'mvp-1.0');
    await ensureDir(progressDir);
    await engine.render(
      'openspec/specs/project/progress-tracker.md.hbs',
      ctx,
      path.join(progressDir, 'progress-tracker.md'),
    );
    filesCreated.push('openspec/changes/mvp-1.0/progress-tracker.md');

    // ── GitHub agent files (copied from workflows/agents/) ─────

    const ghAgentsDir = path.join(root, '.github', 'agents');
    const workflowAgentsDir = path.join(getWorkflowsDir(), 'agents');
    if (await pathExists(workflowAgentsDir)) {
      await ensureDir(ghAgentsDir);
      const agentsCopied = await copyMarkdownDir(workflowAgentsDir, ghAgentsDir);
      filesCreated.push(...agentsCopied.map((f) => `.github/agents/${path.basename(f)}`));
    }

    // ── Prompt commands (copied from workflows/commands/) ─────

    const promptsDir = path.join(root, '.github', 'prompts');
    const workflowCmdsDir = path.join(getWorkflowsDir(), 'commands');
    if (await pathExists(workflowCmdsDir)) {
      await ensureDir(promptsDir);
      const promptsCopied = await copyMarkdownDir(workflowCmdsDir, promptsDir);
      filesCreated.push(...promptsCopied.map((f) => `.github/prompts/${path.basename(f)}`));
    }

    // ── Copilot instructions ────────────────────────────

    const copilotInstructions = path.join(root, '.github', 'copilot-instructions.md');
    await engine.render('github/copilot-instructions.md.hbs', ctx, copilotInstructions);
    filesCreated.push('.github/copilot-instructions.md');
  } catch (err) {
    errors.push(`seedOpenSpec failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  return {
    success: errors.length === 0,
    filesCreated,
    filesModified: [],
    errors,
  };
}

// ── Helpers ────────────────────────────────────────────────────────

async function copyMarkdownDir(srcDir: string, destDir: string): Promise<string[]> {
  const copied: string[] = [];
  if (!(await pathExists(srcDir))) return copied;

  const entries = await fs.readdir(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.md')) {
      const src = path.join(srcDir, entry.name);
      const dest = path.join(destDir, entry.name);
      await fs.copyFile(src, dest);
      copied.push(dest);
    }
  }
  return copied;
}
