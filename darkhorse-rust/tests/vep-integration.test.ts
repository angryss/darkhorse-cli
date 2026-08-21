import { afterAll, describe, expect, it } from 'vitest';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { evaluateVepCompatibility } from '../src/core/vep-compatibility.js';
import { readProjectVepSelection } from '../src/core/vep.js';

const roots: string[] = [];
async function projectRoot(): Promise<string> { const root = await mkdtemp(path.join(os.tmpdir(), 'dh-rust-vep-integration-')); roots.push(root); return root; }
afterAll(async () => Promise.all(roots.map((root) => rm(root, { recursive: true, force: true }))));

describe('terminal VEP integration boundary', () => {
  it('admits only the frozen public VEP identity and exact version', () => {
    expect(evaluateVepCompatibility({ darkhorseVersion: '0.1.0', packageName: '@angryss/vep', versionSpec: '2.0.0' })).toMatchObject({ supported: true, packageName: '@angryss/vep', version: '2.0.0' });
  });
  it('treats root package.json as the sole current VEP version authority', async () => {
    const root = await projectRoot();
    await writeFile(path.join(root, 'package.json'), JSON.stringify({ name: 'generated-rust', version: '0.1.0', private: true, devDependencies: { '@angryss/vep': '2.0.0' } }));
    await expect(readProjectVepSelection(root)).resolves.toMatchObject({ projectRoot: root, packageName: '@angryss/vep', version: '2.0.0' });
  });
  it('ships lifecycle commands that delegate to the project-local resolver', async () => {
    for (const command of ['discover', 'plan', 'test', 'review', 'close']) {
      const source = await readFile(new URL(`../src/commands/${command}.ts`, import.meta.url), 'utf8');
      expect(source).toContain('delegateProjectLocalVisu');
      expect(source).not.toMatch(/global|source[- ]tree fallback/i);
    }
  });
});
