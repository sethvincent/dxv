import os from 'bare-os'
import * as path from 'bare-path'

import { spawnSync } from 'bare-subprocess'
import { fileExists } from './fs.js'
import { findNodeModules } from './node-modules.js'

/**
 * @param {string} command - The command to run from node_modules/.bin.
 * @param {object} options - Options for the command.
 * @param {string} options.cwd - The current working directory where the command should execute.
 * @param {string[]} [options.args=[]] - Arguments to pass to the command.
 * @returns {Promise<{ stdout: string, stderr: string }>}
 */
export async function runCommand (command, { args = [], cwd }) {
  const searchRoot = cwd || os.cwd()
  const nodeModulesDirectory = await findNodeModules({ cwd: searchRoot })

  if (!nodeModulesDirectory) {
    throw new Error(`${command} command not found. node_modules directory not available.`)
  }

  const commandFilepath = path.join(nodeModulesDirectory, '.bin', command)

  if (!(await fileExists(commandFilepath))) {
    throw new Error(`${command} command not found. is the package installed?`)
  }

  const result = spawnSync(commandFilepath, args, { cwd: searchRoot })

  const stdout = result.stdout ? result.stdout.toString() : ''
  const stderr = result.stderr ? result.stderr.toString() : ''

  if (result.status !== 0) {
    const commandError = Object.assign(new Error(`${command} exited with code ${result.status}`), {
      code: String(result.status),
      stdout,
      stderr,
    })

    throw commandError
  }

  return { stdout, stderr }
}
