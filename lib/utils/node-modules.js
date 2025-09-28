import os from 'bare-os'
import path from 'bare-path'

import { directoryExists } from './fs.js'

/**
 * Find the nearest node_modules directory starting from the provided cwd.
 * @param {{ cwd?: string }} [options]
 * @returns {Promise<string|null>} Absolute path to the node_modules directory or null.
 */
export async function findNodeModules (options = {}) {
  let current = path.resolve(options.cwd || os.cwd())

  while (true) {
    const candidate = path.join(current, 'node_modules')

    if (await directoryExists(candidate)) {
      return candidate
    }

    const parent = path.dirname(current)

    if (parent === current) {
      return null
    }

    current = parent
  }
}
