import path from 'node:path';
import {
  fsUtil,
  TemplateEngine,
  type DarkhorseConfig,
  type SkillResult,
  type TemplateContext,
} from '../core/index.js';
import { getTemplatesDir } from './registry.js';

/**
 * scaffoldDeployment — called by `darkhorse-dotnet-desktop init`
 *
 * Creates:
 *   deploy/installer/  — WiX 4 SDK-style installer project
 *   deploy/ci/         — GitHub Actions or Azure DevOps pipeline YAML
 */
export async function scaffoldDeployment(config: DarkhorseConfig): Promise<SkillResult> {
  const filesCreated: string[] = [];
  const errors: string[] = [];
  const deploy = config.paths.deploy;
  const ns = config.dotnet.namespace;

  try {
    // -----------------------------------------------------------------------
    // 1. Directory structure
    // -----------------------------------------------------------------------
    const dirs = [
      deploy,
      path.join(deploy, 'installer'),
      path.join(deploy, 'installer', 'ui'),
      path.join(deploy, 'installer', 'assets'),
      path.join(deploy, 'ci'),
    ];

    for (const dir of dirs) {
      await fsUtil.ensureDir(dir);
    }

    const engine = new TemplateEngine(getTemplatesDir());
    const ctx = buildDeploymentContext(config);

    // -----------------------------------------------------------------------
    // 2. WiX 4 installer project
    // -----------------------------------------------------------------------
    const wixFiles: Array<{ template: string; dest: string }> = [
      {
        template: 'deployment/wix/Installer.wixproj.hbs',
        dest: path.join(deploy, 'installer', `${ns}.Installer.wixproj`),
      },
      {
        template: 'deployment/wix/Variables.wxi.hbs',
        dest: path.join(deploy, 'installer', 'Variables.wxi'),
      },
      {
        template: 'deployment/wix/Product.wxs.hbs',
        dest: path.join(deploy, 'installer', 'Product.wxs'),
      },
      {
        template: 'deployment/wix/ui/ExitDialogOverride.wxs.hbs',
        dest: path.join(deploy, 'installer', 'ui', 'ExitDialogOverride.wxs'),
      },
    ];

    for (const { template, dest } of wixFiles) {
      await engine.render(template, ctx, dest);
      filesCreated.push(dest);
    }

    // Placeholder app icon (developers replace with their own)
    const iconPlaceholder = path.join(deploy, 'installer', 'assets', 'app.ico.placeholder');
    await fsUtil.writeFile(
      iconPlaceholder,
      '# Replace this file with app.ico — a multi-size Windows icon (256x256, 48x48, 32x32, 16x16)\n',
    );
    filesCreated.push(iconPlaceholder);

    // -----------------------------------------------------------------------
    // 3. CI/CD pipeline YAML
    // -----------------------------------------------------------------------
    const cicd = config.deployment.cicd;

    if (cicd === 'github-actions') {
      await fsUtil.ensureDir(path.join(config.paths.root, '.github', 'workflows'));
      const pipelinePath = path.join(config.paths.root, '.github', 'workflows', 'build-installer.yml');
      await engine.render('deployment/ci/build-github.yml.hbs', ctx, pipelinePath);
      filesCreated.push(pipelinePath);
    }

    if (cicd === 'ado') {
      const pipelinePath = path.join(config.paths.root, 'azure-pipelines.yml');
      await engine.render('deployment/ci/azure-pipelines.yml.hbs', ctx, pipelinePath);
      filesCreated.push(pipelinePath);
    }

  } catch (err) {
    errors.push(`Deployment scaffolding error: ${err instanceof Error ? err.message : String(err)}`);
  }

  return { success: errors.length === 0, filesCreated, filesModified: [], errors };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function buildDeploymentContext(
  config: DarkhorseConfig,
  extras: Record<string, unknown> = {},
): TemplateContext {
  return {
    project: config,
    timestamp: new Date().toISOString().split('T')[0],
    cliVersion: '0.1.0',
    ...extras,
  };
}
