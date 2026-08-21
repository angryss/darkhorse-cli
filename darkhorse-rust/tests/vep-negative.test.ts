import { afterAll, describe, expect, it } from 'vitest';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { evaluateVepCompatibility } from '../src/core/vep-compatibility.js';
import { ProjectVepBoundaryError, readProjectVepSelection, resolveProjectLocalVisu } from '../src/core/vep.js';

const roots: string[] = [];
async function fixture(packageJson: unknown): Promise<string> { const root = await mkdtemp(path.join(os.tmpdir(), 'dh-rust-vep-negative-')); roots.push(root); await writeFile(path.join(root, 'package.json'), JSON.stringify(packageJson)); return root; }
async function exactLockedFixture(): Promise<string> {
  const root = await fixture({ name: 'exact-locked', version: '0.1.0', devDependencies: { '@angryss/vep': '2.0.0' } });
  await writeFile(path.join(root, 'package-lock.json'), JSON.stringify({ lockfileVersion: 3, packages: {
    '': { devDependencies: { '@angryss/vep': '2.0.0' } },
    'node_modules/@angryss/vep': {
      version: '2.0.0',
      resolved: 'https://registry.npmjs.org/@angryss/vep/-/vep-2.0.0.tgz',
      integrity: 'sha512-2xv9kqH5Aa42xf0l4AYnXS8ljxdUGCaoIp05PIFoL576i/w6sxIWmJqMclfy8a87Z1XQc2rasDirnkuOxOTp8g==',
    },
  } }));
  return root;
}
afterAll(async () => Promise.all(roots.map((root) => rm(root, { recursive: true, force: true }))));

describe('terminal VEP fail-closed boundary', () => {
  it.each(['latest', '^2.0.0', '~2.0.0', '*', 'file:../vep', 'https://example.test/vep.tgz'])('rejects floating or non-public selection %s without mutation', (versionSpec) => {
    expect(evaluateVepCompatibility({ darkhorseVersion: '0.1.0', packageName: '@angryss/vep', versionSpec })).toMatchObject({ supported: false, code: 'NON_EXACT_VEP_VERSION' });
  });
  it('rejects an unsupported exact release', () => {
    expect(evaluateVepCompatibility({ darkhorseVersion: '0.1.0', packageName: '@angryss/vep', versionSpec: '2.0.1' })).toMatchObject({ supported: false, code: 'UNSUPPORTED_VEP_VERSION' });
  });
  it('rejects a missing root VEP pin', async () => {
    const root = await fixture({ name: 'missing-pin', version: '0.1.0', devDependencies: {} });
    await expect(readProjectVepSelection(root)).rejects.toMatchObject({ code: 'MISSING_PACKAGE_IDENTITY' });
  });
  it('rejects legacy or competing package authorities', async () => {
    const legacy = await fixture({ name: 'legacy', devDependencies: { '@visu/vep': '2.0.0' } });
    await expect(readProjectVepSelection(legacy)).rejects.toMatchObject({ code: 'WRONG_PACKAGE_IDENTITY' });
    const competing = await fixture({ name: 'competing', devDependencies: { '@angryss/vep': '2.0.0' }, config: { '@angryss/vep': '2.0.0' } });
    await expect(readProjectVepSelection(competing)).rejects.toMatchObject({ code: 'COMPETING_VERSION_AUTHORITY' });
  });
  it('returns governed recovery with every boundary error', async () => {
    const root = await fixture('malformed-root-object');
    try { await readProjectVepSelection(root); throw new Error('expected failure'); }
    catch (error) { expect(error).toBeInstanceOf(ProjectVepBoundaryError); expect((error as ProjectVepBoundaryError).recovery.length).toBeGreaterThan(20); }
  });
  it('rejects a missing project-local VEP install without fallback', async () => {
    const root = await exactLockedFixture();
    await expect(resolveProjectLocalVisu(root)).rejects.toMatchObject({ code: 'MISSING_LOCAL_INSTALL' });
  });
  it('rejects a mismatched public integrity before package execution', async () => {
    const root = await exactLockedFixture();
    const lockPath = path.join(root, 'package-lock.json');
    const lock = JSON.parse(await readFile(lockPath, 'utf8'));
    lock.packages['node_modules/@angryss/vep'].integrity = `sha512-${'A'.repeat(88)}`;
    await writeFile(lockPath, JSON.stringify(lock));
    await expect(resolveProjectLocalVisu(root)).rejects.toMatchObject({ code: 'LOCK_INTEGRITY_MISMATCH' });
  });
  it('rejects a missing project-local visu executable without global fallback', async () => {
    const root = await exactLockedFixture();
    const installed = path.join(root, 'node_modules', '@angryss', 'vep');
    await mkdir(installed, { recursive: true });
    await writeFile(path.join(installed, 'package.json'), JSON.stringify({ name: '@angryss/vep', version: '2.0.0' }));
    await expect(resolveProjectLocalVisu(root)).rejects.toMatchObject({ code: 'MISSING_PROJECT_LOCAL_VISU' });
  });
});
