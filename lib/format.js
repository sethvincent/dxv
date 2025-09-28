import os from 'bare-os'
import path from 'bare-path'

import { directoryExists, fileExists } from './utils/fs.js'
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
      let resolvedConfig = path.resolve(cwd, options.config)

      if (await directoryExists(resolvedConfig)) {
        const candidate = path.join(resolvedConfig, 'dprint.jsonc')
        if (await fileExists(candidate)) {
          resolvedConfig = candidate
        }
      }

      if (await fileExists(resolvedConfig)) {
        args.push('--config', resolvedConfig)
      }
    } else {
      const defaultConfig = path.resolve(cwd, '.config', 'dprint.json')
      if (await fileExists(defaultConfig)) {
        args.push('--config', defaultConfig)
      }
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
