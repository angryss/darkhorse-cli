import { spawn } from 'node:child_process';
import { access, mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { CANONICAL_VEP_PACKAGE, readVepCompatibilityManifest } from '../core/vep-compatibility.js';
import { regenerateOpenSpecProjections, validateOpenSpecProjections } from '../skills/openspec.js';

const EXACT_SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const HISTORICAL_ARTIFACTS = [
  'contract.yaml',
  'proof.json',
  'review.json',
  'publication-closure.json',
] as const;

type JsonRecord = Record<string, unknown>;

export type VepUpgradeDisposition = 'compatible' | 'requires-bounded-migration';
export type VepUpgradeFailureCode =
  | 'MALFORMED_PROJECT_PACKAGE'
  | 'MISSING_CURRENT_VEP'
  | 'WRONG_CURRENT_VEP_PACKAGE'
  | 'NON_EXACT_CURRENT_VEP'
  | 'COMPETING_VERSION_AUTHORITY'
  | 'INVALID_TARGET'
  | 'UNSUPPORTED_TARGET'
  | 'INCOMPATIBLE_TARGET'
  | 'EXPLICIT_AUTHORIZATION_REQUIRED'
  | 'DIRTY_INCOMPATIBLE_STATE'
  | 'HISTORICAL_REWRITE_REQUIRED'
  | 'STALE_CURRENT_BINDING'
  | 'STALE_CURRENT_PROJECTION'
  | 'INSTALL_FAILED'
  | 'TARGET_VERIFICATION_FAILED'
  | 'HISTORICAL_ARTIFACT_DRIFT'
  | 'ROLLBACK_FAILED';

export class VepUpgradeError extends Error {
  readonly mutation: 'NONE' | 'CURRENT_STATE_ROLLED_BACK' | 'INCOMPLETE';

  constructor(
    readonly code: VepUpgradeFailureCode,
    message: string,
    readonly recovery: string,
    readonly rollbackCompleted = false,
    mutation?: 'NONE' | 'CURRENT_STATE_ROLLED_BACK' | 'INCOMPLETE',
  ) {
    super(message);
    this.name = 'VepUpgradeError';
    this.mutation = mutation ?? (rollbackCompleted ? 'CURRENT_STATE_ROLLED_BACK' : 'NONE');
  }
}

export interface VepUpgradeTarget {
  packageName: typeof CANONICAL_VEP_PACKAGE;
  version: string;
  disposition: VepUpgradeDisposition;
  source: 'packaged-manifest' | 'governed-fixture';
  publicRelease: boolean;
  integrity: string;
  tarball: string;
  requiresHistoricalRewrite?: boolean;
}

export interface VepUpgradeModel {
  schemaVersion: 1;
  darkhorseVersion: string;
  targets: readonly VepUpgradeTarget[];
}

export interface VepUpgradeInspection {
  projectRoot: string;
  currentPackage: typeof CANONICAL_VEP_PACKAGE;
  currentVersion: string;
  target: VepUpgradeTarget;
  activeChangeIds: string[];
  completedChangeIds: string[];
  disposition: VepUpgradeDisposition | 'already-current';
}

export interface VepUpgradeResult extends VepUpgradeInspection {
  status: 'UPGRADED' | 'ALREADY_CURRENT';
  regeneratedChangeIds: string[];
  historicalArtifactsVerified: number;
}

export interface VepUpgradeOptions {
  authorized: boolean;
  model?: VepUpgradeModel;
  dirtyIncompatiblePaths?: readonly string[];
  install?: (projectRoot: string, target: VepUpgradeTarget) => Promise<void>;
  rollbackInstall?: (projectRoot: string) => Promise<void>;
  validateActiveProjection?: (projectRoot: string, changeId: string) => Promise<unknown>;
  regenerateActiveProjection?: (projectRoot: string, changeId: string) => Promise<unknown>;
}

interface ProjectState {
  packagePath: string;
  lockPath: string;
  packageRaw: string;
  lockRaw: string | undefined;
  packageJson: JsonRecord;
  currentVersion: string;
  activeChangeIds: string[];
  completedChangeIds: string[];
  historicalBytes: Map<string, string>;
  projectionBytes: Map<string, string | undefined>;
}

function isRecord(value: unknown): value is JsonRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

async function exists(filePath: string): Promise<boolean> {
  try { await access(filePath); return true; } catch { return false; }
}

async function readOptional(filePath: string): Promise<string | undefined> {
  try { return await readFile(filePath, 'utf8'); } catch { return undefined; }
}

function fail(code: VepUpgradeFailureCode, message: string, recovery: string): never {
  throw new VepUpgradeError(code, message, recovery);
}

function findKeyPaths(value: unknown, key: string, prefix = ''): string[] {
  if (!isRecord(value)) return [];
  const matches: string[] = [];
  for (const [entryKey, entryValue] of Object.entries(value)) {
    const entryPath = prefix ? `${prefix}.${entryKey}` : entryKey;
    if (entryKey === key) matches.push(entryPath);
    if (isRecord(entryValue)) matches.push(...findKeyPaths(entryValue, key, entryPath));
  }
  return matches;
}

function packagedModel(): VepUpgradeModel {
  const manifest = readVepCompatibilityManifest();
  if ('code' in manifest) {
    fail('UNSUPPORTED_TARGET', manifest.message, manifest.recovery);
  }
  return {
    schemaVersion: 1,
    darkhorseVersion: manifest.darkhorse.version,
    targets: manifest.vep.supported.map((release) => ({
      packageName: CANONICAL_VEP_PACKAGE,
      version: release.version,
      disposition: 'compatible',
      source: 'packaged-manifest',
      publicRelease: true,
      integrity: release.integrity,
      tarball: release.tarball,
    })),
  };
}

function validateModelTarget(model: VepUpgradeModel, targetVersion: string): VepUpgradeTarget {
  if (!EXACT_SEMVER.test(targetVersion)) {
    fail('INVALID_TARGET', `Target VEP version "${targetVersion}" is not exact.`,
      'Select one explicit x.y.z target; floating ranges and aliases are forbidden.');
  }
  const duplicateCount = model.targets.filter((entry) => entry.version === targetVersion).length;
  const target = model.targets.find((entry) => entry.version === targetVersion);
  if (!target || duplicateCount !== 1) {
    fail('UNSUPPORTED_TARGET', `Target VEP ${targetVersion} is not uniquely admitted by the governed compatibility model.`,
      `Select one supported exact version: ${model.targets.map((entry) => entry.version).join(', ') || '(none)'}.`);
  }
  if (model.schemaVersion !== 1
    || !EXACT_SEMVER.test(model.darkhorseVersion)
    || target.packageName !== CANONICAL_VEP_PACKAGE
    || !EXACT_SEMVER.test(target.version)
    || !['compatible', 'requires-bounded-migration'].includes(target.disposition)
    || !['packaged-manifest', 'governed-fixture'].includes(target.source)
    || typeof target.publicRelease !== 'boolean'
    || typeof target.integrity !== 'string'
    || typeof target.tarball !== 'string'
    || (target.source === 'governed-fixture' && target.publicRelease)
    || (target.source === 'packaged-manifest' && !target.publicRelease)) {
    fail('INVALID_TARGET', 'The governed compatibility target is malformed or makes a false public-release claim.',
      'Use a uniquely declared packaged release or a non-public governed fixture.');
  }
  return target;
}

async function listWork(projectRoot: string): Promise<{ active: string[]; completed: string[] }> {
  const workRoot = path.join(projectRoot, '.visu', 'work');
  let entries: Array<{ name: string; isDirectory(): boolean }> = [];
  try { entries = await readdir(workRoot, { withFileTypes: true }); } catch { return { active: [], completed: [] }; }
  const active: string[] = [];
  const completed: string[] = [];
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    if (!entry.isDirectory()) continue;
    const changeRoot = path.join(workRoot, entry.name);
    if (!await exists(path.join(changeRoot, 'contract.yaml'))) continue;
    if (await exists(path.join(changeRoot, 'publication-closure.json'))) completed.push(entry.name);
    else active.push(entry.name);
  }
  return { active, completed };
}

