import { readFile } from 'fs/promises'

import { ESLint } from 'eslint'
import { join } from './utils/dirname.js'

export async function lint (options) {
	const baseConfig = await readJsonFile(join(import.meta.url, '..', 'eslintrc.json'))

	if (options.ignore) {
		baseConfig.ignorePatterns = [...baseConfig.ignorePatterns, ...options.ignore]
	}

	const eslint = new ESLint({
		fix: options.fix,
		extensions: ['.js', '.ts', '.cjs', '.mjs'],
		resolvePluginsRelativeTo: join(import.meta.url, '..'),
		baseConfig
	})

	const results = await eslint.lintFiles(options.cwd || ['.'])

	if (options.fix) {
		await ESLint.outputFixes(results)
	}

	const formatter = await eslint.loadFormatter('stylish')
	const resultText = formatter.format(results)

	if (resultText.length) {
		console.log(resultText)
	}
}

async function readJsonFile (filepath) {
	const fileContent = await readFile(filepath, 'utf-8')
	return JSON.parse(fileContent)
}
