import type { TemplateContext } from './types.js';
export declare class TemplateEngine {
    private baseDir;
    constructor(templateBaseDir: string);
    private registerHelpers;
    render(templatePath: string, context: TemplateContext, outputPath: string): Promise<void>;
    renderToString(templatePath: string, context: TemplateContext): Promise<string>;
    renderString(template: string, context: TemplateContext): string;
    copy(sourcePath: string, outputPath: string): Promise<void>;
}
//# sourceMappingURL=template-engine.d.ts.map