async function snapshotHistory(projectRoot: string, completed: readonly string[]): Promise<Map<string, string>> {
  const bytes = new Map<string, string>();
  for (const changeId of completed) {
    for (const artifact of HISTORICAL_ARTIFACTS) {
      const filePath = path.join(projectRoot, '.visu', 'work', changeId, artifact);
      const raw = await readOptional(filePath);
      if (raw !== undefined) bytes.set(filePath, raw);
    }
  }
  return bytes;
}

async function snapshotProjections(projectRoot: string, active: readonly string[]): Promise<Map<string, string | undefined>> {
  const bytes = new Map<string, string | undefined>();
  for (const changeId of active) {
    for (const name of ['proposal.md', 'tasks.md']) {
      const filePath = path.join(projectRoot, 'openspec', 'changes', changeId, name);
      bytes.set(filePath, await readOptional(filePath));
    }
  }
  return bytes;
}

async function loadProjectState(projectRoot: string): Promise<ProjectState> {
  const root = path.resolve(projectRoot);
  const packagePath = path.join(root, 'package.json');
  const lockPath = path.join(root, 'package-lock.json');
  const packageRaw = await readOptional(packagePath);
  if (packageRaw === undefined) fail('MALFORMED_PROJECT_PACKAGE', 'The project root package.json is missing.', 'Restore the generated project root package.json.');
  let packageJson: JsonRecord;
  try {
    const parsed = JSON.parse(packageRaw) as unknown;
    if (!isRecord(parsed)) throw new Error('not an object');
    packageJson = parsed;
  } catch {
    fail('MALFORMED_PROJECT_PACKAGE', 'The project root package.json is malformed.', 'Repair it before attempting an upgrade.');
  }
  const legacy = findKeyPaths(packageJson, '@visu/vep');
  if (legacy.length > 0) fail('WRONG_CURRENT_VEP_PACKAGE', `Legacy VEP authority found at ${legacy.join(', ')}.`, 'Use only root devDependencies["@angryss/vep"].');
  const authorities = findKeyPaths(packageJson, CANONICAL_VEP_PACKAGE);
  const canonical = `devDependencies.${CANONICAL_VEP_PACKAGE}`;
  if (!authorities.includes(canonical)) fail('MISSING_CURRENT_VEP', 'The root devDependency does not select VEP.', 'Declare root devDependencies["@angryss/vep"] with an exact version.');
  if (authorities.length !== 1) fail('COMPETING_VERSION_AUTHORITY', `Competing VEP authorities found at ${authorities.join(', ')}.`, 'Keep only the root devDependency selection.');
  const dependencies = isRecord(packageJson.devDependencies) ? packageJson.devDependencies : {};
  const currentVersion = dependencies[CANONICAL_VEP_PACKAGE];
  if (typeof currentVersion !== 'string' || !EXACT_SEMVER.test(currentVersion)) {
    fail('NON_EXACT_CURRENT_VEP', `Current VEP selection "${String(currentVersion)}" is not exact.`, 'Restore an exact x.y.z root devDependency before upgrading.');
  }
  const work = await listWork(root);
  return {
    packagePath, lockPath, packageRaw, lockRaw: await readOptional(lockPath), packageJson,
    currentVersion, activeChangeIds: work.active, completedChangeIds: work.completed,
    historicalBytes: await snapshotHistory(root, work.completed),
    projectionBytes: await snapshotProjections(root, work.active),
  };
}

