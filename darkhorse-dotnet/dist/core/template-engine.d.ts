import type { TemplateContext } from './types.js';
/**
 * Centralized template engine. All Handlebars rendering goes through here.
 *
 * Usage:
 *   const engine = new TemplateEngine(templateBaseDir);
 *   await engine.render('openspec/AGENTS.md.hbs', context, outputPath);
 *   await engine.renderString('Hello {{project.name}}', context);
 */
export declare class TemplateEngine {
    private readonly baseDir;
    private readonly cache;
    constructor(templateBaseDir: string);
    /**
     * Render a template file to an output path.
     */
    render(templatePath: string, context: TemplateContext, outputPath: string): Promise<void>;
    /**
     * Render a template file and return the string (no file write).
     */
    renderToString(templatePath: string, context: TemplateContext): Promise<string>;
    /**
     * Render an inline template string.
     */
    renderString(template: string, context: TemplateContext): string;
    /**
     * Copy a raw file (non-template) to the output path.
     */
    copy(sourcePath: string, outputPath: string): Promise<void>;
    private compile;
    private registerHelpers;
}
//# sourceMappingURL=template-engine.d.ts.map