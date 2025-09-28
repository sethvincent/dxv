import fs from 'bare-fs/promises'
import * as path from 'bare-path'
import { fileExists } from './fs.js'

/**
 * @typedef {{ [key: string]: any }} PackageJson
 */

/**
 * @param {Object} options
 * @param {string} options.cwd
 * @returns {Promise<PackageJson>} packageJson
 */
export async function readPackageJson ({ cwd }) {
  const packageJsonFilepath = path.join(cwd, 'package.json')

  if (!(await fileExists(packageJsonFilepath))) {
    const notFound =
      /** @type {Error & { code?: string }} */ (new Error(`package.json not found at filepath: ${packageJsonFilepath}`))
    notFound.code = 'ENOTFOUND'
    throw notFound
  }

  try {
    const contents = await fs.readFile(packageJsonFilepath, 'utf8')
    return JSON.parse(contents)
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      const notFoundError = /** @type {Error & { code?: string }} */ (new Error(
        `package.json not found at filepath: ${packageJsonFilepath}`,
      ))
      notFoundError.code = 'ENOTFOUND'
      throw notFoundError
    }

    if (error instanceof SyntaxError) {
      const parseError = new Error(`Unable to parse package.json at ${packageJsonFilepath}: ${error.message}`)
      throw parseError
    }

    throw error
  }
}
