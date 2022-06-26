import { execa } from 'execa'
import findNodeModules from 'find-node-modules'
import * as path from 'path'

/**
 * @param {Flags} flags
 */
export async function type (flags) {
	const cwd = flags.cwd || process.cwd()
	const nodeModulesDirectories = findNodeModules()

	if (!nodeModulesDirectories || !nodeModulesDirectories.length) {
		throw new Error('tsc command not found. node_modules directory not available.')
	}

	const tscCli = path.join(cwd, nodeModulesDirectories[0], '/.bin/tsc')
	const configFilepath = path.join(cwd, 'tsconfig.json')

	try {
		const { stdout } = await execa(
			tscCli,
			[
				'--project',
				configFilepath,
				'--pretty'
			]
		)

		if (stdout && stdout.length) {
			console.log(stdout)
		}
	} catch (/** @type {any} */ error) {
		console.log(error?.message)
	}
}
