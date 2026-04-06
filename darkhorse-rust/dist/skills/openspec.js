// ──────────────────────────────────────────────────────────────────
// Skill: seedOpenSpec
// Seeds the OpenSpec system into the generated project — AGENTS.md,
// architecture rules, pattern guides, workflow docs, domain starters,
// roadmap/progress trackers, and GitHub agent files.
// ──────────────────────────────────────────────────────────────────
import path from 'node:path';
import fs from 'node:fs/promises';
import { TemplateEngine } from '../core/template-engine.js';
import { ensureDir, pathExists } from '../core/fs.js';
import { getTemplatesDir, getRulesDir, getGuidesDir, getWorkflowsDir } from './registry.js';
export async function seedOpenSpec(config) {
    const filesCreated = [];
    const errors = [];
    const engine = new TemplateEngine(getTemplatesDir());
    const { root, openspec } = config.paths;
    const ctx = {
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
        // ── Workflow specs (copied from workflows/) ────────────────
        await seedWorkflows(getWorkflowsDir(), path.join(openspec, 'specs', 'workflow'), filesCreated);
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
        await engine.render('openspec/specs/project/progress-tracker.md.hbs', ctx, path.join(progressDir, 'progress-tracker.md'));
        filesCreated.push('openspec/changes/mvp-1.0/progress-tracker.md');
        // ── GitHub agent files (copied from workflows/agents/) ─────
        const ghAgentsDir = path.join(root, '.github', 'agents');
        const workflowAgentsDir = path.join(getWorkflowsDir(), 'agents');
        if (await pathExists(workflowAgentsDir)) {
            await ensureDir(ghAgentsDir);
            const agentsCopied = await copyMarkdownDir(workflowAgentsDir, ghAgentsDir);
            filesCreated.push(...agentsCopied.map((f) => `.github/agents/${path.basename(f)}`));
        }
    }
    catch (err) {
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
async function copyMarkdownDir(srcDir, destDir) {
    const copied = [];
    if (!(await pathExists(srcDir)))
        return copied;
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
async function seedWorkflows(workflowsDir, destBase, filesCreated) {
    for (const sub of ['skills', 'commands']) {
        const srcDir = path.join(workflowsDir, sub);
        if (!(await pathExists(srcDir)))
            continue;
        const destDir = path.join(destBase, sub);
        await ensureDir(destDir);
        const copied = await copyMarkdownDir(srcDir, destDir);
        filesCreated.push(...copied.map((f) => `openspec/specs/workflow/${sub}/${path.basename(f)}`));
    }
}
//# sourceMappingURL=openspec.js.map