export async function inspectVepUpgrade(
  projectRoot: string,
  targetVersion: string,
  model: VepUpgradeModel = packagedModel(),
): Promise<VepUpgradeInspection> {
  const state = await loadProjectState(projectRoot);
  const target = validateModelTarget(model, targetVersion);
  return {
    projectRoot: path.resolve(projectRoot),
    currentPackage: CANONICAL_VEP_PACKAGE,
    currentVersion: state.currentVersion,
    target,
    activeChangeIds: state.activeChangeIds,
    completedChangeIds: state.completedChangeIds,
    disposition: state.currentVersion === target.version ? 'already-current' : target.disposition,
  };
}

async function atomicWrite(filePath: string, content: string): Promise<void> {
  const temporary = `${filePath}.darkhorse-vep-upgrade-${process.pid}.tmp`;
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(temporary, content, 'utf8');
  await rename(temporary, filePath);
}

async function restoreOptional(filePath: string, content: string | undefined): Promise<void> {
  if (content === undefined) await rm(filePath, { force: true });
  else await atomicWrite(filePath, content);
}

async function runNpm(projectRoot: string, args: readonly string[]): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', args, {
      cwd: projectRoot, shell: false, windowsHide: true, stdio: 'inherit',
    });
    child.once('error', reject);
    child.once('exit', (code) => code === 0 ? resolve() : reject(new Error(`npm exited ${String(code)}`)));
  });
}

