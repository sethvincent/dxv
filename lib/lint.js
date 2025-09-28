import os from 'bare-os'
import path from 'bare-path'

import { directoryExists, fileExists } from './utils/fs.js'
import { runCommand } from './utils/run-command.js'

/**
 * @param {Object} options
 * @param {String} options.cwd
 * @param {String} options.config
 */
export async function lint (options) {
  const cwd = options.cwd || os.cwd()
  const args = []

  if (options.config) {
    let resolvedConfig = path.resolve(cwd, options.config)

    if (await directoryExists(resolvedConfig)) {
      const candidate = path.join(resolvedConfig, 'oxlintrc.json')
      if (await fileExists(candidate)) {
        resolvedConfig = candidate
      }
    }

    if (await fileExists(resolvedConfig)) {
      args.push('--config', resolvedConfig)
    }

    args.push('--type-aware')
  }

  const gitignorePath = path.resolve(cwd, '.gitignore')
  if (await fileExists(gitignorePath)) {
    args.push('--ignore-path', gitignorePath)
  }

  args.push(cwd)

  const { stdout, stderr } = await runCommand('oxlint', { args, cwd })

  if (stdout?.length) {
    console.log(stdout)
  }

  if (stderr?.length) {
    console.error(stderr)
  }
}
