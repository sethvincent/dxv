import { execa } from 'execa'
import findNodeModules from 'find-node-modules'
import * as path from 'path'

import * as dirname from './utils/dirname.js'

/**
 * @param {Flags} flags
 */
export async function format (flags) {
	const { cwd } = flags

	const nodeModulesDirectories = findNodeModules()

	if (!nodeModulesDirectories || !nodeModulesDirectories.length) {
		throw new Error('dprint command not found. node_modules directory not available.')
	}

	const dprintCli = path.join(cwd, nodeModulesDirectories[0], '/.bin/dprint')
	const defaultConfigFilepath = dirname.join(import.meta.url, '..', 'dprint.json')

	try {
		const { stdout } = await execa(dprintCli, ['fmt', '--config', defaultConfigFilepath])

		if (stdout && stdout.length) {
			console.log(stdout)
		}
	} catch (/** @type {any} */ error) {
		if (error.message.includes('Error formatting')) {
			console.log(error.message)
		} else {
			throw error
		}
	}
}
