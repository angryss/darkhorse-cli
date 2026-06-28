// ──────────────────────────────────────────────────────────────────
// Skill: validateScaffold
// Post-scaffold validation that checks for common seeding defects.
// Verifies Tauri config placement, icon assets, Rust module stubs,
// and Cargo.toml references before the user discovers them manually.
// ──────────────────────────────────────────────────────────────────

import path from 'node:path';
import type { DarkhorseConfig, SkillResult } from '../core/types.js';
import { pathExists, readText } from '../core/fs.js';

export interface ValidationError {
  category: 'tauri-config' | 'icons' | 'rust-modules' | 'cargo' | 'frontend';
  message: string;
  filePath: string;
}

/**
 * Validate a scaffolded Rust/Tauri project for common seeding defects.
 */
export async function validateScaffold(config: DarkhorseConfig): Promise<SkillResult> {
  const errors: string[] = [];

  const validationErrors = await runAllValidations(config);

  for (const ve of validationErrors) {
    errors.push(`[${ve.category}] ${ve.message} — ${ve.filePath}`);
  }

  return {
    success: errors.length === 0,
    filesCreated: [],
    filesModified: [],
    errors,
  };
}

async function runAllValidations(config: DarkhorseConfig): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];
  const { root, crates, frontend } = config.paths;
  const prefix = config.rust.cratePrefix;

  // ── 1. Tauri config must exist in the desktop crate ──────────

  const tauriConfigPath = path.join(crates, `${prefix}-desktop`, 'tauri.conf.json');
  if (!(await pathExists(tauriConfigPath))) {
    errors.push({
      category: 'tauri-config',
      message: 'tauri.conf.json missing from desktop crate directory',
      filePath: tauriConfigPath,
    });
  }

  // ── 2. Required icon files ───────────────────────────────────

  const requiredIcons = ['32x32.png', '128x128.png', '128x128@2x.png', 'icon.icns', 'icon.ico'];
  const iconsDir = path.join(crates, `${prefix}-desktop`, 'icons');

  for (const icon of requiredIcons) {
    const iconPath = path.join(iconsDir, icon);
    if (!(await pathExists(iconPath))) {
      errors.push({
        category: 'icons',
        message: `Required icon file missing: ${icon}`,
        filePath: iconPath,
      });
    }
  }

  // ── 3. Declared Rust modules must have files ─────────────────

  const moduleMappings: { crate: string; modules: string[] }[] = [
    { crate: `${prefix}-domain`, modules: ['entities', 'errors', 'services', 'values'] },
    { crate: `${prefix}-application`, modules: ['commands', 'errors', 'ports', 'services'] },
    { crate: `${prefix}-infrastructure`, modules: ['database', 'errors', 'filesystem', 'logging', 'settings'] },
  ];

  for (const { crate: crateName, modules } of moduleMappings) {
    const libPath = path.join(crates, crateName, 'src', 'lib.rs');
    if (!(await pathExists(libPath))) {
      errors.push({
        category: 'rust-modules',
        message: `lib.rs missing for crate ${crateName}`,
        filePath: libPath,
      });
      continue;
    }

    for (const mod of modules) {
      const fileVariant = path.join(crates, crateName, 'src', `${mod}.rs`);
      const dirVariant = path.join(crates, crateName, 'src', mod, 'mod.rs');
      if (!(await pathExists(fileVariant)) && !(await pathExists(dirVariant))) {
        errors.push({
          category: 'rust-modules',
          message: `Module '${mod}' declared in ${crateName}/src/lib.rs but no ${mod}.rs or ${mod}/mod.rs found`,
          filePath: fileVariant,
        });
      }
    }
  }

  // ── 4. Required Cargo.toml files ─────────────────────────────

  const loggingPath = path.join(crates, `${prefix}-infrastructure`, 'src', 'logging.rs');
  if (await pathExists(loggingPath)) {
    const loggingSource = await readText(loggingPath);
    if (!loggingSource.includes('pub fn init()')) {
      errors.push({
        category: 'rust-modules',
        message: 'logging.rs must expose pub fn init() for the desktop crate startup path',
        filePath: loggingPath,
      });
    }
  }

  const rootCargo = path.join(root, 'Cargo.toml');
  if (!(await pathExists(rootCargo))) {
    errors.push({
      category: 'cargo',
      message: 'Workspace root Cargo.toml missing',
      filePath: rootCargo,
    });
  }

  const crateNames = [
    `${prefix}-domain`,
    `${prefix}-application`,
    `${prefix}-infrastructure`,
    `${prefix}-desktop`,
  ];

  for (const crateName of crateNames) {
    const cargoPath = path.join(crates, crateName, 'Cargo.toml');
    if (!(await pathExists(cargoPath))) {
      errors.push({
        category: 'cargo',
        message: `Cargo.toml missing for crate ${crateName}`,
        filePath: cargoPath,
      });
    }
  }

  // ── 5. Desktop crate build essentials ────────────────────────

  const desktopBuildRs = path.join(crates, `${prefix}-desktop`, 'build.rs');
  if (!(await pathExists(desktopBuildRs))) {
    errors.push({
      category: 'cargo',
      message: 'build.rs missing from desktop crate (required by tauri_build)',
      filePath: desktopBuildRs,
    });
  }

  const desktopMainRs = path.join(crates, `${prefix}-desktop`, 'src', 'main.rs');
  if (!(await pathExists(desktopMainRs))) {
    errors.push({
      category: 'cargo',
      message: 'main.rs missing from desktop crate',
      filePath: desktopMainRs,
    });
  }

  // ── 6. Frontend files (if enabled) ───────────────────────────

  if (config.features.frontend) {
    const frontendFiles = ['package.json', 'tsconfig.json', 'vite.config.ts', 'index.html'];
    for (const file of frontendFiles) {
      const fp = path.join(frontend, file);
      if (!(await pathExists(fp))) {
        errors.push({
          category: 'frontend',
          message: `Frontend file missing: ${file}`,
          filePath: fp,
        });
      }
    }
  }

  return errors;
}
