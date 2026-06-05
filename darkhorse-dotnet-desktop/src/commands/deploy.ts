import { Command } from 'commander';
import { logger } from '../core/logger.js';

/**
 * `deploy` command — provisions CI/CD pipelines for an existing project.
 *
 * Subcommands:
 *   setup-cicd  Push the generated pipeline YAML to GitHub/Azure DevOps via REST API
 *               using a PAT. Alternatively, use the MCP server tool 'setup_cicd_pipeline'.
 *
 * Usage:
 *   darkhorse-dotnet-desktop deploy setup-cicd \
 *     --provider github-actions \
 *     --repo https://github.com/org/repo \
 *     --pat <GITHUB_TOKEN>
 *
 *   darkhorse-dotnet-desktop deploy setup-cicd \
 *     --provider ado \
 *     --org https://dev.azure.com/myorg \
 *     --project MyProject \
 *     --pat <ADO_PAT>
 */
export function registerDeployCommand(program: Command): void {
  const deploy = program
    .command('deploy')
    .description('Provision CI/CD pipelines and release infrastructure');

  deploy
    .command('setup-cicd')
    .description('Push pipeline YAML to GitHub Actions or Azure DevOps using a PAT')
    .option('--provider <provider>', 'CI/CD provider: github-actions | ado')
    .option('--repo <url>', 'GitHub repository URL (e.g. https://github.com/org/repo)')
    .option('--org <url>', 'Azure DevOps organization URL (e.g. https://dev.azure.com/myorg)')
    .option('--project <name>', 'Azure DevOps project name')
    .option('--pat <token>', 'Personal Access Token for authentication')
    .action(async (opts) => {
      logger.header('DarkHorse .NET Desktop — Deploy: Setup CI/CD');
      logger.blank();
      logger.warn('This command is not yet implemented.');
      logger.blank();
      logger.info('Option A — MCP Server (recommended):');
      logger.step('Start the MCP server: darkhorse-dotnet-desktop mcp-serve');
      logger.step('Use the MCP tool "setup_cicd_pipeline" in your AI agent.');
      logger.blank();
      logger.info('Option B — Generated pipeline YAML:');
      if (opts.provider === 'github-actions' || !opts.provider) {
        logger.step('Commit .github/workflows/build-installer.yml to your repository.');
        logger.step('GitHub Actions will run automatically on push to main and version tags.');
      }
      if (opts.provider === 'ado') {
        logger.step('Commit azure-pipelines.yml to your repository.');
        logger.step('In Azure DevOps: Pipelines → New Pipeline → Azure Repos Git → Existing YAML file.');
        if (opts.org) logger.info(`Organization: ${opts.org}`);
      }
    });
}
