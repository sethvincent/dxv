import dedent from 'dedent'
import { check, extra, missing } from 'dependency-check'
import ncu from 'npm-check-updates'
import ora from 'ora'

/**
 * @param {Options} options
 * @returns {Promise<void>}
 */
export async function depsUpdate ({ flags }) {
	const { cwd } = flags
	await installUpdates({ cwd })
}

/**
 * @param {Options} options
 * @returns {Promise<void>}
 */
export async function depsCheck ({ flags, context }) {
	const pkg = context.pkg
	const checkConfig = context.config?.deps?.check
	const ignoreModules = checkConfig?.ignoreModules || []
	const entries = checkConfig?.entries || []

	const result = await check({
		path: flags.cwd,
		entries
	})

	const runtimeOptions = {
		excludeDev: true,
		ignore: ignoreModules
	}

	const runtimeExtra = extra(result.package, result.used, runtimeOptions)
	const runtimeMissing = missing(result.package, result.used, runtimeOptions)
	if (runtimeMissing.length > 0) {
		console.log(dedent`# Missing dependencies: ${runtimeMissing.length}
            ${runtimeMissing.join('\n')}
            \n
        `)
	}

	if (runtimeExtra.length > 0) {
		console.log(dedent`# Unused dependencies: ${runtimeExtra.length}
            ${runtimeExtra.join('\n')}
            \n
        `)
	}

	const devOptions = {
		excludeDev: false,
		ignore: [
			'@types/*',
			...result.used,
			...ignoreModules,
			...runtimeExtra,
			...runtimeMissing
		]
	}

	const devExtra = extra(result.package, result.used, devOptions)
	const devMissing = missing(result.package, result.used, devOptions)

	if (devMissing.length > 0) {
		console.log(dedent`# Missing dev dependencies: ${devMissing.length}
            ${devMissing.join('\n')}
            \n
        `)
	}

	if (devExtra.length > 0) {
		console.log(dedent`# Unused dev dependencies: ${devExtra.length}
            ${devExtra.join('\n')}
            \n
        `)
	}

	await checkUpdates({
		current: Object.assign(
			{},
			pkg.dependencies,
			pkg.devDependencies,
			pkg.peerDependencies
		),
		cwd: flags.cwd,
		upgrade: flags.update
	})
}

/**
 * @param {Object} options
 * @param {string} options.cwd
 * @param {boolean} options.upgrade
 * @param {Object<string, string>} options.current - current versions of dependencies
 */
async function checkUpdates ({ cwd, current }) {
	const options = {
		packageFile: `${cwd}/package.json`,
		jsonUpgraded: false,
		silent: true,
		upgrade: false,
		json: false,
		deep: false
	}

	const spinner = ora('Checking for outdated dependencies').start()
	/** @ts-ignore: not sure why ncu.run isn't defined */
	const result = await ncu.run(options)
	spinner.stop()

	if (Object.keys(result).length > 0) {
		console.log(dedent`# Outdated dependencies: ${Object.keys(result).length}`)
		Object.keys(result).forEach((key) => {
			const currentVersion = current[key]
			const latestVersion = result[key]
			console.log(`${key}: ${currentVersion} -> ${latestVersion}`)
		})

		console.log(dedent`
            \n
            Run \`dxv deps update\` to update all outdated dependencies.
        `)
	}
}

/**
 * @param {Object} options
 * @param {string} options.cwd
 */
async function installUpdates ({ cwd }) {
	const options = {
		packageFile: `${cwd}/package.json`,
		jsonUpgraded: false,
		silent: true,
		upgrade: true,
		json: false,
		deep: false
	}

	const spinner = ora('Updating outdated dependencies').start()

	/** @ts-ignore: not sure why ncu.run isn't defined */
	const result = await ncu.run(options)
	spinner.stop()

	if (Object.keys(result).length > 0) {
		console.log(dedent`# Updated dependencies: ${Object.keys(result).length}`)
		Object.keys(result).forEach((key) => {
			const latestVersion = result[key]
			console.log(`${key}: ${latestVersion}`)
		})

		console.log(dedent`
            \n
            Run \`npm install\` to install the updated dependencies.
        `)
	}
}
