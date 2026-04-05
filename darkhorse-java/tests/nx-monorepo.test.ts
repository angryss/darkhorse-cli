import { describe, it, expect } from 'vitest';
import {
  analyzeNxMonorepo,
  type NxAnalysisInput,
  type NxAnalysisResult,
} from '../src/skills/nx-monorepo.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function planAheadInput(overrides: Partial<NxAnalysisInput> = {}): NxAnalysisInput {
  return {
    mode: 'plan-ahead',
    productName: 'test-product',
    description: 'A test product for validation',
    ecosystem: 'java',
    intendedProjects: [
      { name: 'order-api', type: 'app', technology: 'java', description: 'Order service' },
      { name: 'user-api', type: 'app', technology: 'java', description: 'User service' },
      { name: 'common-lib', type: 'lib', technology: 'java', description: 'Shared library' },
    ],
    scalePrediction: {
      expectedApps: 3,
      expectedLibs: 2,
      expectedTeamSize: 5,
      multiLanguage: false,
      sharedCodeNeeded: true,
      ciComplexity: 'medium',
    },
    ...overrides,
  };
}

function migrationInput(overrides: Partial<NxAnalysisInput> = {}): NxAnalysisInput {
  return {
    mode: 'migration',
    productName: 'legacy-platform',
    description: 'Existing platform being evaluated for Nx',
    ecosystem: 'java',
    currentStructure: {
      rootPath: '.',
      projects: [
        { name: 'api-gateway', path: 'src/api-gateway', type: 'app', technology: 'java', buildTool: 'maven' },
        { name: 'order-service', path: 'src/order-service', type: 'app', technology: 'java', buildTool: 'maven' },
        { name: 'inventory-service', path: 'src/inventory-service', type: 'app', technology: 'java', buildTool: 'maven' },
        { name: 'shared-common', path: 'src/common', type: 'lib', technology: 'java', buildTool: 'maven' },
      ],
      sharedAssets: ['src/common'],
      buildCommands: { build: 'mvn compile', test: 'mvn test' },
    },
    knownPainPoints: ['slow CI builds', 'duplicated models across services', 'inconsistent build scripts'],
    ...overrides,
  };
}

/** Validate that all required fields exist and have correct types */
function assertOutputShape(result: NxAnalysisResult): void {
  expect(result).toHaveProperty('success');
  expect(result).toHaveProperty('mode');
  expect(result).toHaveProperty('recommendation');
  expect(result).toHaveProperty('fitScore');
  expect(result).toHaveProperty('summary');
  expect(result).toHaveProperty('rationale');
  expect(result).toHaveProperty('targetDesign');
  expect(result).toHaveProperty('projectMapping');
  expect(result).toHaveProperty('sharedLibraryOpportunities');
  expect(result).toHaveProperty('generatorOpportunities');
  expect(result).toHaveProperty('taskOrchestration');
  expect(result).toHaveProperty('setupOrMigrationSteps');
  expect(result).toHaveProperty('risks');
  expect(result).toHaveProperty('tradeoffs');
  expect(result).toHaveProperty('ciConsiderations');
  expect(result).toHaveProperty('nextAction');
  expect(result).toHaveProperty('errors');

  expect(typeof result.success).toBe('boolean');
  expect(typeof result.fitScore).toBe('number');
  expect(typeof result.summary).toBe('string');
  expect(typeof result.rationale).toBe('string');
  expect(typeof result.nextAction).toBe('string');
  expect(Array.isArray(result.projectMapping)).toBe(true);
  expect(Array.isArray(result.sharedLibraryOpportunities)).toBe(true);
  expect(Array.isArray(result.generatorOpportunities)).toBe(true);
  expect(Array.isArray(result.taskOrchestration)).toBe(true);
  expect(Array.isArray(result.setupOrMigrationSteps)).toBe(true);
  expect(Array.isArray(result.risks)).toBe(true);
  expect(Array.isArray(result.tradeoffs)).toBe(true);
  expect(Array.isArray(result.ciConsiderations)).toBe(true);
  expect(Array.isArray(result.errors)).toBe(true);
  expect(['recommended', 'optional', 'not-recommended']).toContain(result.recommendation);
  expect(['plan-ahead', 'migration']).toContain(result.mode);
  expect(result.fitScore).toBeGreaterThanOrEqual(0);
  expect(result.fitScore).toBeLessThanOrEqual(100);
}

// ---------------------------------------------------------------------------
// Output shape validation
// ---------------------------------------------------------------------------