async function defaultInstall(projectRoot: string, target: VepUpgradeTarget): Promise<void> {
  if (!target.publicRelease) {
    fail('UNSUPPORTED_TARGET', `Fixture ${target.version} cannot be installed from the public registry.`, 'Provide the governed fixture installer only during bounded S06 proof.');
  }
  await runNpm(projectRoot, ['install', '--save-dev', '--save-exact', `${CANONICAL_VEP_PACKAGE}@${target.version}`]);
}

async function verifyTarget(projectRoot: string, target: VepUpgradeTarget): Promise<void> {
  const rootPackage = JSON.parse(await readFile(path.join(projectRoot, 'package.json'), 'utf8')) as JsonRecord;
  const dev = isRecord(rootPackage.devDependencies) ? rootPackage.devDependencies : {};
  if (dev[CANONICAL_VEP_PACKAGE] !== target.version || findKeyPaths(rootPackage, CANONICAL_VEP_PACKAGE).length !== 1) {
    throw new Error('root package.json does not contain the sole exact target selection');
  }
  const lock = JSON.parse(await readFile(path.join(projectRoot, 'package-lock.json'), 'utf8')) as JsonRecord;
  const packages = isRecord(lock.packages) ? lock.packages : {};
  const rootLock = isRecord(packages['']) ? packages[''] : {};
  const rootDev = isRecord(rootLock.devDependencies) ? rootLock.devDependencies : {};
  const installedLock: JsonRecord = isRecord(packages[`node_modules/${CANONICAL_VEP_PACKAGE}`])
    ? packages[`node_modules/${CANONICAL_VEP_PACKAGE}`] as JsonRecord
    : {};
  if (rootDev[CANONICAL_VEP_PACKAGE] !== target.version
    || installedLock.version !== target.version
    || installedLock.integrity !== target.integrity
    || installedLock.resolved !== target.tarball) throw new Error('lock binding does not exactly match target');
  const installedRoot = path.join(projectRoot, 'node_modules', '@angryss', 'vep');
  const installed = JSON.parse(await readFile(path.join(installedRoot, 'package.json'), 'utf8')) as JsonRecord;
  if (installed.name !== CANONICAL_VEP_PACKAGE || installed.version !== target.version) throw new Error('installed package identity/version mismatch');
  await access(path.join(projectRoot, 'node_modules', '.bin', process.platform === 'win32' ? 'visu.cmd' : 'visu'));
}

async function verifyHistory(bytes: ReadonlyMap<string, string>): Promise<void> {
  for (const [filePath, expected] of bytes) {
    if (await readOptional(filePath) !== expected) {
      fail('HISTORICAL_ARTIFACT_DRIFT', `Completed historical artifact changed: ${filePath}.`, 'Stop and restore the historical bytes from governed project evidence.');
    }
  }
}

async function rollback(state: ProjectState, options: VepUpgradeOptions): Promise<void> {
  await atomicWrite(state.packagePath, state.packageRaw);
  await restoreOptional(state.lockPath, state.lockRaw);
  for (const [filePath, content] of state.projectionBytes) await restoreOptional(filePath, content);
  if (options.rollbackInstall) await options.rollbackInstall(path.dirname(state.packagePath));
  else if (state.lockRaw !== undefined) await runNpm(path.dirname(state.packagePath), ['ci']);
}

