#!/usr/bin/env node

import mri from 'mri'
import outdent from 'outdent'

import { lint } from '../lib/lint.js'
import { format } from '../lib/format.js'

const flags = mri(process.argv.slice(2), {
	alias: {
		help: 'h'
	},
	default: {

	}
})

const args = flags._
const cmd = args.shift()

if (!cmd || cmd === 'help' || flags.help) {
	const message = outdent`
		USAGE
			dxv {command}

		COMMANDS
			lint     lint files
			format   format files
			help     show this help message

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

// const subcmd = args.shift()
