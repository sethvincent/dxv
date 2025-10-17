import path from 'bare-path'

import { directoryExists } from './fs.js'

/**
 * Find node_modules directories starting from the provided pathnames.
 * @param {string[]} pathnames
 * @returns {Promise<string[]>} pathnames to the node_modules directories.
 */
export async function findNodeModules (pathnames) {
  const results = []

  for (const pathname of pathnames) {
    let current = pathname

    while (true) {
      const candidate = path.join(current, 'node_modules')

      if (await directoryExists(candidate)) {
        results.push(candidate)
        break
      }

      const parent = path.dirname(current)

      if (parent === current) {
        break
      }

      current = parent
    }
  }

  return results
}
