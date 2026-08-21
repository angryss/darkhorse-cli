// ──────────────────────────────────────────────────────────────────
// Skill: seedOpenSpec
// Seeds the OpenSpec system into the generated project — AGENTS.md,
// architecture rules, pattern guides, workflow docs, domain starters,
// roadmap/progress trackers, and GitHub agent files.
// ──────────────────────────────────────────────────────────────────

import path from 'node:path';
import fs from 'node:fs/promises';
import type { DarkhorseConfig, SkillResult, TemplateContext } from '../core/types.js';
import { TemplateEngine } from '../core/template-engine.js';
import { ensureDir, pathExists } from '../core/fs.js';
import { getTemplatesDir, getRulesDir, getGuidesDir, getWorkflowsDir } from './registry.js';
import { createHash } from 'node:crypto';
import { access as nodeAccess, mkdir as nodeMkdir, readFile as nodeReadFile, writeFile as nodeWriteFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolveProjectLocalVisu } from '../core/vep.js';
import { CANONICAL_VEP_PACKAGE } from '../core/vep-compatibility.js';

export const OPENSPEC_DRAFT_VERSION = '1.0.0' as const;
export const OPENSPEC_PROJECTION_VERSION = '1.0.0' as const;
const VEP_SCHEMA = 'https://schemas.visu.dev/vep/2.0/vep-workflow.schema.json#/$defs/contractPlan';
const VEP_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]*$/;
type JsonRecord = Record<string, unknown>;
type ProjectionKind = 'proposal' | 'tasks';

export type OpenSpecAdapterFailureCode =
  | 'MALFORMED_OPENSPEC_DRAFT' | 'UNSUPPORTED_OPENSPEC_DRAFT_VERSION'
  | 'INVALID_CHANGE_ID' | 'DRAFT_OUTSIDE_PROJECT' | 'A1_ALREADY_MATERIALIZED'
  | 'A1_NOT_MATERIALIZED' | 'A1_CHANGE_ID_MISMATCH' | 'A1_VALIDATION_FAILED'
  | 'PROJECTION_MISSING' | 'CROSS_CHANGE_PROJECTION'
  | 'STALE_PROJECTION_BINDING' | 'DIRECT_PROJECTION_EDIT';

export class OpenSpecAdapterError extends Error {
  readonly mutation = 'NONE' as const;
  constructor(
    readonly code: OpenSpecAdapterFailureCode,
    message: string,
    readonly recovery: string,
  ) { super(message); this.name = 'OpenSpecAdapterError'; }
}

export interface ProjectionBinding {
  projectionSchemaVersion: typeof OPENSPEC_PROJECTION_VERSION;
  projectionKind: ProjectionKind;
  changeId: string;
  vepPackage: typeof CANONICAL_VEP_PACKAGE;
  vepVersion: string;
  a1Path: string;
  a1Sha256: string;
  generationId: string;
}
export interface OpenSpecMaterializationResult {
  changeId: string; draftPath: string; draftSha256: string;
  a1Path: string; a1Sha256: string; proposalPath: string; tasksPath: string;
}

const DRAFT_KEYS = [
  'kind', 'draftVersion', 'changeId', 'owner', 'problemIntent', 'scope',
  'exclusions', 'dependencies', 'assumptions', 'acceptance', 'proofStrategy',
  'risks', 'riskTier', 'reviewDisposition', 'reviewMode',
  'reviewQualification', 'authority', 'implementationHorizon',
] as const;

