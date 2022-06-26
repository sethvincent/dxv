#!/usr/bin/env node

import mri from 'mri'
import outdent from 'outdent'

import { format } from '../lib/format.js'
import { lint } from '../lib/lint.js'
import { type } from '../lib/type.js'

const flags = /** @type {Flags} */ (mri(process.argv.slice(2), {
	alias: {
		help: 'h',
		cwd: 'c'
	},
	default: {
		cwd: process.cwd()
	}
}))

const args = flags._
const cmd = args.shift()

if (!cmd || cmd === 'help' || flags.help) {
	const message = outdent`
		USAGE
			dxv {command}

		COMMANDS
			lint                lint files
			format   format files
			type		 type check files
			check    run both type and lint in that order
			help     show this help message

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
	await lint(flags)
	process.exit()
}

if (cmd === 'format') {
	await format(flags)
	process.exit()
}

if (cmd === 'type') {
	await type(flags)
	process.exit()
}

if (cmd === 'check') {
	await type(flags)
	await lint(flags)
	process.exit()
}
