import os from 'bare-os'
import * as path from 'bare-path'
import { runCommand } from './utils/run-command.js'
import { dxvDirectory } from './utils/constants.js'

/**
 * @param {Object} options
 * @param {String} options.cwd
 * @param {String} [options.config]
 */
export async function type (options) {
  const cwd = options.cwd || os.cwd()
  const configFilepath = options.config || path.join(cwd, 'tsconfig.json')

  try {
    const { stdout, stderr } = await runCommand(
      'tsc',
      ['--project', configFilepath, '--pretty'],
      {
        cwd,
        pathnames: [cwd, dxvDirectory]
      }
    )

    if (stdout && stdout.length) {
      console.log(stdout)
    }

    if (stderr && stderr.length) {
      console.error(stderr)
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'cause' in error && error.cause) {
      const output = error.cause.message
      if (output) {
        console.log(output)
        return
      }
    }

    if (error && typeof error === 'object' && 'message' in error) {
      console.error(error.message)
      return
    }

    throw error
  }
}
