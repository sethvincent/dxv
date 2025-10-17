/**
 * @param {Object} options
 * @param {String} options.directory
 * @param {String} [options.cwd]
 */
export function init (options: {
  directory: string
  cwd?: string
}): Promise<void>
