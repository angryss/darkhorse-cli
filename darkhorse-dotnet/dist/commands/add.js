import inquirer from 'inquirer';
import path from 'node:path';
import { logger } from '../core/logger.js';
import { ARCHETYPE_LABELS, buildServiceConfig, } from '../core/types.js';
import { readConfig, configExists } from '../core/config.js';
import { addAgent } from '../agents/add.agent.js';
const VALID_ARCHETYPES = ['api', 'bff-api', 'microservice'];
export function registerAddCommand(program) {
    program
        .command('add [type]')
        .description('Add a service to the current DarkHorse workspace')
        .option('-n, --name <name>', 'Service name (e.g. order-api)')
        .option('-ns, --namespace <namespace>', 'Root namespace (e.g. MyCompany.Orders)')
        .option('--dotnet-version <version>', '.NET version (8 or 9)', '8')
        .option('-p, --project <dir>', 'Workspace root directory (default: cwd)', '.')
        .action(async (typeArg, opts) => {
        logger.header('DarkHorse .NET — Add Service');
        logger.blank();
        // Resolve project root
        const projectRoot = path.resolve(opts.project);
        if (!(await configExists(projectRoot))) {
            logger.error('No .darkhorse.yaml found. Run `darkhorse-dotnet init` first.');
            process.exit(1);
        }
        if (typeArg && !VALID_ARCHETYPES.includes(typeArg)) {
            logger.error(`Invalid type: "${typeArg}". Must be one of: ${VALID_ARCHETYPES.join(', ')}`);
            process.exit(1);
        }
        const answers = await promptMissing(opts, typeArg);
        const projectConfig = await readConfig(projectRoot);
        const input = {
            archetype: answers.archetype,
            name: answers.name,
            namespace: answers.namespace,
            dotnetVersion: answers.dotnetVersion,
            projectRoot,
        };
        const serviceConfig = buildServiceConfig(input, projectConfig);
        await addAgent(serviceConfig);
    });
}
async function promptMissing(opts, typeArg) {
    const questions = [];
    if (!typeArg) {
        questions.push({
            type: 'list',
            name: 'archetype',
            message: 'Service type:',
            choices: VALID_ARCHETYPES.map((a) => ({ name: ARCHETYPE_LABELS[a], value: a })),
        });
    }
    if (!opts.name) {
        questions.push({
            type: 'input',
            name: 'name',
            message: 'Service name (e.g. order-api):',
            validate: (v) => /^[a-z][a-z0-9-]*$/.test(v) || 'lowercase alphanumeric with hyphens',
        });
    }
    if (!opts.namespace) {
        questions.push({
            type: 'input',
            name: 'namespace',
            message: 'Root namespace (e.g. MyCompany.Orders):',
            validate: (v) => /^[A-Z][a-zA-Z0-9]*(\.[A-Z][a-zA-Z0-9]*)*$/.test(v) || 'Valid C# namespace required',
        });
    }
    const prompted = questions.length > 0
        ? await inquirer.prompt(questions)
        : {};
    return {
        archetype: typeArg ?? prompted.archetype,
        name: opts.name ?? prompted.name,
        namespace: opts.namespace ?? prompted.namespace,
        dotnetVersion: Number(opts.dotnetVersion) || 8,
    };
}
//# sourceMappingURL=add.js.map