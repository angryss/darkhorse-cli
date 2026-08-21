import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  CANONICAL_VEP_PACKAGE,
  evaluateVepCompatibility,
  readVepCompatibilityManifest,
  type VepCompatibilityFailureCode,
} from './vep-compatibility.js';

type JsonRecord = Record<string, unknown>;

export type ProjectVepBoundaryFailureCode =
  | VepCompatibilityFailureCode
  | 'MALFORMED_PROJECT_PACKAGE'
  | 'WRONG_PACKAGE_IDENTITY'
  | 'MISSING_PROJECT_LOCK'
  | 'MALFORMED_PROJECT_LOCK'
  | 'LOCK_VERSION_MISMATCH'
  | 'LOCK_INTEGRITY_MISMATCH'
  | 'NON_PUBLIC_TARBALL'
  | 'MISSING_LOCAL_INSTALL'
  | 'INSTALLED_PACKAGE_MISMATCH'
  | 'MISSING_PROJECT_LOCAL_VISU';

export class ProjectVepBoundaryError extends Error {
  readonly code: ProjectVepBoundaryFailureCode;
  readonly recovery: string;

  constructor(code: ProjectVepBoundaryFailureCode, message: string, recovery: string) {
    super(message);
    this.name = 'ProjectVepBoundaryError';
    this.code = code;
    this.recovery = recovery;
  }
}

export interface ProjectVepSelection {
  projectRoot: string;
  packageName: typeof CANONICAL_VEP_PACKAGE;
  version: string;
  integrity: string;
  tarball: string;
}