function asRecord(value: unknown): value is JsonRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function hasExactKeys(value: JsonRecord, keys: readonly string[]): boolean {
  const actual = Object.keys(value);
  return actual.length === keys.length && keys.every((key) => Object.hasOwn(value, key));
}
function clone<T>(value: T): T { return structuredClone(value); }
function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!asRecord(value)) return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
}
function canonicalJson(value: unknown, pretty = false): string {
  return `${JSON.stringify(canonicalize(value), null, pretty ? 2 : undefined)}${pretty ? '\n' : ''}`;
}
function sha256(value: string): string {
  return `sha256:${createHash('sha256').update(value, 'utf8').digest('hex')}`;
}
function stop(code: OpenSpecAdapterFailureCode, message: string, recovery: string): never {
  throw new OpenSpecAdapterError(code, message, recovery);
}
function requireId(value: unknown): asserts value is string {
  if (typeof value !== 'string' || !VEP_ID.test(value)) {
    stop('INVALID_CHANGE_ID', 'The OpenSpec/VEP change id is malformed.',
      'Use letters, numbers, dot, underscore, colon, or hyphen.');
  }
}
function locations(projectRoot: string, changeId: string) {
  requireId(changeId);
  const root = path.resolve(projectRoot);
  const a1Relative = path.posix.join('.visu', 'work', changeId, 'contract.yaml');
  const projectionRoot = path.join(root, 'openspec', 'changes', changeId);
  return {
    root, a1Relative, a1: path.join(root, ...a1Relative.split('/')),
    proposal: path.join(projectionRoot, 'proposal.md'),
    tasks: path.join(projectionRoot, 'tasks.md'),
  };
}
async function exists(filePath: string): Promise<boolean> {
  try { await nodeAccess(filePath); return true; } catch { return false; }
}
async function parseJson(filePath: string, code: OpenSpecAdapterFailureCode): Promise<unknown> {
  try { return JSON.parse(await nodeReadFile(filePath, 'utf8')) as unknown; }
  catch {
    stop(code, `Invalid JSON at ${filePath}.`,
      code === 'MALFORMED_OPENSPEC_DRAFT'
        ? 'Correct the draft without changing any existing A1.'
        : 'Restore or amend the canonical A1 through the adapter.');
  }
}
async function validateA1(projectRoot: string, value: unknown) {
  const resolution = await resolveProjectLocalVisu(projectRoot);
  const url = pathToFileURL(path.join(
    path.dirname(resolution.installedPackageJson), 'dist', 'validate.js',
  )).href;
  const module = await import(url) as {
    validateContract?: (input: unknown) => { status: string; reasonCode?: string };
  };
  if (typeof module.validateContract !== 'function') {
    stop('A1_VALIDATION_FAILED', 'The exact project-local VEP validator is unavailable.',
      `Repair ${CANONICAL_VEP_PACKAGE}@${resolution.version}; do not use a fallback.`);
  }
  const result = module.validateContract(value);
  if (result.status !== 'PASS') {
    stop('A1_VALIDATION_FAILED',
      `Installed VEP rejected the candidate A1 (${result.reasonCode ?? 'UNKNOWN_REASON'}).`,
      'Correct the adapter input and rerun validation without mutating current authority.');
  }
  return resolution;
}

/** Complete, one-way mapping from optional draft semantics to candidate A1. */
export function mapOpenSpecDraftToCandidateA1(value: unknown, vepVersion: string): JsonRecord {
  if (!asRecord(value) || !hasExactKeys(value, DRAFT_KEYS)) {
    stop('MALFORMED_OPENSPEC_DRAFT', 'Draft fields are incomplete or extra.',
      `Provide exactly: ${DRAFT_KEYS.join(', ')}.`);
  }
  if (value.kind !== 'OpenSpecDraft' || value.draftVersion !== OPENSPEC_DRAFT_VERSION) {
    stop('UNSUPPORTED_OPENSPEC_DRAFT_VERSION', 'The draft version is unsupported.',
      `Use OpenSpecDraft ${OPENSPEC_DRAFT_VERSION}; never infer or merge versions.`);
  }
  requireId(value.changeId);
  if (!asRecord(value.problemIntent)
    || !hasExactKeys(value.problemIntent, ['statement', 'desiredOutcome'])
    || !asRecord(value.risks)
    || !hasExactKeys(value.risks, ['triggers', 'rationale'])) {
    stop('MALFORMED_OPENSPEC_DRAFT', 'problemIntent or risks is malformed.',
      'Provide problemIntent {statement, desiredOutcome}, risks {triggers, rationale}, and riskTier.');
  }
  return {
    $schema: VEP_SCHEMA, kind: 'VEPContractPlan',
    schemaVersion: vepVersion, processVersion: vepVersion,
    changeId: value.changeId, owner: clone(value.owner),
    problem: clone(value.problemIntent), scope: clone(value.scope),
    exclusions: clone(value.exclusions), dependencies: clone(value.dependencies),
    assumptions: clone(value.assumptions), acceptanceCriteria: clone(value.acceptance),
    proofPlan: clone(value.proofStrategy),
    risk: {
      tier: clone(value.riskTier), triggers: clone(value.risks.triggers),
      rationale: clone(value.risks.rationale),
    },
    reviewDisposition: clone(value.reviewDisposition), reviewMode: clone(value.reviewMode),
    reviewQualification: clone(value.reviewQualification), authority: clone(value.authority),
    pathToDone: clone(value.implementationHorizon), readiness: { status: 'PENDING' },
  };
}

