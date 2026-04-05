import { logger } from '../core/logger.js';

// ---------------------------------------------------------------------------
// Nx Monorepo Skill — Types
// ---------------------------------------------------------------------------

export type NxMode = 'plan-ahead' | 'migration';
export type NxRecommendation = 'recommended' | 'optional' | 'not-recommended';
export type NxEcosystem = 'dotnet' | 'java' | 'desktop' | 'frontend' | 'mixed';

export interface NxAnalysisInput {
  mode: NxMode;
  productName: string;
  description: string;
  ecosystem: NxEcosystem;

  // Plan-ahead specifics
  intendedProjects?: NxProjectIntent[];
  scalePrediction?: NxScalePrediction;

  // Migration specifics
  currentStructure?: NxCurrentStructure;
  knownPainPoints?: string[];
}

export interface NxProjectIntent {
  name: string;
  type: 'app' | 'lib' | 'tool' | 'spec';
  technology: string;
  description: string;
}

export interface NxScalePrediction {
  expectedApps: number;
  expectedLibs: number;
  expectedTeamSize: number;
  multiLanguage: boolean;
  sharedCodeNeeded: boolean;
  ciComplexity: 'low' | 'medium' | 'high';
}

export interface NxCurrentStructure {
  rootPath: string;
  projects: NxExistingProject[];
  sharedAssets: string[];
  buildCommands: Record<string, string>;
}

export interface NxExistingProject {
  name: string;
  path: string;
  type: 'app' | 'lib' | 'tool' | 'unknown';
  technology: string;
  buildTool?: string;
}

// ---------------------------------------------------------------------------
// Nx Monorepo Skill — Output types
// ---------------------------------------------------------------------------

export interface NxAnalysisResult {
  success: boolean;
  mode: NxMode;
  recommendation: NxRecommendation;
  fitScore: number;
  summary: string;
  rationale: string;
  targetDesign: NxTargetDesign | null;
  projectMapping: NxProjectMapping[];
  sharedLibraryOpportunities: NxLibraryOpportunity[];
  generatorOpportunities: string[];
  taskOrchestration: NxTaskPlan[];
  setupOrMigrationSteps: NxStep[];
  risks: NxRisk[];
  tradeoffs: NxTradeoff[];
  ciConsiderations: string[];
  nextAction: string;
  errors: string[];
}

export interface NxTargetDesign {
  workspaceName: string;
  structure: NxDirectoryEntry[];
  nxPlugins: string[];
  nxPreset: string;
}

export interface NxDirectoryEntry {
  path: string;
  kind: 'app' | 'lib' | 'tool' | 'spec' | 'config';
  technology: string;
  description: string;
}

export interface NxProjectMapping {
  source: string;
  target: string;
  action: 'move' | 'restructure' | 'create' | 'keep';
  notes: string;
}

export interface NxLibraryOpportunity {
  name: string;
  proposedPath: string;
  sharedBy: string[];
  description: string;
}

export interface NxTaskPlan {
  taskName: string;
  nxTarget: string;
  nativeCommand: string;
  cacheable: boolean;
  affectable: boolean;
}

export interface NxStep {
  order: number;
  title: string;
  description: string;
  risk: 'low' | 'medium' | 'high';
  reversible: boolean;
}

export interface NxRisk {
  area: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  mitigation: string;
}

export interface NxTradeoff {
  dimension: string;
  benefit: string;
  cost: string;
  verdict: string;
}

// ---------------------------------------------------------------------------
// Nx Monorepo Skill — Core analysis
// ---------------------------------------------------------------------------

/**
 * Analyze an Nx monorepo strategy for the given product context.
 * This is the full reasoning skill — it evaluates fit, designs workspace
 * structure, maps projects, and produces migration or setup plans.
 */