export interface ProjectLocalVepResolution extends ProjectVepSelection {
  executable: string;
  installedPackageJson: string;
  packageLock: string;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function readJson(filePath: string, code: ProjectVepBoundaryFailureCode, recovery: string): Promise<JsonRecord> {
  try {
    const value = JSON.parse(await readFile(filePath, 'utf8')) as unknown;
    if (!isRecord(value)) throw new Error('not an object');
    return value;
  } catch {
    throw new ProjectVepBoundaryError(code, `Unable to read a valid JSON object from ${filePath}.`, recovery);
  }
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

function throwCompatibilityFailure(result: Exclude<ReturnType<typeof evaluateVepCompatibility>, { supported: true }>): never {
  throw new ProjectVepBoundaryError(result.code, result.message, result.recovery);
}

export async function readProjectVepSelection(projectRoot: string): Promise<ProjectVepSelection> {
  const root = path.resolve(projectRoot);
  const packagePath = path.join(root, 'package.json');
  const projectPackage = await readJson(
    packagePath,
    'MALFORMED_PROJECT_PACKAGE',
    'Create or repair the generated project root package.json before using VEP.',
  );

  const legacyPaths = findKeyPaths(projectPackage, '@visu/vep');
  if (legacyPaths.length > 0) {
    throw new ProjectVepBoundaryError(
      'WRONG_PACKAGE_IDENTITY',
      `Legacy VEP package identity found at ${legacyPaths.join(', ')}.`,
      'Remove @visu/vep and declare only devDependencies["@angryss/vep"] in the root package.json.',
    );
  }

  const authorityPaths = findKeyPaths(projectPackage, CANONICAL_VEP_PACKAGE);
  const canonicalAuthority = `devDependencies.${CANONICAL_VEP_PACKAGE}`;
  if (authorityPaths.length === 0) {
    const result = evaluateVepCompatibility({
      darkhorseVersion: readManifestVersion(),
      packageName: undefined,
      versionSpec: undefined,
    });
    if (!result.supported) throwCompatibilityFailure(result);
  }

  const competingAuthorities = authorityPaths.filter((entry) => entry !== canonicalAuthority);
  const devDependencies = isRecord(projectPackage.devDependencies) ? projectPackage.devDependencies : {};
  const versionSpec = devDependencies[CANONICAL_VEP_PACKAGE];
  const result = evaluateVepCompatibility({
    darkhorseVersion: readManifestVersion(),
    packageName: CANONICAL_VEP_PACKAGE,
    versionSpec,
    competingVersionAuthorities: competingAuthorities,
  });
  if (!result.supported) throwCompatibilityFailure(result);

  return {
    projectRoot: root,
    packageName: result.packageName,
    version: result.version,
    integrity: result.integrity,
    tarball: result.tarball,
  };
}

function readManifestVersion(): string {
  const manifest = readVepCompatibilityManifest();
  if ('code' in manifest) throwCompatibilityFailure(manifest);
  return manifest.darkhorse.version;
}

export async function resolveProjectLocalVisu(projectRoot: string): Promise<ProjectLocalVepResolution> {
  const selection = await readProjectVepSelection(projectRoot);
  const lockPath = path.join(selection.projectRoot, 'package-lock.json');
  const lock = await readJson(
    lockPath,
    'MISSING_PROJECT_LOCK',
    'Run a clean npm install in the generated project to create an integrity-bound package-lock.json.',
  );
  if (!isRecord(lock.packages)) {
    throw new ProjectVepBoundaryError(
      'MALFORMED_PROJECT_LOCK',
      'The root package-lock.json has no packages map.',
      'Regenerate package-lock.json with a clean supported npm install.',
    );
  }

  const rootLock = lock.packages[''];
  const installedLock = lock.packages[`node_modules/${CANONICAL_VEP_PACKAGE}`];
  if (!isRecord(rootLock) || !isRecord(rootLock.devDependencies)
    || rootLock.devDependencies[CANONICAL_VEP_PACKAGE] !== selection.version
    || !isRecord(installedLock)) {
    throw new ProjectVepBoundaryError(
      'LOCK_VERSION_MISMATCH',
      'The package lock does not bind the root exact VEP devDependency to the selected release.',
      'Run a clean npm install after restoring the exact root package.json VEP pin.',
    );
  }
  if (installedLock.version !== selection.version) {
    throw new ProjectVepBoundaryError(
      'LOCK_VERSION_MISMATCH',
      `The package lock resolves VEP to "${String(installedLock.version)}" instead of "${selection.version}".`,
      'Regenerate package-lock.json from the exact supported root package.json pin.',
    );
  }
  if (installedLock.integrity !== selection.integrity) {
    throw new ProjectVepBoundaryError(
      'LOCK_INTEGRITY_MISMATCH',
      'The package lock VEP integrity does not match the verified public release.',
      'Remove the suspect install and lock, then perform a clean exact install from registry.npmjs.org.',
    );
  }
  if (installedLock.resolved !== selection.tarball) {
    throw new ProjectVepBoundaryError(
      'NON_PUBLIC_TARBALL',
      `The package lock resolves VEP from "${String(installedLock.resolved)}" instead of the verified public registry tarball.`,
      'Regenerate the lock using @angryss/vep at the exact supported version from registry.npmjs.org.',
    );
  }

  const installedPackageJson = path.join(
    selection.projectRoot,
    'node_modules',
    '@angryss',
    'vep',
    'package.json',
  );
  let installedPackage: JsonRecord;
  try {
    installedPackage = await readJson(
      installedPackageJson,
      'MISSING_LOCAL_INSTALL',
      'Run a clean npm install in the generated project; no global or source-tree fallback is allowed.',
    );
  } catch (error) {
    if (error instanceof ProjectVepBoundaryError) throw error;
    throw error;
  }
  if (installedPackage.name !== CANONICAL_VEP_PACKAGE || installedPackage.version !== selection.version) {
    throw new ProjectVepBoundaryError(
      'INSTALLED_PACKAGE_MISMATCH',
      'The project-local installed VEP identity/version does not match the root package authority.',
      'Remove node_modules and perform a clean exact install in the generated project.',
    );
  }

  const executable = path.join(
    selection.projectRoot,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'visu.cmd' : 'visu',
  );
  try {
    await access(executable);
  } catch {
    throw new ProjectVepBoundaryError(
      'MISSING_PROJECT_LOCAL_VISU',
      'The project-local visu executable is missing.',
      'Repair the project-local exact VEP install; no global or source-tree fallback is allowed.',
    );
  }

  return {
    ...selection,
    executable,
    installedPackageJson,
    packageLock: lockPath,
  };
}
