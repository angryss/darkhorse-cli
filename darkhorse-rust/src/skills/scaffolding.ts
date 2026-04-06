// ──────────────────────────────────────────────────────────────────
// Skill: scaffoldProject
// Creates the Rust/Tauri desktop project directory structure and
// renders all runtime product files (Cargo.toml, crate scaffolds,
// frontend shell, deployment config, root files).
// ──────────────────────────────────────────────────────────────────

import path from 'node:path';
import type { DarkhorseConfig, SkillResult, TemplateContext } from '../core/types.js';
import { TemplateEngine } from '../core/template-engine.js';
import { ensureDir, writeFile } from '../core/fs.js';
import { getTemplatesDir } from './registry.js';
import { generateDefaultIcons } from './icons.js';

export async function scaffoldProject(config: DarkhorseConfig): Promise<SkillResult> {
  const filesCreated: string[] = [];
  const errors: string[] = [];
  const engine = new TemplateEngine(getTemplatesDir());
  const { root, crates, frontend, context, openspec, vscode } = config.paths;
  const prefix = config.rust.cratePrefix;

  const ctx: TemplateContext = {
    project: config,
    timestamp: new Date().toISOString().split('T')[0],
    cliVersion: '0.1.0',
  };

  try {
    // ── Create directory structure ──────────────────────────────

    // Root directories
    await ensureDir(context);
    await ensureDir(openspec);
    await ensureDir(path.join(openspec, 'specs'));
    await ensureDir(path.join(openspec, 'changes'));
    await ensureDir(path.join(openspec, 'archive'));
    await ensureDir(vscode);

    // Crate directories (4-layer architecture)
    const crateNames = [`${prefix}-domain`, `${prefix}-application`, `${prefix}-infrastructure`, `${prefix}-desktop`];
    for (const crate of crateNames) {
      await ensureDir(path.join(crates, crate, 'src'));
    }

    // Frontend (if enabled)
    if (config.features.frontend) {
      await ensureDir(path.join(frontend, 'src'));
      await ensureDir(path.join(frontend, 'src', 'pages'));
      await ensureDir(path.join(frontend, 'src', 'services'));
      await ensureDir(path.join(frontend, 'src', 'stores'));
      await ensureDir(path.join(frontend, 'src', 'components'));
      await ensureDir(path.join(frontend, 'src', 'styles'));
      await ensureDir(path.join(frontend, 'public'));
    }

    // ── Render root files ──────────────────────────────────────

    // Workspace Cargo.toml
    await engine.render('backend/Cargo.toml.hbs', ctx, path.join(root, 'Cargo.toml'));
    filesCreated.push('Cargo.toml');

    // rustfmt.toml
    await engine.render('backend/rustfmt.toml.hbs', ctx, path.join(root, 'rustfmt.toml'));
    filesCreated.push('rustfmt.toml');

    // .gitignore
    await engine.render('gitignore.hbs', ctx, path.join(root, '.gitignore'));
    filesCreated.push('.gitignore');

    // README.md
    await engine.render('readme.md.hbs', ctx, path.join(root, 'README.md'));
    filesCreated.push('README.md');

    // ── Render crate files ─────────────────────────────────────

    // Domain crate
    await engine.render('backend/domain/Cargo.toml.hbs', ctx, path.join(crates, `${prefix}-domain`, 'Cargo.toml'));
    await engine.render('backend/domain/lib.rs.hbs', ctx, path.join(crates, `${prefix}-domain`, 'src', 'lib.rs'));
    filesCreated.push(`crates/${prefix}-domain/Cargo.toml`, `crates/${prefix}-domain/src/lib.rs`);

    // Domain module stubs
    const domainModules = ['entities', 'errors', 'services', 'values'];
    for (const mod of domainModules) {
      const stubPath = path.join(crates, `${prefix}-domain`, 'src', `${mod}.rs`);
      await writeFile(stubPath, `//! ${mod} module for ${config.name} domain layer.\n`);
      filesCreated.push(`crates/${prefix}-domain/src/${mod}.rs`);
    }

    // Application crate
    await engine.render(
      'backend/application/Cargo.toml.hbs',
      ctx,
      path.join(crates, `${prefix}-application`, 'Cargo.toml'),
    );
    await engine.render(
      'backend/application/lib.rs.hbs',
      ctx,
      path.join(crates, `${prefix}-application`, 'src', 'lib.rs'),
    );
    filesCreated.push(`crates/${prefix}-application/Cargo.toml`, `crates/${prefix}-application/src/lib.rs`);

    // Application module stubs
    const appModules = ['commands', 'errors', 'ports', 'services'];
    for (const mod of appModules) {
      const stubPath = path.join(crates, `${prefix}-application`, 'src', `${mod}.rs`);
      await writeFile(stubPath, `//! ${mod} module for ${config.name} application layer.\n`);
      filesCreated.push(`crates/${prefix}-application/src/${mod}.rs`);
    }

    // Infrastructure crate
    await engine.render(
      'backend/infrastructure/Cargo.toml.hbs',
      ctx,
      path.join(crates, `${prefix}-infrastructure`, 'Cargo.toml'),
    );
    await engine.render(
      'backend/infrastructure/lib.rs.hbs',
      ctx,
      path.join(crates, `${prefix}-infrastructure`, 'src', 'lib.rs'),
    );
    filesCreated.push(`crates/${prefix}-infrastructure/Cargo.toml`, `crates/${prefix}-infrastructure/src/lib.rs`);

    // Infrastructure module stubs
    const infraModules = ['database', 'errors', 'filesystem', 'logging', 'settings'];
    for (const mod of infraModules) {
      const stubPath = path.join(crates, `${prefix}-infrastructure`, 'src', `${mod}.rs`);
      await writeFile(stubPath, `//! ${mod} module for ${config.name} infrastructure layer.\n`);
      filesCreated.push(`crates/${prefix}-infrastructure/src/${mod}.rs`);
    }

    // Desktop shell crate
    await engine.render(
      'backend/desktop/Cargo.toml.hbs',
      ctx,
      path.join(crates, `${prefix}-desktop`, 'Cargo.toml'),
    );
    await engine.render(
      'backend/desktop/main.rs.hbs',
      ctx,
      path.join(crates, `${prefix}-desktop`, 'src', 'main.rs'),
    );
    await engine.render(
      'backend/desktop/build.rs.hbs',
      ctx,
      path.join(crates, `${prefix}-desktop`, 'build.rs'),
    );
    filesCreated.push(
      `crates/${prefix}-desktop/Cargo.toml`,
      `crates/${prefix}-desktop/src/main.rs`,
      `crates/${prefix}-desktop/build.rs`,
    );

    // ── Render frontend files ──────────────────────────────────

    if (config.features.frontend) {
      await engine.render('frontend/package.json.hbs', ctx, path.join(frontend, 'package.json'));
      await engine.render('frontend/tsconfig.json.hbs', ctx, path.join(frontend, 'tsconfig.json'));
      await engine.render('frontend/vite.config.ts.hbs', ctx, path.join(frontend, 'vite.config.ts'));
      await engine.render('frontend/index.html.hbs', ctx, path.join(frontend, 'index.html'));
      await engine.render('frontend/main.ts.hbs', ctx, path.join(frontend, 'src', 'main.ts'));
      filesCreated.push(
        'frontend/package.json',
        'frontend/tsconfig.json',
        'frontend/vite.config.ts',
        'frontend/index.html',
        'frontend/src/main.ts',
      );
    }

    // ── Render deployment files ────────────────────────────────

    // Tauri config — must live alongside the desktop crate's Cargo.toml
    const desktopCrateDir = path.join(crates, `${prefix}-desktop`);
    await engine.render('deployment/tauri.conf.json.hbs', ctx, path.join(desktopCrateDir, 'tauri.conf.json'));
    filesCreated.push(`crates/${prefix}-desktop/tauri.conf.json`);

    // ── Generate default icons ─────────────────────────────────

    const iconsDir = path.join(desktopCrateDir, 'icons');
    await ensureDir(iconsDir);
    const iconFiles = await generateDefaultIcons(iconsDir);
    filesCreated.push(...iconFiles.map((f) => `crates/${prefix}-desktop/icons/${f}`));

    // ── VS Code config ─────────────────────────────────────────

    await engine.render('vscode/mcp.json.hbs', ctx, path.join(vscode, 'mcp.json'));
    filesCreated.push('.vscode/mcp.json');
  } catch (err) {
    errors.push(`scaffoldProject failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  return {
    success: errors.length === 0,
    filesCreated,
    filesModified: [],
    errors,
  };
}
