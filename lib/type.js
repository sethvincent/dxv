import { execa } from 'execa'
import findNodeModules from 'find-node-modules'
import * as path from 'path'

/**
 * @param {Object} options
 * @param {String} options.cwd
 * @param {String} [options.config]
 */
export async function type (options) {
  const nodeModulesDirectories = findNodeModules()

  if (!nodeModulesDirectories || !nodeModulesDirectories.length) {
    throw new Error('tsc command not found. node_modules directory not available.')
  }

  const tscCli = path.join(options.cwd, nodeModulesDirectories[0], '/.bin/tsc')
  const configFilepath = options.config || path.join(options.cwd, 'tsconfig.json')

  try {
    const { stdout } = await execa(
      tscCli,
      [
        '--project',
        configFilepath,
        '--pretty',
      ],
    )

    if (stdout && stdout.length) {
      console.log(stdout)
    }
  } catch (/** @type {any} */ error) {
    console.log(error?.message)
  }
}
