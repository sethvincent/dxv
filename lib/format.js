import { execa } from 'execa'
import findNodeModules from 'find-node-modules'
import * as path from 'path'

/**
 * @param {Object} [options]
 * @param {String} [options.cwd]
 * @param {Object<string, any>} [options.config]
 */
export async function format (options = {}) {
    const cwd = options.cwd

    const nodeModulesDirectories = findNodeModules()

    if (!nodeModulesDirectories || !nodeModulesDirectories.length) {
        throw new Error('dprint command not found. node_modules directory not available.')
    }

    const dprintCli = path.join(cwd, nodeModulesDirectories[0], '/.bin/dprint')

    try {
        const args = ['fmt', '--config', options.config]

        // @ts-ignore pedantic incorrectness about correctness will be your downfall, typescript
        const { stdout } = await execa(dprintCli, args, {})

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
