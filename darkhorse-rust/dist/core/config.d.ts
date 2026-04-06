import type { DarkhorseConfig } from './types.js';
export declare function writeConfig(config: DarkhorseConfig): Promise<void>;
export declare function readConfig(projectRoot: string): Promise<DarkhorseConfig>;
export declare function configExists(projectRoot: string): Promise<boolean>;
//# sourceMappingURL=config.d.ts.map