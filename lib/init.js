import fs from 'bare-fs/promises'
import path from 'bare-path'

const __dirname = path.dirname(new URL(import.meta.url).pathname)
const templateDir = path.resolve(__dirname, 'templates')

/**
 * @param {Object} options
 * @param {String} options.directory
 * @param {String} [options.cwd]
 */
export async function init (options) {
  await fs.mkdir(options.directory, { recursive: true })
  const files = await fs.readdir(templateDir)

  for (const file of files) {
    const source = path.join(templateDir, file)
    const destination = path.join(options.directory, file)
    await fs.copyFile(source, destination)
  }
}