export async function analyzeNxMonorepo(input: NxAnalysisInput): Promise<NxAnalysisResult> {
  logger.step(`Analyzing Nx monorepo strategy (${input.mode} mode)...`);

  const errors: string[] = [];

  if (input.mode === 'migration' && !input.currentStructure) {
    errors.push('Migration mode requires currentStructure to be provided.');
    return emptyResult(input.mode, errors);
  }

  if (input.mode === 'plan-ahead' && !input.intendedProjects?.length && !input.scalePrediction) {
    errors.push('Plan-ahead mode requires either intendedProjects or scalePrediction.');
    return emptyResult(input.mode, errors);
  }

  // Step 1: Assess fit
  const fitScore = assessFit(input);
  const recommendation = scoreToRecommendation(fitScore);

  // Step 2: Build rationale
  const rationale = buildRationale(input, fitScore, recommendation);

  // Step 3: Design target workspace
  const targetDesign = recommendation !== 'not-recommended'
    ? designTargetWorkspace(input)
    : null;

  // Step 4: Map projects
  const projectMapping = input.mode === 'migration' && input.currentStructure
    ? mapExistingProjects(input.currentStructure, targetDesign)
    : mapIntendedProjects(input.intendedProjects ?? [], targetDesign);

  // Step 5: Identify shared library opportunities
  const sharedLibraryOpportunities = identifyLibraryOpportunities(input, projectMapping);

  // Step 6: Identify generator opportunities
  const generatorOpportunities = identifyGeneratorOpportunities(input);

  // Step 7: Plan task orchestration
  const taskOrchestration = planTaskOrchestration(input);

  // Step 8: Generate setup or migration steps
  const setupOrMigrationSteps = input.mode === 'migration'
    ? generateMigrationSteps(input, targetDesign)
    : generateSetupSteps(input, targetDesign);

  // Step 9: Identify risks
  const risks = identifyRisks(input);

  // Step 10: Identify tradeoffs
  const tradeoffs = identifyTradeoffs(input, recommendation);

  // Step 11: CI/CD considerations
  const ciConsiderations = assessCiImplications(input, targetDesign);

  // Step 12: Determine next action
  const nextAction = determineNextAction(input, recommendation, fitScore);

  const summary = buildSummary(input, fitScore, recommendation);

  return {
    success: errors.length === 0,
    mode: input.mode,
    recommendation,
    fitScore,
    summary,
    rationale,
    targetDesign,
    projectMapping,
    sharedLibraryOpportunities,
    generatorOpportunities,
    taskOrchestration,
    setupOrMigrationSteps,
    risks,
    tradeoffs,
    ciConsiderations,
    nextAction,
    errors,
  };
}

// ---------------------------------------------------------------------------
// Internal — Fit assessment
// ---------------------------------------------------------------------------

interface FitFactors {
  projectCount: number;
  multiLanguage: boolean;
  sharedCodeNeeded: boolean;
  ciComplexity: 'low' | 'medium' | 'high';
  teamSize: number;
  existingPainPoints: number;
}

function extractFitFactors(input: NxAnalysisInput): FitFactors {
  if (input.mode === 'plan-ahead') {
    const scale = input.scalePrediction;
    const projects = input.intendedProjects ?? [];
    return {
      projectCount: scale ? scale.expectedApps + scale.expectedLibs : projects.length,
      multiLanguage: scale?.multiLanguage ?? hasMultipleLanguages(projects),
      sharedCodeNeeded: scale?.sharedCodeNeeded ?? projects.some((p) => p.type === 'lib'),
      ciComplexity: scale?.ciComplexity ?? 'medium',
      teamSize: scale?.expectedTeamSize ?? 3,
      existingPainPoints: 0,
    };
  }

  const structure = input.currentStructure!;
  const technologies = new Set(structure.projects.map((p) => p.technology));
  return {
    projectCount: structure.projects.length,
    multiLanguage: technologies.size > 1,
    sharedCodeNeeded: structure.sharedAssets.length > 0,
    ciComplexity: structure.projects.length > 5 ? 'high' : structure.projects.length > 2 ? 'medium' : 'low',
    teamSize: 3,
    existingPainPoints: input.knownPainPoints?.length ?? 0,
  };
}

function hasMultipleLanguages(projects: NxProjectIntent[]): boolean {
  const techs = new Set(projects.map((p) => p.technology));
  return techs.size > 1;
}

function assessFit(input: NxAnalysisInput): number {
  const factors = extractFitFactors(input);
  let score = 0;

  // Project count: more projects = higher value from Nx
  if (factors.projectCount >= 5) score += 30;
  else if (factors.projectCount >= 3) score += 20;
  else if (factors.projectCount >= 2) score += 10;
  else score += 0;

  // Multi-language: Nx excels at cross-language orchestration
  if (factors.multiLanguage) score += 15;

  // Shared code: Nx dependency graph shines here
  if (factors.sharedCodeNeeded) score += 20;

  // CI complexity: affected commands and caching reduce CI time
  if (factors.ciComplexity === 'high') score += 20;
  else if (factors.ciComplexity === 'medium') score += 10;

  // Team size: larger teams benefit from boundary enforcement
  if (factors.teamSize >= 5) score += 10;
  else if (factors.teamSize >= 3) score += 5;

  // Existing pain points increase migration motivation
  if (factors.existingPainPoints >= 3) score += 10;
  else if (factors.existingPainPoints >= 1) score += 5;

  return Math.min(score, 100);
}

function scoreToRecommendation(score: number): NxRecommendation {
  if (score >= 55) return 'recommended';
  if (score >= 30) return 'optional';
  return 'not-recommended';
}

// ---------------------------------------------------------------------------
// Internal — Rationale
// ---------------------------------------------------------------------------

