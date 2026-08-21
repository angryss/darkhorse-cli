import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  VepUpgradeError,
  executeVepUpgrade,
  inspectVepUpgrade,
  type VepUpgradeModel,
  type VepUpgradeTarget,
} from '../src/commands/vep-upgrade.js';

const roots: string[] = [];
const PACKAGE = '@angryss/vep' as const;
const current: VepUpgradeTarget = {
  packageName: PACKAGE,
  version: '2.0.0',
  disposition: 'compatible',
  source: 'governed-fixture',
  publicRelease: false,
  integrity: 'sha512-current',
  tarball: 'fixture:current',
};
const compatible: VepUpgradeTarget = {
  packageName: PACKAGE,
  version: '2.0.1',
  disposition: 'compatible',
  source: 'governed-fixture',
  publicRelease: false,
  integrity: 'sha512-governed-compatible-fixture',
  tarball: 'fixture:governed-compatible-vep-2.0.1',
};
const incompatible: VepUpgradeTarget = {
  packageName: PACKAGE,
  version: '3.0.0',
  disposition: 'requires-bounded-migration',
  source: 'governed-fixture',
  publicRelease: false,
  integrity: 'sha512-governed-incompatible-fixture',
  tarball: 'fixture:governed-incompatible-vep-3.0.0',
};
const rewritesHistory: VepUpgradeTarget = {
  ...compatible,
  version: '2.1.0',
  integrity: 'sha512-governed-history-rewrite-fixture',
  tarball: 'fixture:governed-history-rewrite-vep-2.1.0',
  requiresHistoricalRewrite: true,
};
const model: VepUpgradeModel = {
  schemaVersion: 1,
  darkhorseVersion: '0.1.0',
  targets: [current, compatible, incompatible, rewritesHistory],
};

const historicalNames = ['contract.yaml', 'proof.json', 'review.json', 'publication-closure.json'];

async function json(filePath: string): Promise<Record<string, unknown>> {
  return JSON.parse(await readFile(filePath, 'utf8')) as Record<string, unknown>;
}

async function seedProject(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), 'darkhorse-s06-upgrade-'));
  roots.push(root);
  await mkdir(path.join(root, '.visu', 'work', 'completed-change'), { recursive: true });
  await mkdir(path.join(root, '.visu', 'work', 'active-change'), { recursive: true });
  await mkdir(path.join(root, 'openspec', 'changes', 'completed-change'), { recursive: true });
  await mkdir(path.join(root, 'openspec', 'changes', 'active-change'), { recursive: true });
  await writeFile(path.join(root, 'package.json'), `${JSON.stringify({
    name: 'fixture-project',
    private: true,
    devDependencies: { [PACKAGE]: '2.0.0' },
  }, null, 2)}\n`);
  await writeFile(path.join(root, 'package-lock.json'), `${JSON.stringify({
    name: 'fixture-project', lockfileVersion: 3,
    packages: {
      '': { devDependencies: { [PACKAGE]: '2.0.0' } },
      [`node_modules/${PACKAGE}`]: {
        version: '2.0.0', integrity: 'sha512-current', resolved: 'fixture:current',
      },
    },
  }, null, 2)}\n`);
  await installFixture(root, current);
  for (const name of historicalNames) {
    await writeFile(path.join(root, '.visu', 'work', 'completed-change', name), `historical-${name}\n`);
  }
  await writeFile(path.join(root, '.visu', 'work', 'active-change', 'contract.yaml'), 'active-a1\n');
  for (const changeId of ['completed-change', 'active-change']) {
    await writeFile(path.join(root, 'openspec', 'changes', changeId, 'proposal.md'), `${changeId}-proposal-before\n`);
    await writeFile(path.join(root, 'openspec', 'changes', changeId, 'tasks.md'), `${changeId}-tasks-before\n`);
  }
  return root;
}

async function hashFiles(root: string, relativePaths: readonly string[]): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  for (const relativePath of relativePaths) {
    result[relativePath] = createHash('sha256').update(await readFile(path.join(root, relativePath))).digest('hex');
  }
  return result;
}

