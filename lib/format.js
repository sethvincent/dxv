import os from 'bare-os'
import { runCommand } from './utils/run-command.js'

/**
 * @param {Object} [options]
 * @param {String} [options.cwd]
 * @param {String} [options.config]
 */
export async function format (options = {}) {
  const cwd = options.cwd || os.cwd()

  try {
    const args = ['fmt']

    if (options.config) {
      args.push('--config', options.config)
    }

    const { stdout } = await runCommand('dprint', { args, cwd })

    if (stdout && stdout.length) {
      console.log(stdout)
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Error formatting')) {
      console.log(error.message)
    } else {
      throw error
    }
  }
}
