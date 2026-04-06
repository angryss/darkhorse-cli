import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  createTempDir,
  cleanupTempDirs,
  buildInitConfig,
} from './helpers/setup.js';
import { initAgent } from '../src/agents/init.agent.js';
import { validateScaffold } from '../src/skills/validation.js';

// ---------------------------------------------------------------------------
// Scaffold validation — ensures the validator catches (or passes) correctly
// ---------------------------------------------------------------------------

describe('scaffold validation', () => {
  describe('after successful init', () => {
    let config: ReturnType<typeof buildInitConfig>;

    beforeAll(async () => {
      const tmpDir = await createTempDir('dh-rust-validate-');
      config = buildInitConfig({ outputDir: tmpDir });
      await initAgent(config);
    }, 30_000);

    afterAll(cleanupTempDirs);

    it('passes validation with zero errors', async () => {
      const result = await validateScaffold(config);
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('after init without frontend', () => {
    let config: ReturnType<typeof buildInitConfig>;

    beforeAll(async () => {
      const tmpDir = await createTempDir('dh-rust-validate-nofrontend-');
      config = buildInitConfig({ outputDir: tmpDir, includeFrontend: false });
      await initAgent(config);
    }, 30_000);

    afterAll(cleanupTempDirs);

    it('passes validation with zero errors', async () => {
      const result = await validateScaffold(config);
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