async function installFixture(root: string, target: VepUpgradeTarget): Promise<void> {
  const packageRoot = path.join(root, 'node_modules', '@angryss', 'vep');
  const binRoot = path.join(root, 'node_modules', '.bin');
  await mkdir(packageRoot, { recursive: true });
  await mkdir(binRoot, { recursive: true });
  await writeFile(path.join(packageRoot, 'package.json'), `${JSON.stringify({ name: PACKAGE, version: target.version })}\n`);
  await writeFile(path.join(binRoot, process.platform === 'win32' ? 'visu.cmd' : 'visu'), 'fixture-visu\n');
  await writeFile(path.join(root, 'package-lock.json'), `${JSON.stringify({
    name: 'fixture-project', lockfileVersion: 3,
    packages: {
      '': { devDependencies: { [PACKAGE]: target.version } },
      [`node_modules/${PACKAGE}`]: {
        version: target.version, integrity: target.integrity, resolved: target.tarball,
      },
    },
  }, null, 2)}\n`);
}

async function rollbackFixture(root: string): Promise<void> {
  await rm(path.join(root, 'node_modules'), { recursive: true, force: true });
  await installFixture(root, current);
}

async function regenerateFixture(root: string, changeId: string): Promise<void> {
  for (const name of ['proposal.md', 'tasks.md']) {
    await writeFile(path.join(root, 'openspec', 'changes', changeId, name), `${changeId}-${name}-vep-2.0.1\n`);
  }
}

