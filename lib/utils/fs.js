import * as fs from 'bare-fs/promises'

/**
 * @param {String} directory
 * @returns {Promise<Boolean>}
 */
export async function directoryExists (directory) {
  try {
    const stat = await fs.stat(directory)
    return stat.isDirectory()
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return false
    }
    throw error
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
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return false
    }
    throw error
  }
}

/**
 * @param {string} filepath
 * @returns {Promise<string|null>}
 */
export async function readFile (filepath) {
  try {
    return await fs.readFile(filepath, 'utf8')
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return null
    }
    throw error
  }
}
