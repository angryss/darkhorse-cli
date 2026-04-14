/**
 * Dependency parsing and calculation utilities
 */
import type { ParsedDependency, DependencyType } from '../types';
/**
 * Parse dependency string
 * Formats: "3", "3FS", "3FS+2", "3,5", "3FS,5SS+1"
 */
export declare function parseDependencies(dependencyString: string | undefined): ParsedDependency[];
/**
 * Get dependency type display name
 */
export declare function getDependencyTypeName(type: DependencyType): string;
/**
 * Format dependency for display
 */
export declare function formatDependency(dep: ParsedDependency): string;
/**
 * Validate dependency (check for circular dependencies)
 */
export declare function hasCircularDependency(taskId: string | number, _dependencies: ParsedDependency[], taskMap: Map<string | number, ParsedDependency[]>): boolean;
//# sourceMappingURL=dependencyUtils.d.ts.map