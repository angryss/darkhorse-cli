import { Command } from 'commander';
import { spawnSync } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { logger } from '../core/logger.js';
import { ProjectVepBoundaryError, resolveProjectLocalVisu } from '../core/vep.js';
import { validateOpenSpecProjections } from '../skills/openspec.js';

type LifecycleRecord = Record<string, unknown>;

export class LifecycleBoundaryError extends Error {
  readonly code: string;
  constructor(code: string, message: string) { super(message); this.name = 'LifecycleBoundaryError'; this.code = code; }
}

function isLifecycleRecord(value: unknown): value is LifecycleRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function resolveInstalledVisuEntrypoint(projectRoot: string): Promise<{ entrypoint: string; packageRoot: string; packageName: string; version: string; }> {
  const resolution = await resolveProjectLocalVisu(projectRoot);
  let installedPackage: LifecycleRecord;
  try {
    const parsed = JSON.parse(await readFile(resolution.installedPackageJson, 'utf8')) as unknown;
    if (!isLifecycleRecord(parsed)) throw new Error('not an object');
    installedPackage = parsed;
  } catch { throw new LifecycleBoundaryError('CORRUPT_PROJECT_LOCAL_VISU', 'The project-local VEP package metadata is unreadable.'); }
  const bin = installedPackage.bin;
  const visuBin = isLifecycleRecord(bin) ? bin.visu : undefined;
  if (typeof visuBin !== 'string' || visuBin.length === 0) throw new LifecycleBoundaryError('MISSING_VISU_COMMAND', 'The project-local VEP package does not declare the visu command.');
  const packageRoot = path.dirname(resolution.installedPackageJson);
  const entrypoint = path.resolve(packageRoot, visuBin);
  const relativeEntrypoint = path.relative(packageRoot, entrypoint);
  if (relativeEntrypoint.startsWith('..') || path.isAbsolute(relativeEntrypoint)) throw new LifecycleBoundaryError('INVALID_VISU_COMMAND', 'The project-local visu command escapes its installed package.');
  try { await access(entrypoint); } catch { throw new LifecycleBoundaryError('MISSING_VISU_COMMAND', 'The project-local visu command entrypoint is missing.'); }
  return { entrypoint, packageRoot, packageName: resolution.packageName, version: resolution.version };
}

export async function delegateProjectLocalVisu(projectRoot: string, command: 'discover' | 'plan' | 'test' | 'review' | 'close', args: readonly string[] = []): Promise<number> {
  const root = path.resolve(projectRoot);
  const { entrypoint } = await resolveInstalledVisuEntrypoint(root);
  const child = spawnSync(process.execPath, [entrypoint, command, ...args], { cwd: root, env: process.env, shell: false, windowsHide: true, stdio: ['inherit', 'pipe', 'pipe'] });
  if (child.stdout?.length) process.stdout.write(child.stdout);
  if (child.stderr?.length) process.stderr.write(child.stderr);
  if (child.error) throw new LifecycleBoundaryError('VISU_EXECUTION_FAILED', child.error.message);
  return typeof child.status === 'number' ? child.status : 1;
}

export async function verifyApprovedImplementationA1(projectRoot: string, changeId: string): Promise<{ projectRoot: string; changeId: string; packageName: string; version: string; }> {
  const root = path.resolve(projectRoot);
  await validateOpenSpecProjections(root, changeId);
  const installed = await resolveInstalledVisuEntrypoint(root);
  const contractPath = path.join(root, '.visu', 'work', changeId, 'contract.yaml');
  let contract: LifecycleRecord;
  try {
    const parsed = JSON.parse(await readFile(contractPath, 'utf8')) as unknown;
    if (!isLifecycleRecord(parsed)) throw new Error('not an object');
    contract = parsed;
  } catch { throw new LifecycleBoundaryError('INVALID_A1', `Unable to read the canonical A1 for ${changeId}.`); }
  const authority = isLifecycleRecord(contract.authority) ? contract.authority : undefined;
  const implementation = authority && isLifecycleRecord(authority.implementation) ? authority.implementation : undefined;
  const subject = implementation && isLifecycleRecord(implementation.subject) ? implementation.subject : undefined;
  if (!subject) throw new LifecycleBoundaryError('INVALID_A1_AUTHORITY', 'The canonical A1 has no implementation authority subject.');
  const validatorPath = path.join(installed.packageRoot, 'dist', 'validate.js');
  try { await access(validatorPath); } catch { throw new LifecycleBoundaryError('MISSING_VEP_VALIDATOR', 'The project-local VEP validator is missing.'); }
  const validator = await import(pathToFileURL(validatorPath).href) as { loadGovernedContract?: (lookup: LifecycleRecord) => Promise<unknown>; };
  if (typeof validator.loadGovernedContract !== 'function') throw new LifecycleBoundaryError('MISSING_VEP_VALIDATOR', 'The project-local VEP validator is incompatible.');
  await validator.loadGovernedContract({ ...subject, repositoryRoot: root });
  return { projectRoot: root, changeId, packageName: installed.packageName, version: installed.version };
}

export function reportLifecycleBoundaryError(error: unknown): void {
  if (error instanceof ProjectVepBoundaryError) { process.stderr.write(`${error.code}: ${error.message}\nRecovery: ${error.recovery}\n`); return; }
  if (error instanceof LifecycleBoundaryError) { process.stderr.write(`${error.code}: ${error.message}\n`); return; }
  if (isLifecycleRecord(error) && typeof error.code === 'string' && error instanceof Error) { process.stderr.write(`${error.code}: ${error.message}\n`); return; }
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
}

export function registerValidateCommand(program: Command): void {
  program
    .command('validate')
    .description('Validate architecture rules for the current WPF project')
    .option('-p, --project <dir>', 'Project root directory (default: cwd)', '.')
    .action(async (_opts) => {
      logger.warn('Validate command not yet implemented');
      logger.info('See openspec/specs/architecture/architecture-rules.md for the rules to validate against.');
    });
}