function buildRationale(input: NxAnalysisInput, score: number, recommendation: NxRecommendation): string {
  const factors = extractFitFactors(input);
  const lines: string[] = [];

  // Score headline
  lines.push(`Fit score: ${score}/100 → ${recommendation}.`);
  lines.push('');

  // Key benefits (context-specific)
  const benefits: string[] = [];
  if (factors.projectCount >= 3) {
    benefits.push(`Unified task orchestration across ${factors.projectCount} projects — consistent build, test, and lint execution.`);
  }
  if (factors.multiLanguage) {
    benefits.push('Cross-language workspace coordination — Nx orchestrates above native toolchains without replacing them.');
  }
  if (factors.sharedCodeNeeded) {
    benefits.push('Dependency graph awareness for shared code — Nx tracks which projects depend on shared libraries and rebuilds only what is affected.');
  }
  if (factors.ciComplexity === 'high' || factors.ciComplexity === 'medium') {
    benefits.push(`Affected-project execution and build caching — reduces CI time by skipping unchanged projects (CI complexity: ${factors.ciComplexity}).`);
  }
  if (factors.teamSize >= 5) {
    benefits.push('Architecture boundary enforcement — Nx module boundaries help larger teams maintain structural discipline.');
  }

  if (benefits.length > 0) {
    lines.push('Key benefits for this product:');
    for (const b of benefits) lines.push(`  • ${b}`);
    lines.push('');
  }

  // Key concerns (context-specific)
  const concerns: string[] = [];
  if (factors.projectCount < 3) {
    concerns.push(`Low project count (${factors.projectCount}). Nx adds configuration and conceptual overhead without clear multi-project value.`);
  }
  if (!factors.multiLanguage && !factors.sharedCodeNeeded) {
    concerns.push('Single-language workspace without shared code — most Nx benefits are limited to caching and task orchestration.');
  }
  if (input.mode === 'migration') {
    concerns.push('Migration carries restructuring risk. Imports, CI pipelines, and developer workflows will need adjustment.');
  }

  if (concerns.length > 0) {
    lines.push('Key concerns:');
    for (const c of concerns) lines.push(`  • ${c}`);
    lines.push('');
  }

  // Complexity assessment
  if (recommendation === 'recommended') {
    lines.push('Complexity tradeoff: The workspace complexity is justified by the coordination value Nx provides at this scale.');
  } else if (recommendation === 'optional') {
    lines.push('Complexity tradeoff: Nx would add value but the product could succeed without it. Consider adopting if pain points grow or team scales.');
  } else {
    lines.push('Complexity tradeoff: Nx would add more overhead than value. The product shape does not yet warrant monorepo orchestration.');
  }

  // Pain points (migration only)
  if (input.mode === 'migration' && input.knownPainPoints?.length) {
    lines.push('');
    lines.push(`Known pain points (${input.knownPainPoints.length}) suggest structural improvements would help: ${input.knownPainPoints.join(', ')}.`);
  }

  // Ecosystem-specific note
  const ecosystemNote = getEcosystemRationale(input.ecosystem);
  if (ecosystemNote) {
    lines.push('');
    lines.push(ecosystemNote);
  }

  return lines.join('\n');
}

function getEcosystemRationale(ecosystem: NxEcosystem): string | null {
  switch (ecosystem) {
    case 'dotnet':
      return 'In a .NET ecosystem, Nx orchestrates above dotnet CLI. Solutions and projects remain native. Nx adds workspace-level task coordination, caching, and affected builds without replacing the dotnet toolchain.';
    case 'java':
      return 'In a Java ecosystem, Nx orchestrates above Maven/Gradle. Module structure remains native. Nx adds workspace-level task coordination, caching, and affected builds without replacing the Java build toolchain.';
    case 'desktop':
      return 'In a desktop/cross-platform ecosystem, Nx can orchestrate Cargo (Rust), npm (frontend), and platform-specific build steps under a unified task runner.';
    case 'frontend':
      return 'Frontend-only workspaces are Nx\'s strongest native fit. First-class support for React, Vite, and component library boundaries.';
    case 'mixed':
      return 'Mixed-ecosystem workspaces are where Nx provides the most value — unifying task execution across languages while preserving native toolchains for each.';
  }
}

// ---------------------------------------------------------------------------
// Internal — Target workspace design
// ---------------------------------------------------------------------------

function designTargetWorkspace(input: NxAnalysisInput): NxTargetDesign {
  const workspaceName = input.productName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const structure: NxDirectoryEntry[] = [];
  const nxPlugins: string[] = ['@nx/workspace'];

  // Always include root config entries
  structure.push(
    { path: 'nx.json', kind: 'config', technology: 'nx', description: 'Nx workspace configuration' },
    { path: 'package.json', kind: 'config', technology: 'node', description: 'Root package.json for Nx and workspace dependencies' },
  );

  // Ecosystem-specific plugins
  const plugins = getEcosystemPlugins(input.ecosystem);
  nxPlugins.push(...plugins);

  if (input.mode === 'plan-ahead' && input.intendedProjects) {
    for (const project of input.intendedProjects) {
      const dir = projectTypeToDir(project.type);
      structure.push({
        path: `${dir}/${project.name}`,
        kind: project.type,
        technology: project.technology,
        description: project.description,
      });
    }
  } else if (input.mode === 'migration' && input.currentStructure) {
    for (const project of input.currentStructure.projects) {
      const targetType = project.type === 'unknown' ? 'app' : project.type;
      const dir = projectTypeToDir(targetType);
      structure.push({
        path: `${dir}/${project.name}`,
        kind: targetType,
        technology: project.technology,
        description: `Migrated from ${project.path}`,
      });
    }
  }

  // Add standard workspace directories
  structure.push(
    { path: 'tools/', kind: 'tool', technology: 'scripts', description: 'Workspace scripts, generators, and automation' },
    { path: 'specs/', kind: 'spec', technology: 'docs', description: 'OpenSpec planning assets and architecture docs' },
  );

  return {
    workspaceName,
    structure,
    nxPlugins,
    nxPreset: determinePreset(input.ecosystem),
  };
}

