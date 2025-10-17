export function findCommand (command: any, pathnames: any): Promise<any>
/**
 * @param {string} command
 * @param {string[]} args
 * @param {object} [options]
 * @param {string} [options.cwd] directory the command will run in
 * @param {string[]} [options.pathnames] directories to search for the command
 * @returns {Promise<{ stdout: string, stderr: string, exitCode: number }>}
 */
export function runCommand (command: string, args: string[], { pathnames, cwd, ...spawnOptions }?: {
  cwd?: string
  pathnames?: string[]
}): Promise<{
  stdout: string
  stderr: string
  exitCode: number
}>
