import fs from 'node:fs/promises';
import path from 'node:path';
import Handlebars from 'handlebars';
/**
 * Centralized template engine. All Handlebars rendering goes through here.
 *
 * Usage:
 *   const engine = new TemplateEngine(templateBaseDir);
 *   await engine.render('openspec/AGENTS.md.hbs', context, outputPath);
 *   await engine.renderString('Hello {{project.name}}', context);
 */
export class TemplateEngine {
    baseDir;
    cache = new Map();
    constructor(templateBaseDir) {
        this.baseDir = templateBaseDir;
        this.registerHelpers();
    }
    /**
     * Render a template file to an output path.
     */
    async render(templatePath, context, outputPath) {
        const compiled = await this.compile(templatePath);
        const result = compiled(context);
        await ensureDir(path.dirname(outputPath));
        await fs.writeFile(outputPath, result, 'utf-8');
    }
    /**
     * Render a template file and return the string (no file write).
     */
    async renderToString(templatePath, context) {
        const compiled = await this.compile(templatePath);
        return compiled(context);
    }
    /**
     * Render an inline template string.
     */
    renderString(template, context) {
        const compiled = Handlebars.compile(template);
        return compiled(context);
    }
    /**
     * Copy a raw file (non-template) to the output path.
     */
    async copy(sourcePath, outputPath) {
        const fullSource = path.join(this.baseDir, sourcePath);
        await ensureDir(path.dirname(outputPath));
        await fs.copyFile(fullSource, outputPath);
    }
    // -------------------------------------------------------------------------
    // Private
    // -------------------------------------------------------------------------
    async compile(templatePath) {
        const cached = this.cache.get(templatePath);
        if (cached)
            return cached;
        const fullPath = path.join(this.baseDir, templatePath);
        const source = await fs.readFile(fullPath, 'utf-8');
        const compiled = Handlebars.compile(source);
        this.cache.set(templatePath, compiled);
        return compiled;
    }
    registerHelpers() {
        Handlebars.registerHelper('eq', (a, b) => a === b);
        Handlebars.registerHelper('neq', (a, b) => a !== b);
        Handlebars.registerHelper('lowercase', (s) => s?.toLowerCase());
        Handlebars.registerHelper('uppercase', (s) => s?.toUpperCase());
        Handlebars.registerHelper('date', () => new Date().toISOString().split('T')[0]);
        Handlebars.registerHelper('year', () => new Date().getFullYear().toString());
        Handlebars.registerHelper('pascalCase', (s) => s?.split(/[-_.\s]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('') ?? '');
    }
}
// ---------------------------------------------------------------------------
// FS helpers used by the engine
// ---------------------------------------------------------------------------
async function ensureDir(dirPath) {
    await fs.mkdir(dirPath, { recursive: true });
}
//# sourceMappingURL=template-engine.js.map