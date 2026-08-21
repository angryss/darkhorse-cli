import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import inquirer from 'inquirer';
import type { DarkhorseConfig, SkillResult } from '../core/types.js';
import { pathExists, readText, writeFile } from '../core/fs.js';
import {
  CANONICAL_VEP_PACKAGE,
  evaluateVepCompatibility,
  readVepCompatibilityManifest,
} from '../core/vep-compatibility.js';

interface VepStarterInput {
  changeId: string;
  owner: string;
  problem: string;
  desiredOutcome: string;
}

export type VepGenerationPlan =
  | { enabled: false }
  | {
      enabled: true;
      projectRoot: string;
      projectName: string;
      projectVersion: string;
      starter: VepStarterInput;
      template: Record<string, unknown>;
      version: string;
      integrity: string;
      tarball: string;
    };

const IDENTIFIER = /^[A-Za-z0-9][A-Za-z0-9._:-]*$/;

function defaultStarter(config: DarkhorseConfig): VepStarterInput {
  return {
    changeId: `${config.name}-initial`,
    owner: `${config.name}-maintainers`,
    problem: config.description || `Establish ${config.name} as a governed project.`,
    desiredOutcome: `${config.name} has an approved, bounded, and independently provable initial change.`,
  };
}

async function promptStarter(config: DarkhorseConfig): Promise<VepStarterInput> {
  const defaults = defaultStarter(config);
  if (process.stdin.isTTY !== true || process.stdout.isTTY !== true) return defaults;
  return inquirer.prompt<VepStarterInput>([
    {
      type: 'input',
      name: 'changeId',
      message: 'Initial VEP change id:',
      default: defaults.changeId,
      validate: (value: string) => IDENTIFIER.test(value) || 'Use a VEP identifier: letters, numbers, dot, underscore, colon, or hyphen.',
    },
    {
      type: 'input',
      name: 'owner',
      message: 'Initial change owner:',
      default: defaults.owner,
      validate: (value: string) => value.length > 0 || 'Owner is required.',
    },
    {
      type: 'input',
      name: 'problem',
      message: 'Initial governed problem:',
      default: defaults.problem,
      validate: (value: string) => value.length > 0 || 'Problem statement is required.',
    },
    {
      type: 'input',
      name: 'desiredOutcome',
      message: 'Desired observable outcome:',
      default: defaults.desiredOutcome,
      validate: (value: string) => value.length > 0 || 'Desired outcome is required.',
    },
  ]);
}

function requireRecord(value: unknown, label: string): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Installed VEP ${label} is malformed. Reinstall the exact public ${CANONICAL_VEP_PACKAGE}@2.0.0 package.`);
  }
  return value as Record<string, unknown>;
}

export async function prepareVepReadiness(config: DarkhorseConfig): Promise<VepGenerationPlan> {
  if (!config.vep.enabled) return { enabled: false };

  const manifest = readVepCompatibilityManifest();
  if ('code' in manifest) throw new Error(`${manifest.message} ${manifest.recovery}`);
  const compatibility = evaluateVepCompatibility({
    darkhorseVersion: manifest.darkhorse.version,
    packageName: CANONICAL_VEP_PACKAGE,
    versionSpec: manifest.vep.supported[0]?.version,
  });
  if (!compatibility.supported) {
    throw new Error(`${compatibility.message} ${compatibility.recovery}`);
  }

  const require = createRequire(import.meta.url);
  let installedPackagePath: string;
  try {
    installedPackagePath = require.resolve(`${CANONICAL_VEP_PACKAGE}/package.json`);
  } catch {
    throw new Error(
      `Missing exact public ${CANONICAL_VEP_PACKAGE}@${compatibility.version}. Reinstall this Darkhorse package before generating a governed repository.`,
    );
  }
  const installedPackage = requireRecord(
    JSON.parse(await readFile(installedPackagePath, 'utf8')) as unknown,
    'package metadata',
  );
  if (installedPackage.name !== CANONICAL_VEP_PACKAGE || installedPackage.version !== compatibility.version) {
    throw new Error(
      `Installed VEP identity is incompatible. Reinstall exact public ${CANONICAL_VEP_PACKAGE}@${compatibility.version} before generation.`,
    );
  }

  const templatePath = path.join(path.dirname(installedPackagePath), 'templates', 'contract.yaml');
  let template: Record<string, unknown>;
  try {
    template = requireRecord(JSON.parse(await readFile(templatePath, 'utf8')) as unknown, 'Contract template');
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(
        `Installed VEP Contract template is malformed. Reinstall exact public ${CANONICAL_VEP_PACKAGE}@${compatibility.version}.`,
      );
    }
    throw error;
  }

  return {
    enabled: true,
    projectRoot: config.paths.root,
    projectName: config.name,
    projectVersion: config.version,
    starter: await promptStarter(config),
    template,
    version: compatibility.version,
    integrity: compatibility.integrity,
    tarball: compatibility.tarball,
  };
}

function createStarterContract(plan: Extract<VepGenerationPlan, { enabled: true }>): Record<string, unknown> {
  const contract = structuredClone(plan.template);
  const starter = plan.starter;
  const repositoryId = plan.projectName;
  const contractId = starter.changeId;
  const proofResultId = `${starter.changeId}-proof`;
  const subject = {
    contractId,
    changeId: starter.changeId,
    candidateId: 'pending-candidate',
    proofResultId,
    repositoryId,
    lineage: 'main',
    processVersion: plan.version,
    schemaVersion: plan.version,
    authoritySequence: 1,
  };

  contract.changeId = starter.changeId;
  contract.owner = starter.owner;
  contract.problem = {
    statement: starter.problem,
    desiredOutcome: starter.desiredOutcome,
  };
  contract.scope = {
    repositories: [{ id: repositoryId, root: '.' }],
    paths: { include: ['replace-with-authorized-path/**'], exclude: [] },
    interfaces: [],
  };
  contract.acceptanceCriteria = [{
    id: 'AC-1',
    statement: starter.desiredOutcome,
  }];
  contract.proofPlan = [{
    id: 'PROOF-1',
    command: {
      argv: ['npm', 'run', 'vep:discover', '--', '--json'],
      cwd: '.',
      environmentAllowlist: [],
    },
    expectedSource: {
      type: 'INDEPENDENT_ORACLE',
      reference: 'replace-with-approved-noncandidate-expected-source',
      authorityHash: `sha256:${'0'.repeat(64)}`,
    },
    proves: ['AC-1'],
  }];
  contract.authority = {
    implementation: {
      subject,
      authorIds: [starter.owner],
    },
    expectedResults: [{
      subject: { ...subject, proofId: 'PROOF-1' },
      type: 'INDEPENDENT_ORACLE',
      reference: 'replace-with-approved-noncandidate-expected-source',
      authoredBy: 'replace-with-independent-authority-owner',
      expected: { exitCode: 0, value: true },
    }],
    reviewers: [{
      subject,
      reviewerId: 'replace-with-independent-reviewer',
      kind: 'HUMAN_REVIEWER',
    }],
  };
  contract.readiness = { status: 'PENDING' };
  return contract;
}

function generatedPackage(plan: Extract<VepGenerationPlan, { enabled: true }>): Record<string, unknown> {
  return {
    name: plan.projectName,
    version: plan.projectVersion,
    private: true,
    scripts: {
      'vep:discover': 'visu discover',
      'vep:plan': 'visu plan',
      'vep:test': 'visu test',
      'vep:review': 'visu review',
      'vep:close': 'visu close',
    },
    devDependencies: {
      [CANONICAL_VEP_PACKAGE]: plan.version,
    },
  };
}

function generatedLock(plan: Extract<VepGenerationPlan, { enabled: true }>): Record<string, unknown> {
  return {
    name: plan.projectName,
    version: plan.projectVersion,
    lockfileVersion: 3,
    requires: true,
    packages: {
      '': {
        name: plan.projectName,
        version: plan.projectVersion,
        devDependencies: {
          [CANONICAL_VEP_PACKAGE]: plan.version,
        },
      },
      [`node_modules/${CANONICAL_VEP_PACKAGE}`]: {
        version: plan.version,
        resolved: plan.tarball,
        integrity: plan.integrity,
        dev: true,
        license: 'UNLICENSED',
        bin: { visu: 'bin/visu.js' },
        engines: { node: '>=24 <25' },
      },
    },
  };
}

const rootAgents = `# VEP boundary

