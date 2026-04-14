import path from 'node:path';
import { fsUtil, TemplateEngine, type DarkhorseConfig, type SkillResult, type TemplateContext } from '../core/index.js';
import { ARCHETYPE_CATEGORIES } from '../core/types.js';
import { getTemplatesDir, getToolkitDir } from './registry.js';

/**
 * Scaffolding skill — creates the canonical directory structure and base project files.
 * Structure varies by archetype (api, bff-api, microservice).
 */
export async function scaffold(config: DarkhorseConfig): Promise<SkillResult> {
  const filesCreated: string[] = [];
  const errors: string[] = [];
  const p = config.paths;

  try {
    // Create canonical directories (shared across all archetypes)
    const dirs = [
      p.context,
      p.openspec,
      path.join(p.openspec, 'specs'),
      path.join(p.openspec, 'changes'),
      path.join(p.openspec, 'archive'),
      // Backend category folders (empty at init; projects added later)
      path.join(p.root, 'backend', 'apis'),
      path.join(p.root, 'backend', 'bffs'),
      path.join(p.root, 'backend', 'microservices'),
      p.deployment,
      p.vscode,
    ];

    // Archetype-specific directories
    if (config.archetype === 'api') {
      // Standard API: persistence-ready
    } else if (config.archetype === 'bff-api') {
      // BFF: downstream clients + messaging, no persistence
    } else if (config.archetype === 'microservice') {
      // Microservice: messaging + event handling
    }

    if (config.features.frontend) {
      const platforms = config.frontend?.platform === 'both'
        ? ['web', 'mobile'] as const
        : [config.frontend?.platform ?? 'web'] as const;

      dirs.push(p.frontend);
      for (const plat of platforms) {
        const appDir = plat === 'mobile' ? 'mobile-app' : 'web-app';
        dirs.push(
          path.join(p.frontend, appDir),
          path.join(p.frontend, appDir, 'src'),
        );
        if (plat === 'mobile') {
          dirs.push(path.join(p.frontend, appDir, 'app'));
        }
      }
    }

    for (const dir of dirs) {
      await fsUtil.ensureDir(dir);
    }

    // Render templates via the template engine
    const engine = new TemplateEngine(getTemplatesDir());
    const ctx = buildTemplateContext(config);

    // Deployment: docker-compose.yml
    const dockerPath = path.join(p.deployment, 'docker-compose.yml');
    await engine.render('deployment/docker-compose.yml.hbs', ctx, dockerPath);
    filesCreated.push(dockerPath);

    // .vscode/mcp.json
    const mcpPath = path.join(p.vscode, 'mcp.json');
    await engine.render('vscode/mcp.json.hbs', ctx, mcpPath);
    filesCreated.push(mcpPath);

    // Root .gitignore
    const gitignorePath = path.join(p.root, '.gitignore');
    await engine.render('gitignore.hbs', ctx, gitignorePath);
    filesCreated.push(gitignorePath);

    // Root README.md
    const readmePath = path.join(p.root, 'README.md');
    await engine.render('readme.md.hbs', ctx, readmePath);
    filesCreated.push(readmePath);

    // Frontend (optional)
    if (config.features.frontend) {
      const platforms = config.frontend?.platform === 'both'
        ? ['web', 'mobile'] as const
        : [config.frontend?.platform ?? 'web'] as const;

      for (const plat of platforms) {
        const isMobile = plat === 'mobile';
        const appDir = isMobile ? 'mobile-app' : 'web-app';
        const template = isMobile ? 'frontend/mobile-package.json.hbs' : 'frontend/package.json.hbs';
        const pkgPath = path.join(p.frontend, appDir, 'package.json');
        await engine.render(template, ctx, pkgPath);
        filesCreated.push(pkgPath);
      }

      // Copy bundled toolkit into generated project's frontend/toolkit/
      if (config.frontend?.toolkit) {
        const toolkitSrc = getToolkitDir();
        const toolkitDest = path.join(p.frontend, 'toolkit');
        await fsUtil.copyDir(toolkitSrc, toolkitDest);
        filesCreated.push(toolkitDest);
      }
    }
  } catch (err) {
    errors.push(`Scaffolding error: ${err instanceof Error ? err.message : String(err)}`);
  }

  return { success: errors.length === 0, filesCreated, filesModified: [], errors };
}

function buildTemplateContext(config: DarkhorseConfig): TemplateContext {
  return {
    project: config,
    archetypeCategory: ARCHETYPE_CATEGORIES[config.archetype],
    timestamp: new Date().toISOString().split('T')[0],
    cliVersion: '0.1.0',
  };
}
