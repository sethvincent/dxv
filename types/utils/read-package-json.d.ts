/**
 * @typedef {{ [key: string]: any }} PackageJson
 */
/**
 * @param {Object} options
 * @param {string} options.cwd
 * @returns {Promise<PackageJson>} packageJson
 */
export function readPackageJson({ cwd }: {
    cwd: string;
}): Promise<PackageJson>;
export type PackageJson = {
    [key: string]: any;
};
