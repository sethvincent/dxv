/**
 * @param {Object} options
 * @param {String} options.cwd - current working directory
 * @param {String} options.config - path to config file or directory
 * @param {Boolean} options.update - whether to update dependencies
 * @param {{ dependencies: {}, devDependencies: {}, peerDependencies: {}, optionalDependencies: {}}} options.deps - dependencies from package.json
 * @returns {Promise<void>}
 */
export function deps (options: {
  cwd: string
  config: string
  update: boolean
  deps: {
    dependencies: {}
    devDependencies: {}
    peerDependencies: {}
    optionalDependencies: {}
  }
}): Promise<void>
