import * as path from 'path'
import read from 'read-package-json-fast'
import { fileExists } from './fs.js'

/**
 * @param {Object} options
 * @param {string} options.cwd
 * @returns {Promise<Object<string, any>>} packageJson
 */
export async function readPackageJson ({ cwd }) {
	const packageJsonFilepath = path.join(cwd, 'package.json')

	if (!(await fileExists(packageJsonFilepath))) {
		throw new Error(`package.json not found at filepath: ${packageJsonFilepath}`)
	}

	return read(packageJsonFilepath)
}