export async function executeVepUpgrade(
  projectRoot: string,
  targetVersion: string,
  options: VepUpgradeOptions,
): Promise<VepUpgradeResult> {
  const state = await loadProjectState(projectRoot);
  const model = options.model ?? packagedModel();
  const target = validateModelTarget(model, targetVersion);
  const inspection: VepUpgradeInspection = {
    projectRoot: path.resolve(projectRoot), currentPackage: CANONICAL_VEP_PACKAGE,
    currentVersion: state.currentVersion, target,
    activeChangeIds: state.activeChangeIds, completedChangeIds: state.completedChangeIds,
    disposition: state.currentVersion === target.version ? 'already-current' : target.disposition,
  };
  if (!options.authorized) fail('EXPLICIT_AUTHORIZATION_REQUIRED', 'VEP upgrades require explicit authorization.', 'Review the exact current and target versions, then authorize the bounded transaction.');
  if (options.dirtyIncompatiblePaths?.length) fail('DIRTY_INCOMPATIBLE_STATE', `Upgrade blocked by incompatible dirty state: ${options.dirtyIncompatiblePaths.join(', ')}.`, 'Preserve the work and complete bounded cleanup or migration before retrying.');
  if (target.requiresHistoricalRewrite) fail('HISTORICAL_REWRITE_REQUIRED', 'The target requires completed history to be rewritten.', 'Reject this path and create a current successor migration without normalizing history.');
  if (inspection.disposition === 'requires-bounded-migration') fail('INCOMPATIBLE_TARGET', `VEP ${target.version} requires bounded migration and affected proof replay.`, 'Amend the current approved A1 for the migration; do not mutate dependency state or completed history.');
  const current = validateModelTarget(model, state.currentVersion);
  try { await verifyTarget(inspection.projectRoot, current); }
  catch (error) {
    fail('STALE_CURRENT_BINDING', error instanceof Error ? error.message : String(error),
      'Restore the current exact root pin, lock integrity, installed package, and project-local visu before upgrading.');
  }
  if (inspection.disposition === 'already-current') {
    return { ...inspection, status: 'ALREADY_CURRENT', regeneratedChangeIds: [], historicalArtifactsVerified: state.historicalBytes.size };
  }

  const validateProjection = options.validateActiveProjection ?? validateOpenSpecProjections;
  try {
    for (const changeId of state.activeChangeIds) await validateProjection(inspection.projectRoot, changeId);
  } catch (error) {
    fail('STALE_CURRENT_PROJECTION', error instanceof Error ? error.message : String(error), 'Regenerate current projections from canonical current A1 before upgrading.');
  }

  let mutated = false;
  let phase: 'install' | 'verify' = 'install';
  try {
    const dev = isRecord(state.packageJson.devDependencies) ? { ...state.packageJson.devDependencies } : {};
    dev[CANONICAL_VEP_PACKAGE] = target.version;
    const nextPackage = { ...state.packageJson, devDependencies: dev };
    await atomicWrite(state.packagePath, `${JSON.stringify(nextPackage, null, 2)}\n`);
    mutated = true;
    await (options.install ?? defaultInstall)(inspection.projectRoot, target);
    phase = 'verify';
    await verifyTarget(inspection.projectRoot, target);
    const regenerate = options.regenerateActiveProjection ?? regenerateOpenSpecProjections;
    for (const changeId of state.activeChangeIds) await regenerate(inspection.projectRoot, changeId);
    await verifyHistory(state.historicalBytes);
    return {
      ...inspection, status: 'UPGRADED', regeneratedChangeIds: [...state.activeChangeIds],
      historicalArtifactsVerified: state.historicalBytes.size,
    };
  } catch (error) {
    if (mutated) {
      try { await rollback(state, options); }
      catch (rollbackError) {
        throw new VepUpgradeError('ROLLBACK_FAILED', `Upgrade failed and rollback was incomplete: ${rollbackError instanceof Error ? rollbackError.message : String(rollbackError)}`, 'Stop for governed correction; do not report an upgrade success.', false, 'INCOMPLETE');
      }
    }
    throw new VepUpgradeError(
      error instanceof VepUpgradeError ? error.code : phase === 'install' ? 'INSTALL_FAILED' : 'TARGET_VERIFICATION_FAILED',
      error instanceof Error ? error.message : String(error),
      'The pre-upgrade package, lock, and current projections were restored; inspect the target install/verification failure.',
      mutated,
      error instanceof VepUpgradeError && error.code === 'HISTORICAL_ARTIFACT_DRIFT' ? 'INCOMPLETE' : undefined,
    );
  }
}