function makeBinding(
  projectionKind: ProjectionKind, changeId: string, vepVersion: string,
  a1Path: string, a1Sha256: string,
): ProjectionBinding {
  const base = {
    projectionSchemaVersion: OPENSPEC_PROJECTION_VERSION, projectionKind,
    changeId, vepPackage: CANONICAL_VEP_PACKAGE, vepVersion, a1Path, a1Sha256,
  };
  return { ...base, generationId: sha256(canonicalJson(base)) };
}
function marker(binding: ProjectionBinding): string {
  return `<!-- darkhorse-vep-projection ${canonicalJson(binding)} -->`;
}
function renderProposal(a1: JsonRecord, binding: ProjectionBinding): string {
  const view = {
    problemIntent: a1.problem, scope: a1.scope, exclusions: a1.exclusions,
    acceptance: a1.acceptanceCriteria, proofStrategy: a1.proofPlan,
    risks: {
      triggers: asRecord(a1.risk) ? a1.risk.triggers : undefined,
      rationale: asRecord(a1.risk) ? a1.risk.rationale : undefined,
    },
    riskTier: asRecord(a1.risk) ? a1.risk.tier : undefined,
  };
  return `${marker(binding)}
# ${binding.changeId} — A1 proposal projection

> GENERATED, READ-ONLY VIEW. Authority: \`${binding.a1Path}\`.
> Amend A1 through the adapter, validate with installed VEP, then regenerate.

\`\`\`json
${canonicalJson(view, true)}\`\`\`
`;
}
function renderTasks(a1: JsonRecord, binding: ProjectionBinding): string {
  return `${marker(binding)}
# ${binding.changeId} — A1 task projection

> GENERATED, READ-ONLY VIEW. Do not tick, reorder, or amend tasks here.
> Amend \`${binding.a1Path}\` through the adapter, then regenerate.

\`\`\`json
${canonicalJson({ implementationHorizon: a1.pathToDone }, true)}\`\`\`
`;
}
function projections(a1: JsonRecord, version: string, a1Path: string, raw: string) {
  requireId(a1.changeId);
  const hash = sha256(raw);
  const proposalBinding = makeBinding('proposal', a1.changeId, version, a1Path, hash);
  const tasksBinding = makeBinding('tasks', a1.changeId, version, a1Path, hash);
  return {
    hash, proposalBinding, tasksBinding,
    proposal: renderProposal(a1, proposalBinding),
    tasks: renderTasks(a1, tasksBinding),
  };
}
async function writeSet(
  target: ReturnType<typeof locations>, a1Raw: string | undefined,
  view: ReturnType<typeof projections>,
): Promise<void> {
  await nodeMkdir(path.dirname(target.a1), { recursive: true });
  await nodeMkdir(path.dirname(target.proposal), { recursive: true });
  if (a1Raw !== undefined) await nodeWriteFile(target.a1, a1Raw, 'utf8');
  await nodeWriteFile(target.proposal, view.proposal, 'utf8');
  await nodeWriteFile(target.tasks, view.tasks, 'utf8');
}
function relative(root: string, filePath: string): string {
  return path.relative(root, filePath).split(path.sep).join('/');
}

