import { readFile } from 'fs/promises'

import { ESLint } from 'eslint'
import { join } from './utils/dirname.js'

/**
 * @param {Flags} flags
 */
export async function lint (flags) {
	const baseConfig = await readJsonFile(join(import.meta.url, '..', 'eslintrc.json'))

	if (flags.exclude) {
		const exclude = typeof flags.exclude === 'string' ? [flags.exclude] : flags.exclude
		baseConfig.ignorePatterns = [...baseConfig.ignorePatterns, ...exclude]
	}

	const eslint = new ESLint({
		fix: true,
		extensions: ['.js', '.ts', '.cjs', '.mjs'],
		resolvePluginsRelativeTo: join(import.meta.url, '..'),
		baseConfig
	})

	const results = await eslint.lintFiles(flags.cwd || ['.'])
	await ESLint.outputFixes(results)

	const formatter = await eslint.loadFormatter('stylish')
	const resultText = await formatter.format(results)

	if (resultText.length) {
		console.log(resultText)
	}
}

/**
 * @param {string} filepath
 */
async function readJsonFile (filepath) {
	const fileContent = await readFile(filepath, 'utf-8')
	return JSON.parse(fileContent)
}