function getEcosystemPlugins(ecosystem: NxEcosystem): string[] {
  switch (ecosystem) {
    case 'dotnet':
      return ['@nx-dotnet/core'];
    case 'java':
      return ['@jnxplus/nx-maven'];
    case 'desktop':
      return ['@nx/vite', '@nx/js'];
    case 'frontend':
      return ['@nx/react', '@nx/vite', '@nx/js'];
    case 'mixed':
      return ['@nx/js', '@nx/vite'];
  }
}

function determinePreset(ecosystem: NxEcosystem): string {
  switch (ecosystem) {
    case 'frontend':
      return 'react-monorepo';
    default:
      return 'npm';
  }
}

function projectTypeToDir(type: 'app' | 'lib' | 'tool' | 'spec'): string {
  switch (type) {
    case 'app': return 'apps';
    case 'lib': return 'libs';
    case 'tool': return 'tools';
    case 'spec': return 'specs';
  }
}

// ---------------------------------------------------------------------------
// Internal — Project mapping
// ---------------------------------------------------------------------------

function mapExistingProjects(
  current: NxCurrentStructure,
  target: NxTargetDesign | null,
): NxProjectMapping[] {
  if (!target) return [];

  return current.projects.map((project) => {
    const targetType = project.type === 'unknown' ? 'app' : project.type;
    const dir = projectTypeToDir(targetType);
    return {
      source: project.path,
      target: `${dir}/${project.name}`,
      action: 'move' as const,
      notes: project.buildTool
        ? `Preserves ${project.buildTool} as native build tool. Nx wraps with targets.`
        : `Move to ${dir}/ and register as Nx project.`,
    };
  });
}

function mapIntendedProjects(
  intended: NxProjectIntent[],
  target: NxTargetDesign | null,
): NxProjectMapping[] {
  if (!target) return [];

  return intended.map((project) => {
    const dir = projectTypeToDir(project.type);
    return {
      source: '(new)',
      target: `${dir}/${project.name}`,
      action: 'create' as const,
      notes: `Create as ${project.type} using ${project.technology}.`,
    };
  });
}

// ---------------------------------------------------------------------------
// Internal — Shared library opportunities
// ---------------------------------------------------------------------------

function identifyLibraryOpportunities(
  input: NxAnalysisInput,
  _projectMapping: NxProjectMapping[],
): NxLibraryOpportunity[] {
  const opportunities: NxLibraryOpportunity[] = [];

  // Standard shared library patterns based on ecosystem
  const apps = input.mode === 'plan-ahead'
    ? (input.intendedProjects ?? []).filter((p) => p.type === 'app').map((p) => p.name)
    : (input.currentStructure?.projects ?? []).filter((p) => p.type === 'app').map((p) => p.name);

  if (apps.length >= 2) {
    opportunities.push({
      name: 'shared-models',
      proposedPath: 'libs/shared/models',
      sharedBy: apps,
      description: 'Common data models, DTOs, and contracts shared across applications.',
    });

    opportunities.push({
      name: 'shared-utils',
      proposedPath: 'libs/shared/utils',
      sharedBy: apps,
      description: 'Cross-cutting utilities: validation, formatting, error handling.',
    });
  }

  if (input.ecosystem === 'dotnet' || input.ecosystem === 'mixed') {
    if (apps.length >= 2) {
      opportunities.push({
        name: 'contracts',
        proposedPath: 'libs/shared/contracts',
        sharedBy: apps,
        description: 'Shared .NET contracts: events, abstractions, and primitives for cross-service communication.',
      });
    }
  }

  if (input.ecosystem === 'java' || input.ecosystem === 'mixed') {
    if (apps.length >= 2) {
      opportunities.push({
        name: 'common',
        proposedPath: 'libs/shared/common',
        sharedBy: apps,
        description: 'Shared Java modules: domain primitives, event contracts, and cross-service abstractions.',
      });
    }
  }

  const hasFrontend = input.ecosystem === 'frontend' || input.ecosystem === 'mixed' || input.ecosystem === 'desktop'
    || (input.intendedProjects ?? []).some((p) => p.technology.includes('react') || p.technology.includes('typescript'));

  if (hasFrontend && apps.length >= 2) {
    opportunities.push({
      name: 'ui-components',
      proposedPath: 'libs/shared/ui',
      sharedBy: apps.filter((_a, i) => i < 3),
      description: 'Shared UI component library for consistent design across frontend applications.',
    });
  }

  return opportunities;
}

// ---------------------------------------------------------------------------
// Internal — Generator opportunities
// ---------------------------------------------------------------------------