describe('nx-monorepo skill: output structure', () => {
  it('plan-ahead result contains all required fields', async () => {
    const result = await analyzeNxMonorepo(planAheadInput());
    assertOutputShape(result);
  });

  it('migration result contains all required fields', async () => {
    const result = await analyzeNxMonorepo(migrationInput());
    assertOutputShape(result);
  });

  it('error result contains all required fields', async () => {
    const result = await analyzeNxMonorepo({
      mode: 'migration',
      productName: 'bad-input',
      description: 'Missing currentStructure',
      ecosystem: 'java',
    });
    assertOutputShape(result);
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Recommendation correctness
// ---------------------------------------------------------------------------

describe('nx-monorepo skill: recommendation correctness', () => {
  it('high-fit scenario returns recommended', async () => {
    const result = await analyzeNxMonorepo(planAheadInput({
      scalePrediction: {
        expectedApps: 5,
        expectedLibs: 3,
        expectedTeamSize: 8,
        multiLanguage: true,
        sharedCodeNeeded: true,
        ciComplexity: 'high',
      },
    }));

    expect(result.success).toBe(true);
    expect(result.recommendation).toBe('recommended');
    expect(result.fitScore).toBeGreaterThanOrEqual(55);
  });

  it('low-fit scenario returns not-recommended', async () => {
    const result = await analyzeNxMonorepo(planAheadInput({
      intendedProjects: [
        { name: 'single-app', type: 'app', technology: 'java', description: 'Only app' },
      ],
      scalePrediction: {
        expectedApps: 1,
        expectedLibs: 0,
        expectedTeamSize: 1,
        multiLanguage: false,
        sharedCodeNeeded: false,
        ciComplexity: 'low',
      },
    }));

    expect(result.success).toBe(true);
    expect(result.recommendation).toBe('not-recommended');
    expect(result.fitScore).toBeLessThan(30);
    expect(result.targetDesign).toBeNull();
  });

  it('medium-fit scenario returns optional', async () => {
    const result = await analyzeNxMonorepo(planAheadInput({
      intendedProjects: [
        { name: 'api', type: 'app', technology: 'java', description: 'API' },
        { name: 'web', type: 'app', technology: 'java', description: 'Web' },
      ],
      scalePrediction: {
        expectedApps: 2,
        expectedLibs: 1,
        expectedTeamSize: 3,
        multiLanguage: false,
        sharedCodeNeeded: true,
        ciComplexity: 'low',
      },
    }));

    expect(result.success).toBe(true);
    expect(result.recommendation).toBe('optional');
    expect(result.fitScore).toBeGreaterThanOrEqual(30);
    expect(result.fitScore).toBeLessThan(55);
  });
});

// ---------------------------------------------------------------------------
// Plan-ahead mode behavior
// ---------------------------------------------------------------------------

describe('nx-monorepo skill: plan-ahead mode', () => {
  it('returns structured result with target design', async () => {
    const result = await analyzeNxMonorepo(planAheadInput());

    expect(result.success).toBe(true);
    expect(result.mode).toBe('plan-ahead');
    expect(result.targetDesign).not.toBeNull();
    expect(result.targetDesign!.workspaceName).toBe('test-product');
    expect(result.targetDesign!.structure.length).toBeGreaterThan(0);
    expect(result.targetDesign!.nxPlugins.length).toBeGreaterThan(0);
  });

  it('maps intended projects to target structure', async () => {
    const result = await analyzeNxMonorepo(planAheadInput());

    expect(result.projectMapping.length).toBe(3);
    for (const mapping of result.projectMapping) {
      expect(mapping.source).toBe('(new)');
      expect(mapping.action).toBe('create');
      expect(mapping.target).toBeTruthy();
      expect(mapping.notes).toBeTruthy();
    }
  });

  it('identifies shared library opportunities when multiple apps exist', async () => {
    const result = await analyzeNxMonorepo(planAheadInput());
    expect(result.sharedLibraryOpportunities.length).toBeGreaterThan(0);
  });

  it('includes setup steps', async () => {
    const result = await analyzeNxMonorepo(planAheadInput());
    expect(result.setupOrMigrationSteps.length).toBeGreaterThan(0);
    expect(result.setupOrMigrationSteps[0].order).toBe(1);
  });

  it('includes java-specific task orchestration', async () => {
    const result = await analyzeNxMonorepo(planAheadInput());
    expect(result.taskOrchestration.length).toBeGreaterThan(0);
    expect(result.taskOrchestration.some((t) => t.nativeCommand.includes('mvn'))).toBe(true);
  });

  it('includes tradeoffs', async () => {
    const result = await analyzeNxMonorepo(planAheadInput());
    expect(result.tradeoffs.length).toBeGreaterThan(0);
    for (const t of result.tradeoffs) {
      expect(t.dimension).toBeTruthy();
      expect(t.benefit).toBeTruthy();
      expect(t.cost).toBeTruthy();
      expect(t.verdict).toBeTruthy();
    }
  });
});

// ---------------------------------------------------------------------------
// Migration mode behavior
// ---------------------------------------------------------------------------

describe('nx-monorepo skill: migration mode', () => {
  it('returns structured result with migration steps', async () => {
    const result = await analyzeNxMonorepo(migrationInput());

    expect(result.success).toBe(true);
    expect(result.mode).toBe('migration');
    expect(result.setupOrMigrationSteps.length).toBeGreaterThan(0);
  });

  it('maps existing projects to target locations', async () => {
    const result = await analyzeNxMonorepo(migrationInput());

    expect(result.projectMapping.length).toBe(4);
    for (const mapping of result.projectMapping) {
      expect(mapping.action).toBe('move');
      expect(mapping.source).not.toBe('(new)');
    }
  });

  it('includes migration-specific risk for restructuring', async () => {
    const result = await analyzeNxMonorepo(migrationInput());
    const migrationRisk = result.risks.find((r) => r.area === 'Migration disruption');
    expect(migrationRisk).toBeDefined();
    expect(migrationRisk!.severity).toBe('high');
  });

  it('reflects pain points in rationale', async () => {
    const result = await analyzeNxMonorepo(migrationInput());
    expect(result.rationale).toContain('pain points');
  });

  it('fails gracefully when currentStructure is missing', async () => {
    const result = await analyzeNxMonorepo({
      mode: 'migration',
      productName: 'broken',
      description: 'No structure',
      ecosystem: 'java',
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Migration mode requires currentStructure to be provided.');
    expect(result.fitScore).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Ecosystem-specific behavior
// ---------------------------------------------------------------------------

describe('nx-monorepo skill: ecosystem specifics', () => {
  it('java ecosystem includes java-specific plugins and tasks', async () => {
    const result = await analyzeNxMonorepo(planAheadInput({ ecosystem: 'java' }));
    expect(result.targetDesign!.nxPlugins).toContain('@jnxplus/nx-maven');
    expect(result.taskOrchestration.some((t) => t.nativeCommand.includes('mvn'))).toBe(true);
  });

  it('dotnet ecosystem includes dotnet-specific plugins and tasks', async () => {
    const result = await analyzeNxMonorepo(planAheadInput({
      ecosystem: 'dotnet',
      intendedProjects: [
        { name: 'web-api', type: 'app', technology: 'dotnet', description: 'API' },
        { name: 'worker', type: 'app', technology: 'dotnet', description: 'Worker' },
        { name: 'shared', type: 'lib', technology: 'dotnet', description: 'Shared' },
      ],
    }));
    expect(result.targetDesign!.nxPlugins).toContain('@nx-dotnet/core');
    expect(result.taskOrchestration.some((t) => t.nativeCommand.includes('dotnet'))).toBe(true);
  });

  it('frontend ecosystem includes frontend-specific plugins', async () => {
    const result = await analyzeNxMonorepo(planAheadInput({
      ecosystem: 'frontend',
      intendedProjects: [
        { name: 'web-app', type: 'app', technology: 'react', description: 'Main app' },
        { name: 'admin', type: 'app', technology: 'react', description: 'Admin' },
        { name: 'ui-lib', type: 'lib', technology: 'react', description: 'Components' },
      ],
    }));
    expect(result.targetDesign!.nxPlugins).toContain('@nx/react');
    expect(result.targetDesign!.nxPreset).toBe('react-monorepo');
  });

  it('mixed ecosystem provides cross-language rationale', async () => {
    const result = await analyzeNxMonorepo(planAheadInput({
      ecosystem: 'mixed',
      scalePrediction: {
        expectedApps: 4,
        expectedLibs: 2,
        expectedTeamSize: 6,
        multiLanguage: true,
        sharedCodeNeeded: true,
        ciComplexity: 'high',
      },
    }));
    expect(result.rationale).toContain('Mixed-ecosystem');
  });
});

// ---------------------------------------------------------------------------
// Serialization readiness
// ---------------------------------------------------------------------------

describe('nx-monorepo skill: serialization', () => {
  it('result is JSON-serializable', async () => {
    const result = await analyzeNxMonorepo(planAheadInput());
    const json = JSON.stringify(result);
    const parsed = JSON.parse(json) as NxAnalysisResult;

    expect(parsed.recommendation).toBe(result.recommendation);
    expect(parsed.fitScore).toBe(result.fitScore);
    expect(parsed.mode).toBe(result.mode);
    expect(parsed.tradeoffs.length).toBe(result.tradeoffs.length);
  });

  it('result contains no undefined or function values', async () => {
    const result = await analyzeNxMonorepo(migrationInput());
    const json = JSON.stringify(result);
    expect(json).not.toContain('undefined');

    // Ensure round-trip preserves all keys
    const parsed = JSON.parse(json) as Record<string, unknown>;
    const originalKeys = Object.keys(result).sort();
    const parsedKeys = Object.keys(parsed).sort();
    expect(parsedKeys).toEqual(originalKeys);
  });
});
