/**
 * @param {string} command - The command to run from node_modules/.bin.
 * @param {object} options - Options for the command.
 * @param {string} options.cwd - The current working directory.
 * @param {string[]} [options.args=[]] - Arguments to pass to the command.
 */
export function runCommand (command: string, { args, cwd }: {
  cwd: string
  args?: string[]
}): Promise<import('execa').Result<{}>>
