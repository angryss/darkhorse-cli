import type { DarkhorseConfig } from './types.js';
/**
 * Write project config to .darkhorse.yaml in the project root.
 */
export declare function writeConfig(config: DarkhorseConfig): Promise<void>;
/**
 * Read project config from .darkhorse.yaml.
 */
export declare function readConfig(projectRoot: string): Promise<DarkhorseConfig>;
/**
 * Check if a .darkhorse.yaml exists at the given path.
 */
export declare function configExists(projectRoot: string): Promise<boolean>;
//# sourceMappingURL=config.d.ts.map