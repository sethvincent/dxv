import { execa } from 'execa'

import { join } from './utils/dirname.js'

export async function format () {
	const dprintCli = join(import.meta.url, '..', 'node_modules/.bin/dprint')
	const defaultConfigFilepath = join(import.meta.url, '..', 'dprint.json')

	try {
		const { stdout } = await execa(dprintCli, ['fmt', '--config', defaultConfigFilepath])

		if (stdout && stdout.length) {
			console.log(stdout)
		}
	} catch (error) {
		if (error.message.includes('Error formatting')) {
			console.log(error.message)
		} else {
			throw error
		}
	}
}