function identifyGeneratorOpportunities(input: NxAnalysisInput): string[] {
  const opportunities: string[] = [];

  opportunities.push('Project scaffolding generator — create new apps/libs with standard structure and config.');

  if (input.ecosystem === 'dotnet') {
    opportunities.push('Bounded context generator — scaffold Domain/Application/Infrastructure/Presentation layers for a new context.');
    opportunities.push('CQRS handler generator — create Command/Query with handler, validator, and test stubs.');
  }

  if (input.ecosystem === 'java') {
    opportunities.push('Bounded context generator — scaffold domain/application/infrastructure layers for a new context.');
    opportunities.push('CQRS handler generator — create command/query handler with validation and test stubs.');
  }

  if (input.ecosystem === 'frontend' || input.ecosystem === 'mixed' || input.ecosystem === 'desktop') {
    opportunities.push('Feature module generator — scaffold a new feature with page, state, and API integration.');
    opportunities.push('Component generator — create a shared UI component with tests and Storybook story.');
  }

  opportunities.push('OpenSpec document generator — create discovery, planning, or requirements documents from templates.');

  return opportunities;
}

// ---------------------------------------------------------------------------
// Internal — Task orchestration
// ---------------------------------------------------------------------------

function planTaskOrchestration(input: NxAnalysisInput): NxTaskPlan[] {
  const tasks: NxTaskPlan[] = [];

  // Build tasks
  if (input.ecosystem === 'dotnet') {
    tasks.push(
      { taskName: 'build', nxTarget: 'build', nativeCommand: 'dotnet build', cacheable: true, affectable: true },
      { taskName: 'test', nxTarget: 'test', nativeCommand: 'dotnet test', cacheable: true, affectable: true },
      { taskName: 'lint', nxTarget: 'lint', nativeCommand: 'dotnet format --verify-no-changes', cacheable: true, affectable: true },
      { taskName: 'publish', nxTarget: 'publish', nativeCommand: 'dotnet publish', cacheable: false, affectable: true },
    );
  } else if (input.ecosystem === 'java') {
    tasks.push(
      { taskName: 'build', nxTarget: 'build', nativeCommand: 'mvn compile', cacheable: true, affectable: true },
      { taskName: 'test', nxTarget: 'test', nativeCommand: 'mvn test', cacheable: true, affectable: true },
      { taskName: 'lint', nxTarget: 'lint', nativeCommand: 'mvn checkstyle:check', cacheable: true, affectable: true },
      { taskName: 'package', nxTarget: 'package', nativeCommand: 'mvn package', cacheable: true, affectable: true },
    );
  } else if (input.ecosystem === 'desktop') {
    tasks.push(
      { taskName: 'build-rust', nxTarget: 'build', nativeCommand: 'cargo build', cacheable: true, affectable: true },
      { taskName: 'test-rust', nxTarget: 'test', nativeCommand: 'cargo test', cacheable: true, affectable: true },
      { taskName: 'build-frontend', nxTarget: 'build', nativeCommand: 'npm run build', cacheable: true, affectable: true },
      { taskName: 'tauri-dev', nxTarget: 'serve', nativeCommand: 'cargo tauri dev', cacheable: false, affectable: false },
    );
  } else if (input.ecosystem === 'frontend') {
    tasks.push(
      { taskName: 'build', nxTarget: 'build', nativeCommand: 'vite build', cacheable: true, affectable: true },
      { taskName: 'test', nxTarget: 'test', nativeCommand: 'vitest run', cacheable: true, affectable: true },
      { taskName: 'lint', nxTarget: 'lint', nativeCommand: 'eslint .', cacheable: true, affectable: true },
      { taskName: 'serve', nxTarget: 'serve', nativeCommand: 'vite', cacheable: false, affectable: false },
    );
  } else {
    // mixed — include cross-ecosystem standard targets
    tasks.push(
      { taskName: 'build', nxTarget: 'build', nativeCommand: '(varies per project)', cacheable: true, affectable: true },
      { taskName: 'test', nxTarget: 'test', nativeCommand: '(varies per project)', cacheable: true, affectable: true },
      { taskName: 'lint', nxTarget: 'lint', nativeCommand: '(varies per project)', cacheable: true, affectable: true },
    );
  }

  return tasks;
}

// ---------------------------------------------------------------------------
// Internal — Setup and migration steps
// ---------------------------------------------------------------------------

