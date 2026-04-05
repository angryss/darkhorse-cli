import fs from 'node:fs/promises';
import path from 'node:path';
import Handlebars from 'handlebars';
import type { TemplateContext } from './types.js';

/**
 * Centralized template engine. All Handlebars rendering goes through here.
 *
 * Usage:
 *   const engine = new TemplateEngine(templateBaseDir);
 *   await engine.render('openspec/AGENTS.md.hbs', context, outputPath);
 *   await engine.renderString('Hello {{project.name}}', context);
 */
export class TemplateEngine {
  private readonly baseDir: string;
  private readonly cache = new Map<string, HandlebarsTemplateDelegate>();

  constructor(templateBaseDir: string) {
    this.baseDir = templateBaseDir;
    this.registerHelpers();
  }

  /**
   * Render a template file to an output path.
   */
  async render(
    templatePath: string,
    context: TemplateContext,
    outputPath: string,
  ): Promise<void> {
    const compiled = await this.compile(templatePath);
    const result = compiled(context);
    await ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, result, 'utf-8');
  }

  /**
   * Render a template file and return the string (no file write).
   */
  async renderToString(
    templatePath: string,
    context: TemplateContext,
  ): Promise<string> {
    const compiled = await this.compile(templatePath);
    return compiled(context);
  }

  /**
   * Render an inline template string.
   */
  renderString(template: string, context: TemplateContext): string {
    const compiled = Handlebars.compile(template);
    return compiled(context);
  }

  /**
   * Copy a raw file (non-template) to the output path.
   */
  async copy(sourcePath: string, outputPath: string): Promise<void> {
    const fullSource = path.join(this.baseDir, sourcePath);
    await ensureDir(path.dirname(outputPath));
    await fs.copyFile(fullSource, outputPath);
  }

  // -------------------------------------------------------------------------
  // Private
  // -------------------------------------------------------------------------

  private async compile(templatePath: string): Promise<HandlebarsTemplateDelegate> {
    const cached = this.cache.get(templatePath);
    if (cached) return cached;

    const fullPath = path.join(this.baseDir, templatePath);
    const source = await fs.readFile(fullPath, 'utf-8');
    const compiled = Handlebars.compile(source);
    this.cache.set(templatePath, compiled);
    return compiled;
  }

  private registerHelpers(): void {
    Handlebars.registerHelper('eq', (a, b) => a === b);
    Handlebars.registerHelper('neq', (a, b) => a !== b);
    Handlebars.registerHelper('lowercase', (s: string) => s?.toLowerCase());
    Handlebars.registerHelper('uppercase', (s: string) => s?.toUpperCase());
    Handlebars.registerHelper('date', () => new Date().toISOString().split('T')[0]);
    Handlebars.registerHelper('year', () => new Date().getFullYear().toString());
  }
}

// ---------------------------------------------------------------------------
// FS helpers used by the engine
// ---------------------------------------------------------------------------

async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}