async function expectCode(action: Promise<unknown>, code: string): Promise<VepUpgradeError> {
  try {
    await action;
    throw new Error(`expected ${code}`);
  } catch (error) {
    expect(error).toBeInstanceOf(VepUpgradeError);
    expect((error as VepUpgradeError).code).toBe(code);
    return error as VepUpgradeError;
  }
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('DH-S06 governed VEP upgrade', () => {
  it('derives current selection only from root package.json and classifies from the governed model', async () => {
    const root = await seedProject();
    const result = await inspectVepUpgrade(root, compatible.version, model);
    expect(result.currentPackage).toBe(PACKAGE);
    expect(result.currentVersion).toBe('2.0.0');
    expect(result.disposition).toBe('compatible');
    expect(result.activeChangeIds).toEqual(['active-change']);
    expect(result.completedChangeIds).toEqual(['completed-change']);
  });

  it('performs an authorized compatible exact-pin transaction and preserves completed bytes', async () => {
    const root = await seedProject();
    const historical = historicalNames.map((name) => `.visu/work/completed-change/${name}`);
    const completedProjections = ['openspec/changes/completed-change/proposal.md', 'openspec/changes/completed-change/tasks.md'];
    const before = await hashFiles(root, [...historical, ...completedProjections]);
    const result = await executeVepUpgrade(root, compatible.version, {
      authorized: true, model, install: installFixture, rollbackInstall: rollbackFixture,
      validateActiveProjection: async () => undefined,
      regenerateActiveProjection: regenerateFixture,
    });
    expect(result.status).toBe('UPGRADED');
    expect(result.regeneratedChangeIds).toEqual(['active-change']);
    expect(result.historicalArtifactsVerified).toBe(4);
    const projectPackage = await json(path.join(root, 'package.json'));
    expect((projectPackage.devDependencies as Record<string, string>)[PACKAGE]).toBe('2.0.1');
    expect(await hashFiles(root, [...historical, ...completedProjections])).toEqual(before);
    expect(await readFile(path.join(root, 'openspec', 'changes', 'active-change', 'proposal.md'), 'utf8')).toContain('2.0.1');
  });

  it('produces deterministic governed current-state output for the same fixture baseline', async () => {
    const first = await seedProject();
    const second = await seedProject();
    const run = (root: string) => executeVepUpgrade(root, compatible.version, {
      authorized: true, model, install: installFixture, rollbackInstall: rollbackFixture,
      validateActiveProjection: async () => undefined,
      regenerateActiveProjection: regenerateFixture,
    });
    await Promise.all([run(first), run(second)]);
    const paths = ['package.json', 'package-lock.json', 'openspec/changes/active-change/proposal.md', 'openspec/changes/active-change/tasks.md'];
    expect(await hashFiles(first, paths)).toEqual(await hashFiles(second, paths));
  });

  it('rejects unapproved, unsupported, incompatible, dirty, and history-rewriting targets without mutation', async () => {
    const cases: Array<[string, string, Partial<Parameters<typeof executeVepUpgrade>[2]>]> = [
      ['EXPLICIT_AUTHORIZATION_REQUIRED', compatible.version, { authorized: false }],
      ['UNSUPPORTED_TARGET', '9.9.9', { authorized: true }],
      ['INCOMPATIBLE_TARGET', incompatible.version, { authorized: true }],
      ['DIRTY_INCOMPATIBLE_STATE', compatible.version, { authorized: true, dirtyIncompatiblePaths: ['src/active-change.ts'] }],
      ['HISTORICAL_REWRITE_REQUIRED', rewritesHistory.version, { authorized: true }],
    ];
    for (const [code, target, additions] of cases) {
      const root = await seedProject();
      const before = await hashFiles(root, ['package.json', 'package-lock.json', ...historicalNames.map((name) => `.visu/work/completed-change/${name}`)]);
      await expectCode(executeVepUpgrade(root, target, {
        authorized: true, model, install: installFixture, rollbackInstall: rollbackFixture,
        validateActiveProjection: async () => undefined,
        regenerateActiveProjection: regenerateFixture,
        ...additions,
      }), code);
      expect(await hashFiles(root, Object.keys(before))).toEqual(before);
    }
  });

  it('rejects stale current projections before editing', async () => {
    const root = await seedProject();
    const before = await hashFiles(root, ['package.json', 'package-lock.json']);
    await expectCode(executeVepUpgrade(root, compatible.version, {
      authorized: true, model, install: installFixture, rollbackInstall: rollbackFixture,
      validateActiveProjection: async () => { throw new Error('stale A1 binding'); },
    }), 'STALE_CURRENT_PROJECTION');
    expect(await hashFiles(root, Object.keys(before))).toEqual(before);
  });

  it('rejects a stale current lock/install binding before editing', async () => {
    const root = await seedProject();
    const beforePackage = await readFile(path.join(root, 'package.json'), 'utf8');
    const lock = await json(path.join(root, 'package-lock.json'));
    const packages = lock.packages as Record<string, Record<string, unknown>>;
    packages[`node_modules/${PACKAGE}`].integrity = 'sha512-stale';
    await writeFile(path.join(root, 'package-lock.json'), `${JSON.stringify(lock, null, 2)}\n`);
    await expectCode(executeVepUpgrade(root, compatible.version, {
      authorized: true, model, install: installFixture, rollbackInstall: rollbackFixture,
      validateActiveProjection: async () => undefined,
    }), 'STALE_CURRENT_BINDING');
    expect(await readFile(path.join(root, 'package.json'), 'utf8')).toBe(beforePackage);
  });

  it('rolls back dependency and projection state after install or verification failure', async () => {
    for (const verificationFailure of [false, true]) {
      const root = await seedProject();
      const protectedPaths = [
        'package.json', 'package-lock.json',
        'openspec/changes/active-change/proposal.md', 'openspec/changes/active-change/tasks.md',
        ...historicalNames.map((name) => `.visu/work/completed-change/${name}`),
      ];
      const before = await hashFiles(root, protectedPaths);
      const installer = verificationFailure
        ? async (projectRoot: string, target: VepUpgradeTarget) => {
          await installFixture(projectRoot, target);
          await rm(path.join(projectRoot, 'node_modules', '.bin', process.platform === 'win32' ? 'visu.cmd' : 'visu'));
        }
        : async () => { throw new Error('fixture install failed'); };
      const error = await expectCode(executeVepUpgrade(root, compatible.version, {
        authorized: true, model, install: installer, rollbackInstall: rollbackFixture,
        validateActiveProjection: async () => undefined,
        regenerateActiveProjection: regenerateFixture,
      }), verificationFailure ? 'TARGET_VERIFICATION_FAILED' : 'INSTALL_FAILED');
      expect(error.rollbackCompleted).toBe(true);
      expect(error.mutation).toBe('CURRENT_STATE_ROLLED_BACK');
      expect(await hashFiles(root, protectedPaths)).toEqual(before);
      const installed = await json(path.join(root, 'node_modules', '@angryss', 'vep', 'package.json'));
      expect(installed.version).toBe('2.0.0');
    }
  });

  it('rejects missing, floating, wrong-scope, and competing current version authorities', async () => {
    const variants: Array<[string, Record<string, unknown>]> = [
      ['MISSING_CURRENT_VEP', { devDependencies: {} }],
      ['NON_EXACT_CURRENT_VEP', { devDependencies: { [PACKAGE]: '^2.0.0' } }],
      ['WRONG_CURRENT_VEP_PACKAGE', { devDependencies: { '@visu/vep': '2.0.0' } }],
      ['COMPETING_VERSION_AUTHORITY', { devDependencies: { [PACKAGE]: '2.0.0' }, config: { [PACKAGE]: '2.0.0' } }],
    ];
    for (const [code, contents] of variants) {
      const root = await seedProject();
      await writeFile(path.join(root, 'package.json'), `${JSON.stringify(contents, null, 2)}\n`);
      await expectCode(inspectVepUpgrade(root, compatible.version, model), code);
    }
  });
});
