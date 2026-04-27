import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {
  buildConfig,
  buildServiceConfig,
  type InitInput,
  type AddInput,
  type DarkhorseConfig,
  type ProjectArchetype,
  type FrontendPlatform,
  type AiToolsConfig,
} from '../../src/core/types.js';

// ---------------------------------------------------------------------------
// Temp directory management
// ---------------------------------------------------------------------------

const tempDirs: string[] = [];

/**
 * Create an isolated temp directory for a single test.
 * Automatically tracked for cleanup in afterAll.
 */
export async function createTempDir(prefix = 'dh-test-'): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  tempDirs.push(dir);
  return dir;
}

/**
 * Remove all tracked temp directories.
 * Call in afterAll() for each test file.
 */
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
  includeFrontend?: boolean;
  frontendPlatform?: FrontendPlatform;
  outputDir: string;
  aiTools?: Partial<AiToolsConfig>;
}

export function buildInitConfig(opts: InitOptions): DarkhorseConfig {
  const input: InitInput = {
    name: opts.name ?? 'test-project',
    description: opts.description ?? 'Test project for golden path tests',
    includeFrontend: opts.includeFrontend ?? false,
    frontendPlatform: opts.frontendPlatform ?? 'web',
    outputDir: opts.outputDir,
    aiTools: opts.aiTools,
  };
  return buildConfig(input);
}

export interface AddOptions {
  archetype: ProjectArchetype;
  name?: string;
  namespace?: string;
  dotnetVersion?: 8 | 9;
  projectRoot: string;
}

export function buildAddConfig(opts: AddOptions, projectConfig: DarkhorseConfig): DarkhorseConfig {
  const input: AddInput = {
    archetype: opts.archetype,
    name: opts.name ?? `test-${opts.archetype}`,
    namespace: opts.namespace ?? 'TestCompany.TestService',
    dotnetVersion: opts.dotnetVersion ?? 8,
    projectRoot: opts.projectRoot,
  };
  return buildServiceConfig(input, projectConfig);
}

// ---------------------------------------------------------------------------
// File system assertions helpers
// ---------------------------------------------------------------------------

/**
 * Check if a file exists at the given path.
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read a file as UTF-8 text.
 */
export async function readText(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf-8');
}

/**
 * List all files recursively under a directory.
 */
export async function listFilesRecursive(dir: string): Promise<string[]> {
  const results: string[] = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...await listFilesRecursive(full));
      } else {
        results.push(full);
      }
    }
  } catch {
    // directory doesn't exist
  }
  return results;
}

/**
 * List all directories recursively under a directory (relative paths).
 */
export async function listDirsRecursive(dir: string): Promise<string[]> {
  const results: string[] = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const full = path.join(dir, entry.name);
        results.push(path.relative(dir, full));
        const nested = await listDirsRecursive(full);
        results.push(...nested.map((n) => path.join(entry.name, n)));
      }
    }
  } catch {
    // directory doesn't exist
  }
  return results;
}

/**
 * Get relative paths of all files under a root directory.
 */
export async function getRelativeFiles(rootDir: string): Promise<string[]> {
  const all = await listFilesRecursive(rootDir);
  return all.map((f) => path.relative(rootDir, f).replace(/\\/g, '/'));
}
