import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function packageRoot() {
    // src/skills/registry.ts → ../../ (package root)
    return path.resolve(__dirname, '..', '..');
}
export function getTemplatesDir() {
    return path.join(packageRoot(), 'templates');
}
export function getRulesDir() {
    return path.join(packageRoot(), 'rules');
}
export function getGuidesDir() {
    return path.join(packageRoot(), 'guides');
}
export function getWorkflowsDir() {
    return path.join(packageRoot(), 'workflows');
}
//# sourceMappingURL=registry.js.map