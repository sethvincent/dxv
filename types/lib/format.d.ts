/**
 * @param {Object} [options]
 * @param {String} [options.cwd]
 * @param {Object<string, any>} [options.config]
 */
export function format (options?: {
  cwd?: string
  config?: {
    [x: string]: any
  }
}): Promise<void>
