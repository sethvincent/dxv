import * as fs from 'fs/promises'

/**
 * @param {String} directory
 * @returns {Promise<Boolean>}
 */
export async function directoryExists (directory) {
	try {
		const stat = await fs.stat(directory)
		return stat.isDirectory()
	} catch (error) {
		return false
	}
}

/**
 * @param {String} filepath
 * @returns {Promise<Boolean>}
 */
export async function fileExists (filepath) {
	try {
		await fs.access(filepath)
		return true
	} catch (e) {
		return false
	}
}
