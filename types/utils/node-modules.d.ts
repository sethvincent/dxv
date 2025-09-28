/**
 * Find the nearest node_modules directory starting from the provided cwd.
 * @param {{ cwd?: string }} [options]
 * @returns {Promise<string|null>} Absolute path to the node_modules directory or null.
 */
export function findNodeModules (options?: {
  cwd?: string
}): Promise<string | null>