function generateSetupSteps(input: NxAnalysisInput, target: NxTargetDesign | null): NxStep[] {
  const steps: NxStep[] = [];
  let order = 1;

  steps.push({
    order: order++,
    title: 'Initialize Nx workspace',
    description: `Run: npx create-nx-workspace@latest ${target?.workspaceName ?? input.productName} --preset=${target?.nxPreset ?? 'npm'} --nxCloud=skip`,
    risk: 'low',
    reversible: true,
  });

  if (target?.nxPlugins.length) {
    const pluginList = target.nxPlugins.filter((p) => p !== '@nx/workspace').join(' ');
    if (pluginList) {
      steps.push({
        order: order++,
        title: 'Install Nx plugins',
        description: `Run: npm install --save-dev ${pluginList}`,
        risk: 'low',
        reversible: true,
      });
    }
  }

  steps.push({
    order: order++,
    title: 'Create directory structure',
    description: 'Create apps/, libs/, tools/, and specs/ directories as defined in the target design.',
    risk: 'low',
    reversible: true,
  });

  steps.push({
    order: order++,
    title: 'Configure project boundaries',
    description: 'Define tags and enforce-module-boundaries rule in nx.json to prevent unauthorized cross-project imports.',
    risk: 'low',
    reversible: true,
  });

  if (input.ecosystem === 'dotnet') {
    steps.push({
      order: order++,
      title: 'Configure .NET project targets',
      description: 'Register dotnet build/test/publish as Nx targets in each project.json, wrapping the native dotnet CLI.',
      risk: 'low',
      reversible: true,
    });
  }

  if (input.ecosystem === 'java') {
    steps.push({
      order: order++,
      title: 'Configure Maven/Gradle project targets',
      description: 'Register Maven compile/test/package as Nx targets in each project.json, wrapping the native build tool.',
      risk: 'low',
      reversible: true,
    });
  }

  steps.push({
    order: order++,
    title: 'Configure caching',
    description: 'Define cacheable targets in nx.json for build, test, and lint. Configure input/output hashing rules.',
    risk: 'low',
    reversible: true,
  });

  steps.push({
    order: order++,
    title: 'Create initial projects',
    description: 'Scaffold each planned application and library with project.json and base configuration.',
    risk: 'low',
    reversible: true,
  });

  steps.push({
    order: order++,
    title: 'Verify workspace',
    description: 'Run: npx nx graph to verify the dependency graph. Run: npx nx run-many --target=build to validate all targets.',
    risk: 'low',
    reversible: true,
  });

  return steps;
}

function generateMigrationSteps(input: NxAnalysisInput, target: NxTargetDesign | null): NxStep[] {
  const steps: NxStep[] = [];
  let order = 1;

  steps.push({
    order: order++,
    title: 'Audit current repository',
    description: 'Document all projects, build scripts, CI configuration, and shared dependencies. Verify the project inventory matches expectations.',
    risk: 'low',
    reversible: true,
  });

  steps.push({
    order: order++,
    title: 'Initialize Nx in the existing repository',
    description: `Run: npx nx@latest init. This adds nx.json and configures basic workspace settings without changing existing structure.`,
    risk: 'low',
    reversible: true,
  });

  if (target?.nxPlugins.length) {
    const pluginList = target.nxPlugins.filter((p) => p !== '@nx/workspace').join(' ');
    if (pluginList) {
      steps.push({
        order: order++,
        title: 'Install ecosystem plugins',
        description: `Run: npm install --save-dev ${pluginList}`,
        risk: 'low',
        reversible: true,
      });
    }
  }

  steps.push({
    order: order++,
    title: 'Register existing projects',
    description: 'Create project.json for each existing project. Map current build/test commands as Nx targets. Preserve all native toolchain configurations.',
    risk: 'medium',
    reversible: true,
  });

  if (input.currentStructure && input.currentStructure.projects.length > 3) {
    steps.push({
      order: order++,
      title: 'Reorganize directory structure',
      description: 'Move projects into apps/, libs/, and tools/ as defined in the target design. Update import paths and references.',
      risk: 'high',
      reversible: false,
    });
  }

  steps.push({
    order: order++,
    title: 'Extract shared libraries',
    description: 'Identify common code across projects and extract into libs/shared/. Update imports in consuming projects.',
    risk: 'medium',
    reversible: true,
  });

  steps.push({
    order: order++,
    title: 'Configure project boundaries',
    description: 'Add tags to each project and configure enforce-module-boundaries in nx.json or eslint rules.',
    risk: 'low',
    reversible: true,
  });

  steps.push({
    order: order++,
    title: 'Configure caching and affected execution',
    description: 'Define cacheable operations and input/output hashing rules. Verify affected commands work correctly.',
    risk: 'low',
    reversible: true,
  });

  steps.push({
    order: order++,
    title: 'Update CI pipeline',
    description: 'Replace existing build-all steps with nx affected --target=build and nx affected --target=test. Configure Nx caching in CI.',
    risk: 'medium',
    reversible: true,
  });

  steps.push({
    order: order++,
    title: 'Validate and smoke-test',
    description: 'Run: npx nx graph to verify dependency graph. Run: npx nx run-many --target=build --all to validate. Run: npx nx run-many --target=test --all to confirm.',
    risk: 'low',
    reversible: true,
  });

  return steps;
}

// ---------------------------------------------------------------------------
// Internal — Risk identification
// ---------------------------------------------------------------------------