/** One-time authority transition: draft -> VEP-validated A1 -> projections. */
export async function materializeOpenSpecDraft(
  projectRoot: string, draftPath: string,
): Promise<OpenSpecMaterializationResult> {
  const root = path.resolve(projectRoot);
  const absoluteDraft = path.resolve(root, draftPath);
  const rel = path.relative(root, absoluteDraft);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    stop('DRAFT_OUTSIDE_PROJECT', 'The draft path escapes the project.',
      'Place it under openspec/changes/<change-id>/ and retry.');
  }
  let draftRaw: string;
  try { draftRaw = await nodeReadFile(absoluteDraft, 'utf8'); }
  catch {
    stop('MALFORMED_OPENSPEC_DRAFT', `Draft missing at ${absoluteDraft}.`,
      'Create one complete JSON OpenSpecDraft inside the project.');
  }
  const draft = await parseJson(absoluteDraft, 'MALFORMED_OPENSPEC_DRAFT');
  if (!asRecord(draft)) {
    stop('MALFORMED_OPENSPEC_DRAFT', 'The draft is not an object.', 'Correct it and retry.');
  }
  requireId(draft.changeId);
  const target = locations(root, draft.changeId);
  if (await exists(target.a1)) {
    stop('A1_ALREADY_MATERIALIZED', `A1 already exists for ${draft.changeId}.`,
      'OpenSpec is no longer authority; use amendCanonicalA1 and regenerate.');
  }
  const resolution = await resolveProjectLocalVisu(root);
  const candidate = mapOpenSpecDraftToCandidateA1(draft, resolution.version);
  await validateA1(root, candidate);
  const raw = canonicalJson(candidate, true);
  const view = projections(candidate, resolution.version, target.a1Relative, raw);
  await writeSet(target, raw, view);
  return {
    changeId: draft.changeId, draftPath: relative(root, absoluteDraft),
    draftSha256: sha256(draftRaw), a1Path: target.a1Relative, a1Sha256: view.hash,
    proposalPath: relative(root, target.proposal), tasksPath: relative(root, target.tasks),
  };
}

async function loadA1(projectRoot: string, changeId: string) {
  const target = locations(projectRoot, changeId);
  if (!await exists(target.a1)) {
    stop('A1_NOT_MATERIALIZED', `No canonical A1 exists for ${changeId}.`,
      'Materialize and validate one complete draft first.');
  }
  const raw = await nodeReadFile(target.a1, 'utf8');
  const value = await parseJson(target.a1, 'A1_NOT_MATERIALIZED');
  if (!asRecord(value)) {
    stop('A1_VALIDATION_FAILED', 'Canonical A1 is malformed.', 'Amend A1 through the adapter.');
  }
  if (value.changeId !== changeId) {
    stop('A1_CHANGE_ID_MISMATCH', 'A1 path and changeId disagree.',
      'Restore the correct A1; never merge projections across changes.');
  }
  const resolution = await validateA1(target.root, value);
  return { target, raw, value, resolution };
}
function parseMarker(content: string): ProjectionBinding | undefined {
  const match = /^<!-- darkhorse-vep-projection (.+) -->$/.exec(content.split(/\r?\n/, 1)[0]);
  if (!match) return undefined;
  try {
    const value = JSON.parse(match[1]) as unknown;
    return asRecord(value) ? value as unknown as ProjectionBinding : undefined;
  } catch { return undefined; }
}
function rejectProjection(
  actual: string, expected: string, binding: ProjectionBinding, filePath: string,
): never {
  const found = parseMarker(actual);
  if (found?.changeId !== undefined && found.changeId !== binding.changeId) {
    stop('CROSS_CHANGE_PROJECTION', `${filePath} belongs to another change.`,
      'Discard it and regenerate from this change A1.');
  }
  if (!found
    || found.projectionSchemaVersion !== binding.projectionSchemaVersion
    || found.vepPackage !== binding.vepPackage || found.vepVersion !== binding.vepVersion
    || found.a1Path !== binding.a1Path || found.a1Sha256 !== binding.a1Sha256
    || found.generationId !== binding.generationId) {
    stop('STALE_PROJECTION_BINDING', `${filePath} has a stale or mixed binding.`,
      'Regenerate from the current validated A1.');
  }
  if (actual !== expected) {
    stop('DIRECT_PROJECTION_EDIT', `${filePath} was edited directly.`,
      'Amend A1 through the adapter if meaning changes, then regenerate.');
  }
  throw new Error('unreachable');
}

