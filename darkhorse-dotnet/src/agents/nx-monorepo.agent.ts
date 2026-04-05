import { logger } from '../core/logger.js';
import { type NxAnalysisInput, type NxAnalysisResult, analyzeNxMonorepo } from '../skills/nx-monorepo.js';

/**
 * Nx Monorepo agent — thin orchestrator.
 * Delegates all reasoning to the nx-monorepo skill and presents results.
 */
export async function nxMonorepoAgent(input: NxAnalysisInput): Promise<NxAnalysisResult> {
  const modeLabel = input.mode === 'plan-ahead' ? 'Plan-Ahead' : 'Migration';
  logger.header(`Nx Monorepo — ${modeLabel} Analysis`);
  logger.info(`Product: ${input.productName}`);
  logger.info(`Ecosystem: ${input.ecosystem}`);
  logger.blank();

  logger.step('Running Nx monorepo analysis...');
  const result = await analyzeNxMonorepo(input);

  logger.blank();

  if (!result.success) {
    for (const err of result.errors) {
      logger.error(err);
    }
    return result;
  }

  // Present recommendation
  const recLabel = result.recommendation === 'recommended' ? '✓ Recommended'
    : result.recommendation === 'optional' ? '~ Optional'
    : '✗ Not Recommended';
  logger.success(`Recommendation: ${recLabel} (fit score: ${result.fitScore}/100)`);
  logger.info(result.summary);
  logger.blank();

  // Present rationale
  logger.step('Rationale:');
  for (const line of result.rationale.split('\n')) {
    logger.info(`  ${line}`);
  }
  logger.blank();

  // Target design summary
  if (result.targetDesign) {
    logger.step('Target workspace structure:');
    for (const entry of result.targetDesign.structure) {
      logger.info(`  ${entry.path} (${entry.kind}) — ${entry.description}`);
    }
    logger.blank();

    if (result.targetDesign.nxPlugins.length > 1) {
      logger.step('Nx plugins:');
      for (const plugin of result.targetDesign.nxPlugins) {
        logger.info(`  ${plugin}`);
      }
      logger.blank();
    }
  }

  // Shared library opportunities
  if (result.sharedLibraryOpportunities.length > 0) {
    logger.step('Shared library opportunities:');
    for (const lib of result.sharedLibraryOpportunities) {
      logger.info(`  ${lib.proposedPath} — ${lib.description}`);
    }
    logger.blank();
  }

  // Task orchestration
  if (result.taskOrchestration.length > 0) {
    logger.step('Task orchestration:');
    for (const task of result.taskOrchestration) {
      const cache = task.cacheable ? ' [cacheable]' : '';
      const affected = task.affectable ? ' [affected]' : '';
      logger.info(`  nx ${task.nxTarget} → ${task.nativeCommand}${cache}${affected}`);
    }
    logger.blank();
  }

  // Steps
  if (result.setupOrMigrationSteps.length > 0) {
    const stepLabel = input.mode === 'migration' ? 'Migration' : 'Setup';
    logger.step(`${stepLabel} steps:`);
    for (const step of result.setupOrMigrationSteps) {
      const riskBadge = step.risk === 'high' ? ' [HIGH RISK]' : step.risk === 'medium' ? ' [MEDIUM RISK]' : '';
      logger.info(`  ${step.order}. ${step.title}${riskBadge}`);
    }
    logger.blank();
  }

  // Risks
  if (result.risks.length > 0) {
    logger.step('Risks:');
    for (const risk of result.risks) {
      logger.warn(`  [${risk.severity.toUpperCase()}] ${risk.area}: ${risk.description}`);
    }
    logger.blank();
  }

  // Tradeoffs
  if (result.tradeoffs.length > 0) {
    logger.step('Tradeoffs:');
    for (const t of result.tradeoffs) {
      logger.info(`  ${t.dimension}:`);
      logger.info(`    Benefit: ${t.benefit}`);
      logger.info(`    Cost: ${t.cost}`);
      logger.info(`    Verdict: ${t.verdict}`);
    }
    logger.blank();
  }

  // Next action
  logger.step('Next action:');
  logger.info(`  ${result.nextAction}`);
  logger.blank();

  return result;
}
