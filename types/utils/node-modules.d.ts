/**
 * Find node_modules directories starting from the provided pathnames.
 * @param {string[]} pathnames
 * @returns {Promise<string[]>} pathnames to the node_modules directories.
 */
export function findNodeModules(pathnames: string[]): Promise<string[]>;