This repository owns its package.json, package-lock.json, .darkhorse.yaml, and .visu/work state.

The sole current VEP version selection is devDependencies["@angryss/vep"] in the root package.json. Run VEP only through this project's npm scripts or node_modules/.bin/visu.

OpenSpec material is optional draft input. Once a Contract exists at .visu/work/<change-id>/contract.yaml, that A1 is the sole editable semantic and plan authority. Any later proposal/tasks views are read-only projections; amend A1 and regenerate them.

Darkhorse supplies scaffolding only. The installed @angryss/vep package supplies lifecycle, gate, artifact, proof, review, and closure semantics.
`;

const workflow = `name: VEP readiness

on:
  push:
  pull_request:
  workflow_dispatch:

permissions:
  contents: read

jobs:
  vep-readiness:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - name: Check out source
        uses: actions/checkout@v4
      - name: Use Node.js 24
        uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - name: Install exact project dependencies
        run: npm ci
      - name: Resolve the project-local VEP process
        run: npm run vep:discover -- --json
`;

async function updateGitignore(root: string): Promise<boolean> {
  const gitignorePath = path.join(root, '.gitignore');
  const existing = await pathExists(gitignorePath) ? await readText(gitignorePath) : '';
  const required = ['node_modules/', '.visu/cache/', '.visu/tmp/'];
  const missing = required.filter((entry) => !existing.split(/\r?\n/).includes(entry));
  if (missing.length === 0) return false;
  const prefix = existing.length === 0 || existing.endsWith('\n') ? existing : `${existing}\n`;
  await writeFile(gitignorePath, `${prefix}\n# VEP transient state\n${missing.join('\n')}\n`);
  return true;
}

export async function materializeVepReadiness(plan: VepGenerationPlan): Promise<SkillResult> {
  if (!plan.enabled) return { success: true, filesCreated: [], filesModified: [], errors: [] };

  const root = plan.projectRoot;
  const contractPath = path.join('.visu', 'work', plan.starter.changeId, 'contract.yaml');
  await writeFile(path.join(root, 'package.json'), `${JSON.stringify(generatedPackage(plan), null, 2)}\n`);
  await writeFile(path.join(root, 'package-lock.json'), `${JSON.stringify(generatedLock(plan), null, 2)}\n`);
  await writeFile(path.join(root, 'AGENTS.md'), rootAgents);
  await writeFile(path.join(root, '.github', 'workflows', 'vep-check.yml'), workflow);
  await writeFile(path.join(root, contractPath), `${JSON.stringify(createStarterContract(plan), null, 2)}\n`);
  const gitignoreModified = await updateGitignore(root);

  return {
    success: true,
    filesCreated: ['package.json', 'package-lock.json', 'AGENTS.md', '.github/workflows/vep-check.yml', contractPath],
    filesModified: gitignoreModified ? ['.gitignore'] : [],
    errors: [],
  };
}
