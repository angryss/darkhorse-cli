import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'node:path';
import {
  createTempDir,
  cleanupTempDirs,
  buildInitConfig,
  fileExists,
  readText,
  readBinary,
  getRelativeFiles,
} from './helpers/setup.js';
import { initAgent } from '../src/agents/init.agent.js';

// ---------------------------------------------------------------------------
// Golden path: `darkhorse-rust init` (with frontend)
// ---------------------------------------------------------------------------

describe('init — with frontend', () => {
  let projectRoot: string;
  let files: string[];
  let prefix: string;

  beforeAll(async () => {
    const tmpDir = await createTempDir('dh-rust-init-');
    const config = buildInitConfig({ outputDir: tmpDir });
    prefix = config.rust.cratePrefix;
    await initAgent(config);
    projectRoot = config.paths.root;
    files = await getRelativeFiles(projectRoot);
  }, 30_000);

  afterAll(cleanupTempDirs);

  // ── Workspace root ───────────────────────────────────────────

  it('creates workspace root directory', async () => {
    expect(await fileExists(projectRoot)).toBe(true);
  });

  it('creates root Cargo.toml', () => {
    expect(files).toContain('Cargo.toml');
  });

  it('creates root .gitignore', () => {
    expect(files).toContain('.gitignore');
  });

  it('creates root README.md', () => {
    expect(files).toContain('README.md');
  });

  it('creates root rustfmt.toml', () => {
    expect(files).toContain('rustfmt.toml');
  });

  it('creates .darkhorse.yaml', () => {
    expect(files).toContain('.darkhorse.yaml');
  });

  // ── Workspace Cargo.toml references ──────────────────────────

  it('workspace Cargo.toml lists all four crates', async () => {
    const content = await readText(path.join(projectRoot, 'Cargo.toml'));
    expect(content).toContain(`crates/${prefix}-domain`);
    expect(content).toContain(`crates/${prefix}-application`);
    expect(content).toContain(`crates/${prefix}-infrastructure`);
    expect(content).toContain(`crates/${prefix}-desktop`);
  });

  // ── Domain crate ─────────────────────────────────────────────

  it('creates domain crate Cargo.toml', () => {
    expect(files).toContain(`crates/${prefix}-domain/Cargo.toml`);
  });

  it('creates domain lib.rs with module declarations', async () => {
    const libPath = path.join(projectRoot, 'crates', `${prefix}-domain`, 'src', 'lib.rs');
    const content = await readText(libPath);
    expect(content).toContain('pub mod entities;');
    expect(content).toContain('pub mod errors;');
    expect(content).toContain('pub mod services;');
    expect(content).toContain('pub mod values;');
  });

  it('creates domain module stub files', () => {
    for (const mod of ['entities', 'errors', 'services', 'values']) {
      expect(files).toContain(`crates/${prefix}-domain/src/${mod}.rs`);
    }
  });

  // ── Application crate ────────────────────────────────────────

  it('creates application crate Cargo.toml', () => {
    expect(files).toContain(`crates/${prefix}-application/Cargo.toml`);
  });

  it('creates application lib.rs with module declarations', async () => {
    const libPath = path.join(projectRoot, 'crates', `${prefix}-application`, 'src', 'lib.rs');
    const content = await readText(libPath);
    expect(content).toContain('pub mod commands;');
    expect(content).toContain('pub mod errors;');
    expect(content).toContain('pub mod ports;');
    expect(content).toContain('pub mod services;');
  });

  it('creates application module stub files', () => {
    for (const mod of ['commands', 'errors', 'ports', 'services']) {
      expect(files).toContain(`crates/${prefix}-application/src/${mod}.rs`);
    }
  });

  // ── Infrastructure crate ─────────────────────────────────────

  it('creates infrastructure crate Cargo.toml', () => {
    expect(files).toContain(`crates/${prefix}-infrastructure/Cargo.toml`);
  });

  it('creates infrastructure lib.rs with module declarations', async () => {
    const libPath = path.join(projectRoot, 'crates', `${prefix}-infrastructure`, 'src', 'lib.rs');
    const content = await readText(libPath);
    expect(content).toContain('pub mod database;');
    expect(content).toContain('pub mod errors;');
    expect(content).toContain('pub mod filesystem;');
    expect(content).toContain('pub mod logging;');
    expect(content).toContain('pub mod settings;');
  });

  it('creates infrastructure module stub files', () => {
    for (const mod of ['database', 'errors', 'filesystem', 'logging', 'settings']) {
      expect(files).toContain(`crates/${prefix}-infrastructure/src/${mod}.rs`);
    }
  });

  // ── Desktop crate ────────────────────────────────────────────

  it('creates desktop crate Cargo.toml', () => {
    expect(files).toContain(`crates/${prefix}-desktop/Cargo.toml`);
  });

  it('creates desktop main.rs', () => {
    expect(files).toContain(`crates/${prefix}-desktop/src/main.rs`);
  });

  it('creates desktop build.rs', () => {
    expect(files).toContain(`crates/${prefix}-desktop/build.rs`);
  });

  // ── Tauri config placement (Defect #1) ───────────────────────

  it('places tauri.conf.json in the desktop crate directory', () => {
    expect(files).toContain(`crates/${prefix}-desktop/tauri.conf.json`);
  });

  it('does NOT place tauri.conf.json in deployment/', () => {
    expect(files).not.toContain('deployment/tauri.conf.json');
  });

  it('tauri.conf.json has correct relative paths for frontend', async () => {
    const configPath = path.join(projectRoot, 'crates', `${prefix}-desktop`, 'tauri.conf.json');
    const content = await readText(configPath);
    const parsed = JSON.parse(content);
    // From crates/<prefix>-desktop/ to frontend/ is ../../frontend
    expect(parsed.build.beforeDevCommand).toContain('../../frontend');
    expect(parsed.build.beforeBuildCommand).toContain('../../frontend');
    expect(parsed.build.frontendDist).toBe('../../frontend/dist');
  });

  // ── Icon assets (Defect #3) ──────────────────────────────────

  it('creates all required Tauri icon files', () => {
    const requiredIcons = [
      '32x32.png',
      '128x128.png',
      '128x128@2x.png',
      'icon.icns',
      'icon.ico',
    ];
    for (const icon of requiredIcons) {
      expect(files).toContain(`crates/${prefix}-desktop/icons/${icon}`);
    }
  });

  it('generated PNG files have valid PNG signatures', async () => {
    const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    for (const name of ['32x32.png', '128x128.png', '128x128@2x.png']) {
      const data = await readBinary(
        path.join(projectRoot, 'crates', `${prefix}-desktop`, 'icons', name),
      );
      expect(data.subarray(0, 8).equals(pngSignature)).toBe(true);
    }
  });

  it('generated ICO file has valid ICO signature', async () => {
    const data = await readBinary(
      path.join(projectRoot, 'crates', `${prefix}-desktop`, 'icons', 'icon.ico'),
    );
    // ICO: reserved=0, type=1
    expect(data.readUInt16LE(0)).toBe(0);
    expect(data.readUInt16LE(2)).toBe(1);
  });

  it('generated ICNS file has valid ICNS magic', async () => {
    const data = await readBinary(
      path.join(projectRoot, 'crates', `${prefix}-desktop`, 'icons', 'icon.icns'),
    );
    expect(data.subarray(0, 4).toString('ascii')).toBe('icns');
  });

  // ── Frontend files ───────────────────────────────────────────

  it('creates frontend package.json', () => {
    expect(files).toContain('frontend/package.json');
  });

  it('creates frontend index.html', () => {
    expect(files).toContain('frontend/index.html');
  });

  it('creates frontend vite.config.ts', () => {
    expect(files).toContain('frontend/vite.config.ts');
  });

  it('creates frontend src/main.ts', () => {
    expect(files).toContain('frontend/src/main.ts');
  });

  // ── Context files ────────────────────────────────────────────

  it('creates context/ directory with 4 files', () => {
    const contextFiles = files.filter((f) => f.startsWith('context/'));
    expect(contextFiles).toContain('context/00-START-HERE.md');
    expect(contextFiles).toContain('context/10-REPO-MAP.md');
    expect(contextFiles).toContain('context/30-BOUNDED-CONTEXTS.md');
    expect(contextFiles).toContain('context/50-SEARCH-QUERIES.md');
  });

  // ── OpenSpec files ───────────────────────────────────────────

  it('creates openspec/AGENTS.md', () => {
    expect(files).toContain('openspec/AGENTS.md');
  });

  it('creates openspec/specs/ with architecture rules', () => {
    const archFiles = files.filter((f) => f.startsWith('openspec/specs/architecture/'));
    expect(archFiles.length).toBeGreaterThanOrEqual(1);
  });

  // ── VS Code config ──────────────────────────────────────────

  it('creates .vscode/mcp.json', () => {
    expect(files).toContain('.vscode/mcp.json');
  });
});