/** Nonmutating A1/projection validation. */
export async function validateOpenSpecProjections(
  projectRoot: string, changeId: string,
): Promise<{ proposal: ProjectionBinding; tasks: ProjectionBinding }> {
  const loaded = await loadA1(projectRoot, changeId);
  const view = projections(
    loaded.value, loaded.resolution.version, loaded.target.a1Relative, loaded.raw,
  );
  for (const [filePath, expected, binding] of [
    [loaded.target.proposal, view.proposal, view.proposalBinding],
    [loaded.target.tasks, view.tasks, view.tasksBinding],
  ] as const) {
    if (!await exists(filePath)) {
      stop('PROJECTION_MISSING', `Derived projection missing at ${filePath}.`,
        'Regenerate both projections from current validated A1.');
    }
    const actual = await nodeReadFile(filePath, 'utf8');
    if (actual !== expected) rejectProjection(actual, expected, binding, filePath);
  }
  return { proposal: view.proposalBinding, tasks: view.tasksBinding };
}

/** Explicit recovery for derived drift; never reads projection meaning into A1. */
export async function regenerateOpenSpecProjections(
  projectRoot: string, changeId: string,
): Promise<{ proposal: ProjectionBinding; tasks: ProjectionBinding }> {
  const loaded = await loadA1(projectRoot, changeId);
  const view = projections(
    loaded.value, loaded.resolution.version, loaded.target.a1Relative, loaded.raw,
  );
  await writeSet(loaded.target, undefined, view);
  return { proposal: view.proposalBinding, tasks: view.tasksBinding };
}

/** Validate amended A1 before replacing A1 and projections. */
export async function amendCanonicalA1(
  projectRoot: string, changeId: string, candidate: unknown,
): Promise<{ proposal: ProjectionBinding; tasks: ProjectionBinding }> {
  const current = await loadA1(projectRoot, changeId);
  if (!asRecord(candidate) || candidate.changeId !== changeId) {
    stop('A1_CHANGE_ID_MISMATCH', 'Amended A1 has another identity.',
      'Amend only this canonical A1; never reverse-merge projection content.');
  }
  await validateA1(current.target.root, candidate);
  const raw = canonicalJson(candidate, true);
  const view = projections(candidate, current.resolution.version, current.target.a1Relative, raw);
  await writeSet(current.target, raw, view);
  return { proposal: view.proposalBinding, tasks: view.tasksBinding };
}