function identifyRisks(input: NxAnalysisInput): NxRisk[] {
  const risks: NxRisk[] = [];

  // Universal risks
  risks.push({
    area: 'Learning curve',
    severity: 'medium',
    description: 'Teams unfamiliar with Nx will need time to understand workspace concepts, project graph, and configuration.',
    mitigation: 'Start with minimal Nx config. Add features incrementally. Document workspace conventions early.',
  });

  if (input.mode === 'migration') {
    risks.push({
      area: 'Migration disruption',
      severity: 'high',
      description: 'Restructuring an active codebase risks broken imports, CI failures, and blocked feature work.',
      mitigation: 'Migrate incrementally. Start with Nx init (no structure changes), then register projects, then restructure one at a time.',
    });

    if (input.currentStructure && input.currentStructure.projects.length > 5) {
      risks.push({
        area: 'Scale complexity',
        severity: 'medium',
        description: `${input.currentStructure.projects.length} projects means migration touches many areas. Higher chance of overlooked dependencies.`,
        mitigation: 'Map all cross-project dependencies before restructuring. Migrate leaf projects first, working inward.',
      });
    }
  }

  if (input.ecosystem === 'dotnet') {
    risks.push({
      area: '.NET toolchain integration',
      severity: 'medium',
      description: 'Nx-dotnet plugins are community-maintained, not official. Plugin updates may lag behind .NET releases.',
      mitigation: 'Use thin Nx wrappers around dotnet CLI rather than deep plugin integration. Keep native dotnet as the source of truth.',
    });
  }

  if (input.ecosystem === 'java') {
    risks.push({
      area: 'Java toolchain integration',
      severity: 'medium',
      description: 'Nx-Java plugins are community-maintained. Maven/Gradle integration may have edge cases.',
      mitigation: 'Use thin Nx wrappers around Maven/Gradle CLI. Keep native build tool as the source of truth.',
    });
  }

  if (input.ecosystem === 'desktop') {
    risks.push({
      area: 'Rust/Cargo integration',
      severity: 'medium',
      description: 'No official Nx plugin for Rust/Cargo. Custom targets needed for Tauri and Cargo workflows.',
      mitigation: 'Define custom Nx targets that shell out to cargo commands. Do not try to replace Cargo workspace features.',
    });
  }

  if (input.ecosystem === 'mixed') {
    risks.push({
      area: 'Cross-ecosystem complexity',
      severity: 'medium',
      description: 'Multiple language ecosystems mean more plugins, more target configurations, and more potential for config conflicts.',
      mitigation: 'Keep per-project config minimal. Use Nx primarily for orchestration and caching, not deep toolchain integration.',
    });
  }

  return risks;
}

// ---------------------------------------------------------------------------
// Internal — Tradeoff identification
// ---------------------------------------------------------------------------

function identifyTradeoffs(input: NxAnalysisInput, recommendation: NxRecommendation): NxTradeoff[] {
  const tradeoffs: NxTradeoff[] = [];
  const factors = extractFitFactors(input);

  // Orchestration vs. complexity
  tradeoffs.push({
    dimension: 'Orchestration overhead',
    benefit: 'Unified task execution, dependency graph, affected builds, and consistent developer experience across all projects.',
    cost: 'Additional configuration (nx.json, project.json per project), learning curve for Nx concepts, and dependency on the Nx toolchain.',
    verdict: factors.projectCount >= 3
      ? 'Justified — orchestration value exceeds configuration cost at this project count.'
      : 'Marginal — configuration cost is similar to the orchestration benefit with few projects.',
  });

  // Caching vs. setup
  tradeoffs.push({
    dimension: 'Build caching',
    benefit: 'Local and remote caching reduces redundant builds. CI pipelines skip unchanged projects via `nx affected`.',
    cost: 'Requires correct input/output hashing configuration. Misconfigured caching can produce stale builds.',
    verdict: factors.ciComplexity === 'high'
      ? 'High value — caching will significantly reduce CI time.'
      : factors.ciComplexity === 'medium'
        ? 'Moderate value — caching helps but the CI is not yet a bottleneck.'
        : 'Low value — simple CI does not benefit much from caching.',
  });

  // Shared code vs. coupling
  if (factors.sharedCodeNeeded) {
    tradeoffs.push({
      dimension: 'Shared libraries',
      benefit: 'Explicit shared libraries with Nx boundary enforcement prevent accidental coupling and enable clean API surfaces.',
      cost: 'Extracting shared code requires upfront design. Over-sharing creates tight coupling disguised as reuse.',
      verdict: recommendation === 'recommended'
        ? 'Recommended — shared libraries are a natural fit for this workspace.'
        : 'Optional — shared code exists but could be managed without Nx boundaries.',
    });
  }

  // Migration-specific tradeoff
  if (input.mode === 'migration') {
    tradeoffs.push({
      dimension: 'Migration disruption',
      benefit: 'Restructured codebase with clear boundaries, consistent conventions, and long-term maintainability.',
      cost: 'Active development may be disrupted during migration. Import paths, CI pipelines, and developer workflows change.',
      verdict: factors.existingPainPoints >= 2
        ? 'Justified — existing pain points indicate structural improvements are needed regardless.'
        : 'Proceed with caution — minimal pain points mean the migration is an investment in future scale, not an immediate fix.',
    });
  }

  // Ecosystem-specific tradeoff
  if (input.ecosystem === 'dotnet' || input.ecosystem === 'java') {
    const toolchain = input.ecosystem === 'dotnet' ? 'dotnet CLI' : 'Maven/Gradle';
    tradeoffs.push({
      dimension: 'Native toolchain integration',
      benefit: `Nx wraps ${toolchain} as thin targets — native tooling remains the source of truth for builds and tests.`,
      cost: `Community-maintained Nx plugins for ${input.ecosystem}. Plugin updates may lag behind ${toolchain} releases.`,
      verdict: 'Acceptable — use thin Nx wrappers rather than deep plugin integration to minimize coupling.',
    });
  }

  return tradeoffs;
}

