import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {
  buildConfig,
  type InitInput,
  type DarkhorseConfig,
} from '../../src/core/types.js';

// ---------------------------------------------------------------------------
// Temp directory management
// ---------------------------------------------------------------------------

const tempDirs: string[] = [];

/**
 * Create an isolated temp directory for a single test.
 * Automatically tracked for cleanup in afterAll.
 */
export async function createTempDir(prefix = 'dh-rust-test-'): Promise<string> {
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
  cratePrefix?: string;
  edition?: '2021' | '2024';
  includeFrontend?: boolean;
  outputDir: string;
}

export function buildInitConfig(opts: InitOptions): DarkhorseConfig {
  const input: InitInput = {
    name: opts.name ?? 'test-project',
    description: opts.description ?? 'Test project for golden path tests',
    cratePrefix: opts.cratePrefix,
    edition: opts.edition ?? '2021',
    includeFrontend: opts.includeFrontend ?? true,
    outputDir: opts.outputDir,
  };
  return buildConfig(input);
}

// ---------------------------------------------------------------------------
// File system assertion helpers
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
 * Read a file as binary Buffer.
 */
export async function readBinary(filePath: string): Promise<Buffer> {
  return fs.readFile(filePath);
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
        results.push(...(await listFilesRecursive(full)));
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
 * Get relative paths of all files under a root directory.
 */
export async function getRelativeFiles(rootDir: string): Promise<string[]> {
  const all = await listFilesRecursive(rootDir);
  return all.map((f) => path.relative(rootDir, f).replace(/\\/g, '/'));
}
