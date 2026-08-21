import { afterAll, describe, expect, it } from 'vitest';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { evaluateVepCompatibility } from '../src/core/vep-compatibility.js';
import { ProjectVepBoundaryError, readProjectVepSelection } from '../src/core/vep.js';

const roots: string[] = [];
async function fixture(packageJson: unknown): Promise<string> { const root = await mkdtemp(path.join(os.tmpdir(), 'dh-java-vep-negative-')); roots.push(root); await writeFile(path.join(root, 'package.json'), JSON.stringify(packageJson)); return root; }
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
});
