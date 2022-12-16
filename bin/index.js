#!/usr/bin/env node

import mri from 'mri'
import outdent from 'outdent'
import * as path from 'path'

import { readPackageJson } from '../lib/utils/read-package-json.js'

import { depsCheck, depsUpdate } from '../lib/deps.js'
import { format } from '../lib/format.js'
import { lint } from '../lib/lint.js'
import { type } from '../lib/type.js'

const flags = /** @type {Flags} */ (mri(process.argv.slice(2), {
	alias: {
		help: 'h',
		cwd: 'c',
		update: 'u',
		exclude: 'e'
	},
	default: {
		cwd: process.cwd()
	}
}))

const args = flags._
const cmd = args.shift()
const pkg = await readPackageJson({ cwd: flags.cwd })

const context = {
	pkg,
	config: pkg?.dxv || {}
}

if (!cmd || cmd === 'help' || flags.help) {
	const message = outdent`
		USAGE
			dxv {command}

		COMMANDS
			lint     lint files
			format   format files
			type	 type check files
			deps	 check versions & missing/unused dependencies
			check    run type, lint, & deps in that order
			help     show this help message

		dxv deps {command}
			deps check         check versions & missing/unused dependencies
			deps update        update dependencies

		OPTIONS
			--cwd, -c          set working directory
			--exclude, -e      exclude files from linting with lint command

		HELP
			dxv help
`

	console.log(message)
}

if (cmd === 'lint') {
	flags.cwd = args[0]
	await lint({ args, flags, context })
	process.exit()
}

if (cmd === 'format') {
	await format({ args, flags, context })
	process.exit()
}

if (cmd === 'type') {
	await type({ args, flags, context })
	process.exit()
}

if (cmd === 'check') {
	await type({ args, flags, context })
	await lint({ args, flags, context })
	await depsCheck({ args, flags, context })
	process.exit()
}

if (cmd === 'deps') {
	const subcmd = args.shift()

	if (subcmd === 'check') {
		await depsCheck({ args, flags, context })
		process.exit()
	}

	if (subcmd === 'update') {
		await depsUpdate({ args, flags, context })
		process.exit()
	}

	await depsCheck({ args, flags, context })
	process.exit()
}