// ---------------------------------------------------------------------------
// Golden path: `darkhorse-rust init --no-frontend`
// ---------------------------------------------------------------------------

describe('init — no frontend', () => {
  let projectRoot: string;
  let files: string[];
  let prefix: string;

  beforeAll(async () => {
    const tmpDir = await createTempDir('dh-rust-init-nofrontend-');
    const config = buildInitConfig({ outputDir: tmpDir, includeFrontend: false });
    prefix = config.rust.cratePrefix;
    await initAgent(config);
    projectRoot = config.paths.root;
    files = await getRelativeFiles(projectRoot);
  }, 30_000);

  afterAll(cleanupTempDirs);

  it('does not create frontend directory', () => {
    const frontendFiles = files.filter((f) => f.startsWith('frontend/'));
    expect(frontendFiles).toHaveLength(0);
  });

  it('still creates all crate structures', () => {
    expect(files).toContain(`crates/${prefix}-domain/Cargo.toml`);
    expect(files).toContain(`crates/${prefix}-application/Cargo.toml`);
    expect(files).toContain(`crates/${prefix}-infrastructure/Cargo.toml`);
    expect(files).toContain(`crates/${prefix}-desktop/Cargo.toml`);
  });

  it('still places tauri.conf.json in desktop crate', () => {
    expect(files).toContain(`crates/${prefix}-desktop/tauri.conf.json`);
  });

  it('still creates icon assets', () => {
    expect(files).toContain(`crates/${prefix}-desktop/icons/icon.ico`);
    expect(files).toContain(`crates/${prefix}-desktop/icons/icon.icns`);
  });

  it('still creates all module stubs', () => {
    for (const mod of ['entities', 'errors', 'services', 'values']) {
      expect(files).toContain(`crates/${prefix}-domain/src/${mod}.rs`);
    }
    for (const mod of ['commands', 'errors', 'ports', 'services']) {
      expect(files).toContain(`crates/${prefix}-application/src/${mod}.rs`);
    }
    for (const mod of ['database', 'errors', 'filesystem', 'logging', 'settings']) {
      expect(files).toContain(`crates/${prefix}-infrastructure/src/${mod}.rs`);
    }
  });
});
