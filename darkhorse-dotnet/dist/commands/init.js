import inquirer from 'inquirer';
import path from 'node:path';
import { logger } from '../core/logger.js';
import { buildConfig } from '../core/types.js';
import { initAgent } from '../agents/init.agent.js';
import { fsUtil } from '../core/index.js';
const VALID_PLATFORMS = ['web', 'mobile', 'both'];
export function registerInitCommand(program) {
    program
        .command('init')
        .description('Initialize a new DarkHorse .NET workspace')
        .option('-n, --name <name>', 'Project name')
        .option('-d, --description <description>', 'Project description')
        .option('-ns, --namespace <namespace>', 'Workspace namespace (default: PascalCase of name)')
        .option('--frontend', 'Include React frontend scaffold')
        .option('--no-frontend', 'Skip frontend')
        .option('--platform <platform>', 'Frontend platform: web, mobile, or both')
        .option('-o, --output <dir>', 'Output directory', '.')
        .action(async (opts) => {
        logger.header('DarkHorse .NET — Initialize Workspace');
        logger.blank();
        if (opts.platform && !VALID_PLATFORMS.includes(opts.platform)) {
            logger.error(`Invalid platform: "${opts.platform}". Must be one of: ${VALID_PLATFORMS.join(', ')}`);
            process.exit(1);
        }
        const answers = await promptMissing(opts);
        const input = {
            name: answers.name,
            description: answers.description,
            namespace: answers.namespace,
            includeFrontend: answers.includeFrontend,
            frontendPlatform: answers.frontendPlatform,
            outputDir: path.resolve(answers.output),
        };
        const projectDir = path.join(input.outputDir, input.name);
        if (await fsUtil.pathExists(projectDir)) {
            logger.error(`Directory already exists: ${projectDir}`);
            process.exit(1);
        }
        const config = buildConfig(input);
        await initAgent(config);
    });
}
async function promptMissing(opts) {
    const questions = [];
    if (!opts.name) {
        questions.push({
            type: 'input',
            name: 'name',
            message: 'Workspace name:',
            validate: (v) => /^[a-z][a-z0-9-]*$/.test(v) || 'lowercase alphanumeric with hyphens',
        });
    }
    if (!opts.description) {
        questions.push({
            type: 'input',
            name: 'description',
            message: 'Project description:',
            validate: (v) => v.length > 0 || 'Description is required',
        });
    }
    if (opts.frontend === undefined) {
        questions.push({
            type: 'confirm',
            name: 'includeFrontend',
            message: 'Include React frontend?',
            default: false,
        });
    }
    const prompted = questions.length > 0
        ? await inquirer.prompt(questions)
        : {};
    const includeFrontend = opts.frontend !== undefined ? Boolean(opts.frontend) : (prompted.includeFrontend ?? false);
    let frontendPlatform = 'web';
    if (includeFrontend && !opts.platform) {
        const platformAnswer = await inquirer.prompt([{
                type: 'list',
                name: 'frontendPlatform',
                message: 'Frontend platform:',
                choices: [
                    { name: 'Web — React + Vite', value: 'web' },
                    { name: 'Mobile — React Native + Expo', value: 'mobile' },
                    { name: 'Both — Web + Mobile', value: 'both' },
                ],
            }]);
        frontendPlatform = platformAnswer.frontendPlatform;
    }
    else if (opts.platform) {
        frontendPlatform = opts.platform;
    }
    return {
        name: opts.name ?? prompted.name,
        description: opts.description ?? prompted.description,
        namespace: opts.namespace ?? undefined,
        includeFrontend,
        frontendPlatform,
        output: opts.output ?? '.',
    };
}
//# sourceMappingURL=init.js.map