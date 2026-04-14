/**
 * Dependency parsing and calculation utilities
 */
/**
 * Parse dependency string
 * Formats: "3", "3FS", "3FS+2", "3,5", "3FS,5SS+1"
 */
export function parseDependencies(dependencyString) {
    if (!dependencyString)
        return [];
    const dependencies = [];
    const parts = dependencyString.split(',');
    for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed)
            continue;
        // Match pattern: ID + optional type + optional lag
        const match = trimmed.match(/^(\d+)([A-Z]{2})?([+-]\d+)?$/);
        if (match) {
            const [, taskId, type, lag] = match;
            dependencies.push({
                taskId: parseInt(taskId, 10),
                type: type || 'FS',
                lag: lag ? parseInt(lag, 10) : undefined,
            });
        }
    }
    return dependencies;
}
/**
 * Get dependency type display name
 */
export function getDependencyTypeName(type) {
    const names = {
        FS: 'Finish-to-Start',
        SS: 'Start-to-Start',
        FF: 'Finish-to-Finish',
        SF: 'Start-to-Finish',
    };
    return names[type];
}
/**
 * Format dependency for display
 */
export function formatDependency(dep) {
    let result = `${dep.taskId}${dep.type}`;
    if (dep.lag) {
        result += dep.lag > 0 ? `+${dep.lag}` : dep.lag;
    }
    return result;
}
/**
 * Validate dependency (check for circular dependencies)
 */
export function hasCircularDependency(taskId, _dependencies, taskMap) {
    const visited = new Set();
    function visit(id) {
        if (visited.has(id))
            return true;
        visited.add(id);
        const deps = taskMap.get(id) || [];
        for (const dep of deps) {
            if (visit(dep.taskId))
                return true;
        }
        visited.delete(id);
        return false;
    }
    return visit(taskId);
}
//# sourceMappingURL=dependencyUtils.js.map