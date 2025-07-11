import * as path from 'path'

import { execa } from 'execa'
import findNodeModules from 'find-node-modules'
import { fileExists } from './fs.js'

/**
 * @param {string} command - The command to run from node_modules/.bin.
 * @param {object} options - Options for the command.
 * @param {string} options.cwd - The current working directory.
 * @param {string[]} [options.args=[]] - Arguments to pass to the command.
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
    return execa(commandFilepath, args)
  } catch (error) {
    console.log('error', error)
  }
}
