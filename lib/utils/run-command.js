import env from 'bare-env'
import fs from 'bare-fs/promises'
import os from 'bare-os'
import * as path from 'bare-path'

import { spawn } from 'bare-subprocess'
import { dxvDirectory } from './constants.js'
import { fileExists } from './fs.js'
import { findNodeModules } from './node-modules.js'

export async function findCommand (command, pathnames) {
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
 * @param {string[]} args
 * @param {object} [options]
 * @param {string} [options.cwd] directory the command will run in
 * @param {string[]} [options.pathnames] directories to search for the command
 * @returns {Promise<{ stdout: string, stderr: string, exitCode: number }>}
 */
export async function runCommand (
  command,
  args,
  { pathnames = [], cwd, ...spawnOptions } = {},
) {
  const commandPathname = await findCommand(command, pathnames)

  if (!commandPathname) {
    throw new Error(`${command} command not found. is the package installed?`)
  }

  const subprocess = spawn(commandPathname, args, {
    cwd,
    ...spawnOptions,
  })

  const { resolve, reject, promise } = Promise.withResolvers()

  let stdout = ''
  let stderr = ''

  subprocess.stdout.on('data', (chunk) => {
    if (chunk) {
      stdout += chunk.toString()
    }
  })

  subprocess.stderr.on('data', (chunk) => {
    if (chunk) {
      stderr += chunk.toString()
    }
  })

  subprocess.on('exit', (exitCode) => {
    if (exitCode < 0) {
      reject({ stdout, stderr, exitCode })
      return
    }

    resolve({ stdout, stderr, exitCode })
  })

  return promise
}
