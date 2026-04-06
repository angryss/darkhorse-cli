import Handlebars from 'handlebars';
import path from 'node:path';
import { readText } from './fs.js';
import { writeFile } from './fs.js';
import type { TemplateContext } from './types.js';

export class TemplateEngine {
  private baseDir: string;

  constructor(templateBaseDir: string) {
    this.baseDir = templateBaseDir;
    this.registerHelpers();
  }

  private registerHelpers(): void {
    Handlebars.registerHelper('eq', (a, b) => a === b);
    Handlebars.registerHelper('neq', (a, b) => a !== b);
    Handlebars.registerHelper('lowercase', (s: string) => s?.toLowerCase());
    Handlebars.registerHelper('uppercase', (s: string) => s?.toUpperCase());
    Handlebars.registerHelper('snakeCase', (s: string) => s?.replace(/-/g, '_'));
    Handlebars.registerHelper('pascalCase', (s: string) =>
      s
        ?.split(/[-_]/)
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(''),
    );
    Handlebars.registerHelper('date', () => new Date().toISOString().split('T')[0]);
    Handlebars.registerHelper('year', () => new Date().getFullYear().toString());
  }

  async render(templatePath: string, context: TemplateContext, outputPath: string): Promise<void> {
    const fullPath = path.join(this.baseDir, templatePath);
    const source = await readText(fullPath);
    const template = Handlebars.compile(source, { noEscape: true });
    const output = template(context);
    await writeFile(outputPath, output);
  }

  async renderToString(templatePath: string, context: TemplateContext): Promise<string> {
    const fullPath = path.join(this.baseDir, templatePath);
    const source = await readText(fullPath);
    const template = Handlebars.compile(source, { noEscape: true });
    return template(context);
  }

  renderString(template: string, context: TemplateContext): string {
    const compiled = Handlebars.compile(template, { noEscape: true });
    return compiled(context);
  }

  async copy(sourcePath: string, outputPath: string): Promise<void> {
    const fullPath = path.join(this.baseDir, sourcePath);
    const content = await readText(fullPath);
    await writeFile(outputPath, content);
  }
}