export async function seedOpenSpec(config: DarkhorseConfig): Promise<SkillResult> {
  const filesCreated: string[] = [];
  const errors: string[] = [];
  const engine = new TemplateEngine(getTemplatesDir());
  const { root, openspec } = config.paths;

  const ctx: TemplateContext = {
    project: config,
    timestamp: new Date().toISOString().split('T')[0],
    cliVersion: '0.1.0',
  };

  try {
    // ── AGENTS.md ──────────────────────────────────────────────

    await engine.render('openspec/AGENTS.md.hbs', ctx, path.join(openspec, 'AGENTS.md'));
    filesCreated.push('openspec/AGENTS.md');

    // ── Architecture specs (copied from rules/) ────────────────

    const archDir = path.join(openspec, 'specs', 'architecture');
    await ensureDir(archDir);
    const copied = await copyMarkdownDir(getRulesDir(), archDir);
    filesCreated.push(...copied.map((f) => `openspec/specs/architecture/${path.basename(f)}`));

    // ── Pattern specs (copied from guides/) ────────────────────

    const patternDir = path.join(openspec, 'specs', 'patterns');
    await ensureDir(patternDir);
    const patternCopied = await copyMarkdownDir(getGuidesDir(), patternDir);
    filesCreated.push(...patternCopied.map((f) => `openspec/specs/patterns/${path.basename(f)}`));

    // ── Workflow skills (copied from workflows/skills/) ────────────

    const workflowDir = path.join(openspec, 'specs', 'workflow');
    const skillsDest = path.join(workflowDir, 'skills');
    await ensureDir(skillsDest);
    const skillCopied = await copyMarkdownDir(path.join(getWorkflowsDir(), 'skills'), skillsDest);
    filesCreated.push(...skillCopied.map((f) => `openspec/specs/workflow/skills/${path.basename(f)}`));

    // ── Domain starter ─────────────────────────────────────────

    const domainDir = path.join(openspec, 'specs', 'domain');
    await ensureDir(domainDir);
    await engine.render('openspec/specs/domain/README.md.hbs', ctx, path.join(domainDir, 'README.md'));
    filesCreated.push('openspec/specs/domain/README.md');

    // ── Project roadmap + progress tracker ─────────────────────

    const projectDir = path.join(openspec, 'specs', 'project');
    await ensureDir(projectDir);
    await engine.render('openspec/specs/project/roadmap.md.hbs', ctx, path.join(projectDir, 'roadmap.md'));
    filesCreated.push('openspec/specs/project/roadmap.md');

    const progressDir = path.join(openspec, 'changes', 'mvp-1.0');
    await ensureDir(progressDir);
    await engine.render(
      'openspec/specs/project/progress-tracker.md.hbs',
      ctx,
      path.join(progressDir, 'progress-tracker.md'),
    );
    filesCreated.push('openspec/changes/mvp-1.0/progress-tracker.md');

    // ── GitHub agent files (copied from workflows/agents/) ─────

    if (config.ai.tools.copilot) {
      const ghAgentsDir = path.join(root, '.github', 'agents');
      const workflowAgentsDir = path.join(getWorkflowsDir(), 'agents');
      if (await pathExists(workflowAgentsDir)) {
        await ensureDir(ghAgentsDir);
        const agentsCopied = await copyMarkdownDir(workflowAgentsDir, ghAgentsDir);
        filesCreated.push(...agentsCopied.map((f) => `.github/agents/${path.basename(f)}`));
      }

      // ── Prompt commands (copied from workflows/commands/) ─────

      const promptsDir = path.join(root, '.github', 'prompts');
      const workflowCmdsDir = path.join(getWorkflowsDir(), 'commands');
      if (await pathExists(workflowCmdsDir)) {
        await ensureDir(promptsDir);
        const promptsCopied = await copyMarkdownDir(workflowCmdsDir, promptsDir);
        filesCreated.push(...promptsCopied.map((f) => `.github/prompts/${path.basename(f)}`));
      }

      // ── Copilot instructions ────────────────────────────

      const copilotInstructions = path.join(root, '.github', 'copilot-instructions.md');
      await engine.render('github/copilot-instructions.md.hbs', ctx, copilotInstructions);
      filesCreated.push('.github/copilot-instructions.md');
    }

    // ── Kiro steering files ─────────────────────────────────────

    if (config.ai.tools.kiro) {
      const kiroFiles = await seedKiroSteering(config, engine, ctx);
      filesCreated.push(...kiroFiles.map((f) => path.relative(root, f)));
      const kiroPrompts = await seedKiroPrompts(config, engine, ctx);
      filesCreated.push(...kiroPrompts.map((f) => path.relative(root, f)));
    }
  } catch (err) {
    errors.push(`seedOpenSpec failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  return {
    success: errors.length === 0,
    filesCreated,
    filesModified: [],
    errors,
  };
}

// ── Helpers ────────────────────────────────────────────────────────

async function copyMarkdownDir(srcDir: string, destDir: string): Promise<string[]> {
  const copied: string[] = [];
  if (!(await pathExists(srcDir))) return copied;

  const entries = await fs.readdir(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.md')) {
      const src = path.join(srcDir, entry.name);
      const dest = path.join(destDir, entry.name);
      await fs.copyFile(src, dest);
      copied.push(dest);
    }
  }
  return copied;
}

// ---------------------------------------------------------------------------
// Kiro adapter — generates .kiro/steering/ files
// ---------------------------------------------------------------------------

const KIRO_STEERING_TEMPLATES: Array<{ template: string; filename: string }> = [
  { template: 'kiro/steering/00-project.md.hbs', filename: '00-project.md' },
  { template: 'kiro/steering/01-workflow.md.hbs', filename: '01-workflow.md' },
  { template: 'kiro/steering/02-architecture.md.hbs', filename: '02-architecture.md' },
  { template: 'kiro/steering/03-tooling.md.hbs', filename: '03-tooling.md' },
];

/**
 * Seed Kiro steering files into .kiro/steering/.
 * Idempotent: skips files that already exist so customizations are preserved.
 * Pass force=true to overwrite existing files.
 */
export async function seedKiroSteering(
  config: DarkhorseConfig,
  engine?: TemplateEngine,
  ctx?: TemplateContext,
  force = false,
): Promise<string[]> {
  const created: string[] = [];
  const steeringDir = path.join(config.paths.root, '.kiro', 'steering');
  await ensureDir(steeringDir);

  const resolvedEngine = engine ?? new TemplateEngine(getTemplatesDir());
  const resolvedCtx: TemplateContext = ctx ?? {
    project: config,
    timestamp: new Date().toISOString().split('T')[0],
    cliVersion: '0.1.0',
  };

  for (const { template, filename } of KIRO_STEERING_TEMPLATES) {
    const destPath = path.join(steeringDir, filename);
    const alreadyExists = await pathExists(destPath);
    if (alreadyExists && !force) {
      continue; // preserve customized files
    }
    await resolvedEngine.render(template, resolvedCtx, destPath);
    created.push(destPath);
  }

  return created;
}

// ── Kiro prompts — generates .kiro/prompts/ files ──────────────────

const KIRO_PROMPTS_TEMPLATES: Array<{ template: string; filename: string }> = [
  { template: 'kiro/prompts/discover-next.md.hbs', filename: 'discover-next.md' },
  { template: 'kiro/prompts/plan-next.md.hbs', filename: 'plan-next.md' },
  { template: 'kiro/prompts/implement-next.md.hbs', filename: 'implement-next.md' },
  { template: 'kiro/prompts/troubleshoot-next.md.hbs', filename: 'troubleshoot-next.md' },
];

/**
 * Seed Kiro prompt files into .kiro/prompts/.
 * Idempotent: skips files that already exist so customizations are preserved.
 * Pass force=true to overwrite existing files.
 */
export async function seedKiroPrompts(
  config: DarkhorseConfig,
  engine?: TemplateEngine,
  ctx?: TemplateContext,
  force = false,
): Promise<string[]> {
  const created: string[] = [];
  const promptsDir = path.join(config.paths.root, '.kiro', 'prompts');
  await ensureDir(promptsDir);

  const resolvedEngine = engine ?? new TemplateEngine(getTemplatesDir());
  const resolvedCtx: TemplateContext = ctx ?? {
    project: config,
    timestamp: new Date().toISOString().split('T')[0],
    cliVersion: '0.1.0',
  };

  for (const { template, filename } of KIRO_PROMPTS_TEMPLATES) {
    const destPath = path.join(promptsDir, filename);
    const alreadyExists = await pathExists(destPath);
    if (alreadyExists && !force) {
      continue; // preserve customized files
    }
    await resolvedEngine.render(template, resolvedCtx, destPath);
    created.push(destPath);
  }

  return created;
}
