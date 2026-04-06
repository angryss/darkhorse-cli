import inquirer from 'inquirer';
import { buildConfig } from '../core/types.js';
import { logger } from '../core/logger.js';
import { pathExists } from '../core/fs.js';
import { initAgent } from '../agents/init.agent.js';
import path from 'node:path';
const NAME_RE = /^[a-z][a-z0-9-]*$/;
export function registerInitCommand(program) {
    program
        .command('init')
        .description('Scaffold a new Rust/Tauri desktop project with full Dark Horse guidance system')
        .argument('[name]', 'Project name (kebab-case)')
        .option('-d, --description <desc>', 'Project description')
        .option('--crate-prefix <prefix>', 'Crate name prefix (e.g. "vps" for visu-photo-studio)')
        .option('--edition <edition>', 'Rust edition (2021 or 2024)', '2024')
        .option('--no-frontend', 'Skip frontend scaffolding')
        .option('-o, --output <dir>', 'Output directory', '.')
        .action(async (name, opts) => {
        try {
            // Interactive prompts for missing fields
            const answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'name',
                    message: 'Project name (kebab-case):',
                    validate: (v) => NAME_RE.test(v) || 'Must be lowercase alphanumeric with hyphens, starting with a letter',
                    when: () => !name,
                },
                {
                    type: 'input',
                    name: 'description',
                    message: 'Project description:',
                    when: () => !opts.description,
                },
            ]);
            const projectName = name || answers.name;
            const description = opts.description || answers.description || '';
            const edition = opts.edition === '2021' ? '2021' : '2024';
            const outputDir = opts.output || '.';
            // Validate name
            if (!NAME_RE.test(projectName)) {
                logger.error('Project name must be lowercase alphanumeric with hyphens, starting with a letter.');
                process.exit(1);
            }
            // Check if directory already exists
            const targetDir = path.resolve(outputDir, projectName);
            if (await pathExists(targetDir)) {
                logger.error(`Directory already exists: ${targetDir}`);
                process.exit(1);
            }
            const input = {
                name: projectName,
                description,
                cratePrefix: opts.cratePrefix,
                edition,
                includeFrontend: opts.frontend !== false,
                outputDir,
            };
            const config = buildConfig(input);
            await initAgent(config);
        }
        catch (err) {
            logger.error(`Init failed: ${err instanceof Error ? err.message : String(err)}`);
            process.exit(1);
        }
    });
}
//# sourceMappingURL=init.js.map