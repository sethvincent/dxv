/**
 * @param {Object} options
 * @param {string} options.cwd
 * @returns {Promise<import('type-fest').PackageJson>} packageJson
 */
export function readPackageJson ({ cwd }: {
  cwd: string
}): Promise<import('type-fest').PackageJson>
