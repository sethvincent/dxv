import os from 'bare-os'
import * as path from 'bare-path'
import fs from 'bare-fs/promises'
import env from 'bare-env'

import { spawn } from 'bare-subprocess'
import { fileExists } from './fs.js'
import { findNodeModules } from './node-modules.js'
import { dxvDirectory } from './constants.js'

export async function findCommand (command, pathnames) {
  console.log('findCommand', command, pathnames)
  const directories = await findNodeModules(pathnames)

  for (const directory of directories) {
    const pathname = path.join(path.join(directory, '.bin'), command)

    if (await fileExists(pathname)) {
      return pathname
    }
  }

  return null
}

/**
 * @param {string} command
 * @param {object} [options]
 * @param {string} [options.cwd] directory the command will run in
 * @param {string[]} [options.pathnames] directories to search for the command
 * @returns {Promise<string>}
 */
export async function runCommand(
  command,
  args,
  { pathnames = [], cwd } = {}
) {
  console.log('command', command)
  const commandPathname = await findCommand(command, pathnames)
console.log('commandPathname', commandPathname)
  const subprocess = spawn(commandPathname, args, {
    cwd,
    stdio: 'pipe'
  })

  let stdout = ''
  let stderr = ''

  const { resolve, reject, promise } = Promise.withResolvers()

  for await (const chunk of subprocess.stdout) {
    stdout += chunk.toString()
  }

  for await (const chunk of subprocess.stderr) {
    stderr += chunk.toString()
  }

  subprocess.on('exit', async (code) => {
    if (!code && !stderr.length) {
      resolve(stdout)
      return
    }

    if (stderr.length || stdout.length) {
      console.error(stderr, stdout)
      reject(new Error(`Failed to find command: ${command}`, {
        cause: new Error(stderr || stdout)
      }))
    }
  })

  return promise
  // if (result.error) {
  //   if (result.error.code === 'ENOENT') {
  //     throw new Error(`${command} command not found. is the package installed?`)
  //   }

  //   throw result.error
  // }


  // if (result.status !== 0) {
  //   throw new Error(`${command} exited with code ${result.status}`)
  // }

  // return { stdout, stderr }

}
