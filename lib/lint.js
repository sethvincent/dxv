import { ESLint } from 'eslint'

/**
 * @param {Object} options
 * @param {String} options.cwd
 * @param {String} options.config
 */
export async function lint (options) {
    /** @type {import('eslint').ESLint.Options}*/
    const eslintOptions = {
        cwd: options.cwd,
        fix: true,
    }

    if (options.config) {
        eslintOptions.overrideConfigFile = options.config
    }

    const eslint = new ESLint(eslintOptions)
    const results = await eslint.lintFiles(options.cwd || ['.'])
    await ESLint.outputFixes(results)
    const formatter = await eslint.loadFormatter('stylish')
    const resultText = await formatter.format(results)

    if (resultText.length) {
        console.log(resultText)
    }
}
