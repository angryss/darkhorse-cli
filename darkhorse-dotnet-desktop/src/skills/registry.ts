import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Skill registry — resolves paths to bundled content.
 * All path resolution is centralized here so skills never compute
 * paths to rules/, guides/, workflows/, or templates/ on their own.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Root of the darkhorse-dotnet-desktop package (two levels up from dist/skills/). */
function packageRoot(): string {
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
