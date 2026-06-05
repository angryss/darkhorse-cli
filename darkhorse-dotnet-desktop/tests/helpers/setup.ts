import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {
  buildConfig,
  type InitInput,
  type DarkhorseConfig,
  type UiFramework,
  type DotnetVersion,
  type AiToolsConfig,
  type CiCdProvider,
} from '../../src/core/types.js';

// ---------------------------------------------------------------------------
// Temp directory management
// ---------------------------------------------------------------------------

const tempDirs: string[] = [];

export async function createTempDir(prefix = 'dh-desktop-test-'): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  tempDirs.push(dir);
  return dir;
}

export async function cleanupTempDirs(): Promise<void> {
  for (const dir of tempDirs) {
    try {
      await fs.rm(dir, { recursive: true, force: true });
    } catch {
      // ignore cleanup failures
    }
  }
  tempDirs.length = 0;
}

// ---------------------------------------------------------------------------
// Config factories
// ---------------------------------------------------------------------------

export interface InitOptions {
  name?: string;
  description?: string;
  dotnetVersion?: DotnetVersion;
  uiFramework?: UiFramework;
  persistence?: boolean;
  cicd?: CiCdProvider;
  adoOrgUrl?: string;
  outputDir: string;
  aiTools?: Partial<AiToolsConfig>;
}

export function buildInitConfig(opts: InitOptions): DarkhorseConfig {
  const input: InitInput = {
    name: opts.name ?? 'test-desktop-app',
    description: opts.description ?? 'Test WPF desktop application',
    dotnetVersion: opts.dotnetVersion ?? 8,
    uiFramework: opts.uiFramework ?? 'materialdesign',
    persistence: opts.persistence ?? true,
    cicd: opts.cicd ?? 'none',
    adoOrgUrl: opts.adoOrgUrl,
    outputDir: opts.outputDir,
    aiTools: opts.aiTools,
  };
  return buildConfig(input);
}

// ---------------------------------------------------------------------------
// File system assertion helpers
// ---------------------------------------------------------------------------

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readText(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf-8');
}

/**
 * Get all files under a directory as paths relative to that directory.
 */
export async function getRelativeFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  await walk(dir, dir, files);
  return files;
}

async function walk(base: string, current: string, results: string[]): Promise<void> {
  const entries = await fs.readdir(current, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(current, entry.name);
    if (entry.isDirectory()) {
      await walk(base, full, results);
    } else {
      results.push(path.relative(base, full).replace(/\\/g, '/'));
    }
  }
}
