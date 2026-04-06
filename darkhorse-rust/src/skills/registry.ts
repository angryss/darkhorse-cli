import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function packageRoot(): string {
  // src/skills/registry.ts → ../../ (package root)
  return path.resolve(__dirname, '..', '..');
}

export function getTemplatesDir(): string {
  return path.join(packageRoot(), 'templates');
}

export function getRulesDir(): string {
  return path.join(packageRoot(), 'rules');
}

export function getGuidesDir(): string {
  return path.join(packageRoot(), 'guides');
}

export function getWorkflowsDir(): string {
  return path.join(packageRoot(), 'workflows');
}
