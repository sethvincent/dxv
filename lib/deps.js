import { cosmiconfig } from 'cosmiconfig'
import dedent from 'dedent'
import depcheck from 'depcheck'
import ncu from 'npm-check-updates'
import ora from 'ora'
import { dirname } from 'path'

/**
 * @param {Object} options
 * @param {String} options.cwd - current working directory
 * @param {String} options.config - path to config file
 * @param {Boolean} options.update - whether to update dependencies
 * @param {{ dependencies: {}, devDependencies: {}, peerDependencies: {}, optionalDependencies: {}}} options.deps - dependencies from package.json
 * @returns {Promise<void>}
 */
export async function deps (options) {
  const configDirectory = options.config.endsWith('.depcheckrc') ? dirname(options.config) : options.config
  const explorer = cosmiconfig('depcheck')
  const { config } = await explorer.search(configDirectory)

  const result = await depcheck(options.cwd, {
    package: {
      dependencies: options.deps.dependencies, /** @satisfies {depcheck.PackageDependencies} */
      devDependencies: options.deps.devDependencies, /** @satisfies {depcheck.PackageDependencies} */
      peerDependencies: options.deps.peerDependencies, /** @satisfies {depcheck.PackageDependencies} */
      optionalDependencies: options.deps.optionalDependencies, /** @satisfies {depcheck.PackageDependencies} */
    },
    ...config,
  })

  if (Object.keys(result.missing).length) {
    console.log(dedent`# Missing dependencies: ${Object.keys(result.missing).length}
            ${JSON.stringify(result.missing, null, 2)}\n
        `)
  }

  if (result.dependencies.length) {
    console.log(dedent`# Unused dependencies: ${result.dependencies.length}
       			${result.dependencies.join('\n')}\n
    		`)
  }

  if (result.devDependencies.length) {
    const filteredDevDeps = result.devDependencies.filter((dep) => {
      return !dep.startsWith('@types/')
    })

    if (filteredDevDeps.length) {
      console.log(dedent`# Unused dev dependencies: ${filteredDevDeps.length}
                ${filteredDevDeps.join('\n')}\n
            `)
    }
  }

  await updates({
    current: Object.assign(
      {},
      options.deps.dependencies || {},
      options.deps.devDependencies || {},
      options.deps.peerDependencies || {},
      options.deps.optionalDependencies || {},
    ),
    cwd: options.cwd,
    upgrade: options.update,
    configFilePath: configDirectory,
  })
}

/**
 * @param {Object} options
 * @param {string} options.cwd
 * @param {boolean} options.upgrade
 * @param {string} options.config
 * @param {Object<string, any>} options.current - current versions of dependencies
 */
async function updates ({ cwd, current, config, upgrade }) {
  const options = {
    packageFile: `${cwd}/package.json`,
    jsonUpgraded: false,
    silent: true,
    upgrade,
    json: false,
    deep: false,
    configFilePath: config,
  }

  const spinner = ora('Checking for outdated dependencies').start()

  /** @ts-ignore: not sure why ncu.run isn't defined but it is an immutable little rock in a shoe, endlessly */
  const result = await ncu.run(options)

  spinner.stop()

  if (Object.keys(result).length > 0) {
    if (!upgrade) {
      console.log(`# Outdated dependencies: ${Object.keys(result).length}`)

      Object.keys(result).forEach((key) => {
        const currentVersion = current[key]
        const latestVersion = result[key]
        console.log(`${key}: ${currentVersion} -> ${latestVersion}`)
      })

      console.log('\nRun `dxv deps --update` to update all outdated dependencies.')
    }
  }
}
