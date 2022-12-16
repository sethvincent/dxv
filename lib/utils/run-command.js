import * as path from 'path'

import { execa } from 'execa'
import findNodeModules from 'find-node-modules'
import { fileExists } from './fs.js'

/**
 * @param {String} command
 * @param {Object} options
 * @param {Args} options.args
 * @param {String} options.cwd
 */
export async function runCommand (command, { args = [], cwd }) {
	const nodeModulesDirectories = findNodeModules()

	if (!nodeModulesDirectories || !nodeModulesDirectories.length) {
		throw new Error(`${command} command not found. node_modules directory not available.`)
	}

	const commandFilepath = path.join(cwd, nodeModulesDirectories[0], '/.bin/', command)

	if (!(await fileExists(commandFilepath))) {
		throw new Error(`${command} command not found. is the package installed?`)
	}

	try {
		return execa(commandFilepath, [])
	} catch (error) {
		console.log('error', error)
	}
}