// ---------------------------------------------------------------------------
// Internal — CI considerations
// ---------------------------------------------------------------------------

function assessCiImplications(input: NxAnalysisInput, _target: NxTargetDesign | null): string[] {
  const considerations: string[] = [];

  considerations.push('Use `nx affected --target=build` and `nx affected --target=test` in CI pipelines to only build/test changed projects and their dependents.');
  considerations.push('Configure Nx remote caching (Nx Cloud or custom) to share build caches across CI agents and developer machines.');
  considerations.push('Define pipeline steps per target (build, test, lint) rather than per project to maximize parallelization.');

  if (input.ecosystem === 'dotnet') {
    considerations.push('Ensure the CI agent has the .NET SDK installed. Nx does not bundle runtime dependencies.');
    considerations.push('Consider using dotnet restore as a separate cacheable Nx target to isolate NuGet restoration.');
  }

  if (input.ecosystem === 'java') {
    considerations.push('Ensure the CI agent has the JDK and Maven/Gradle installed. Nx does not bundle runtime dependencies.');
    considerations.push('Consider caching the Maven local repository (.m2) alongside Nx caching for faster dependency resolution.');
  }

  if (input.ecosystem === 'mixed') {
    considerations.push('Multi-language CI agents need all required SDKs. Consider Docker-based CI with a custom image containing all toolchains.');
  }

  considerations.push('Add `nx workspace-lint` to CI to enforce project boundary rules.');

  return considerations;
}

// ---------------------------------------------------------------------------
// Internal — Helpers
// ---------------------------------------------------------------------------

function buildSummary(input: NxAnalysisInput, fitScore: number, recommendation: NxRecommendation): string {
  const mode = input.mode === 'plan-ahead' ? 'Plan-ahead' : 'Migration';
  const projectCount = input.mode === 'plan-ahead'
    ? (input.intendedProjects?.length ?? input.scalePrediction?.expectedApps ?? 0)
    : (input.currentStructure?.projects.length ?? 0);

  if (recommendation === 'recommended') {
    return `${mode} analysis for "${input.productName}" (${input.ecosystem}, ${projectCount} projects, score ${fitScore}/100): Nx is recommended — the product shape justifies monorepo orchestration.`;
  }
  if (recommendation === 'optional') {
    return `${mode} analysis for "${input.productName}" (${input.ecosystem}, ${projectCount} projects, score ${fitScore}/100): Nx is optional — it could help but is not essential at this scale.`;
  }
  return `${mode} analysis for "${input.productName}" (${input.ecosystem}, ${projectCount} projects, score ${fitScore}/100): Nx is not recommended — the product does not yet justify monorepo complexity.`;
}

function determineNextAction(input: NxAnalysisInput, recommendation: NxRecommendation, fitScore: number): string {
  if (recommendation === 'not-recommended') {
    return `Continue with a standard ${input.ecosystem} project structure. Revisit Nx when the product grows to 3+ projects, needs shared libraries, or encounters CI/CD pain at scale (current score: ${fitScore}/100).`;
  }

  if (input.mode === 'plan-ahead') {
    if (recommendation === 'recommended') {
      return 'Initialize the Nx workspace using the setup steps above. Scaffold initial projects, configure build targets, and verify the dependency graph before writing application code.';
    }
    return 'Consider initializing Nx if shared code or multi-project coordination becomes a priority. The setup steps above can be followed when ready.';
  }

  // migration
  if (recommendation === 'recommended') {
    return 'Begin incremental migration: run `npx nx@latest init` in the existing repository to add Nx without restructuring. Then register existing projects as Nx projects and follow the phased migration steps above.';
  }
  return 'Consider starting with `npx nx@latest init` to get caching and task orchestration without full restructuring. Migrate deeper only if the initial benefits justify continued effort.';
}

function emptyResult(mode: NxMode, errors: string[]): NxAnalysisResult {
  return {
    success: false,
    mode,
    recommendation: 'not-recommended',
    fitScore: 0,
    summary: 'Analysis could not be completed.',
    rationale: errors.join(' '),
    targetDesign: null,
    projectMapping: [],
    sharedLibraryOpportunities: [],
    generatorOpportunities: [],
    taskOrchestration: [],
    setupOrMigrationSteps: [],
    risks: [],
    tradeoffs: [],
    ciConsiderations: [],
    nextAction: 'Provide the required input and try again.',
    errors,
  };
}
