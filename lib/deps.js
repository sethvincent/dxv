import fs from 'bare-fs/promises'
import path from 'bare-path'
import { spawn, spawnSync } from 'bare-subprocess'
import { dedent as indent } from 'indentation'

import { directoryExists, fileExists, readFile } from './utils/fs.js'

/**
 * @param {Object} options
 * @param {String} options.cwd - current working directory
 * @param {String} options.config - path to config file or directory
 * @param {Boolean} options.update - whether to update dependencies
 * @param {{ dependencies: {}, devDependencies: {}, peerDependencies: {}, optionalDependencies: {}}} options.deps - dependencies from package.json
 * @returns {Promise<void>}
 */
export async function deps (options) {
  const config = await loadConfig({ cwd: options.cwd, config: options.config })
  const declared = collectDeclared(options.deps)
  const lockInfo = await loadLockfile({ cwd: options.cwd })
  const ignoreMatchers = buildIgnoreMatchers(config.ignoreMatches || [])
  const projectDirectories = Array.isArray(config.projectDirectories) && config.projectDirectories.length
    ? config.projectDirectories
    : [...DEFAULT_PROJECT_DIRECTORIES]

  if (!config.skipMissing) {
    const missing = await findMissing({ cwd: options.cwd, declared, ignoreMatchers, lockInfo })

    if (missing.size > 0) {
      console.log(indent`# Missing dependencies: ${missing.size}
              ${JSON.stringify(Object.fromEntries(missing), null, 2)}\n
          `)
    }
  }

  if (!config.skipUnused) {
    const unused = await findUnused({ cwd: options.cwd, declared, ignoreMatchers, projectDirectories })

    if (unused.length > 0) {
      console.log(indent`# Unused dependencies: ${unused.length}
              ${unused.join('\n')}\n
          `)
    }
  }

  if (config.skipOutdated) {
    return
  }

  const outdated = await findOutdated({ cwd: options.cwd, ignoreMatchers })

  if (Object.keys(outdated).length === 0) {
    return
  }

  console.log(`# Outdated dependencies: ${Object.keys(outdated).length}`)

  for (const [name, info] of Object.entries(outdated)) {
    console.log(`${name}: ${info.current} -> ${info.latest}`)
  }

  if (!options.update) {
    console.log('\nRun `dxv deps --update` to install the latest versions.')
    return
  }

  await installUpdates({
    cwd: options.cwd,
    outdated,
    declared,
  })
}

const DEFAULT_CONFIG_FILES = ['dependencies.json', 'deps.config.json', '.depcheckrc', '.depcheckrc.json']
const DEFAULT_PROJECT_DIRECTORIES = ['bin', 'lib', 'types', 'test', 'tests']

/**
 * @param {{ cwd: string, config: string }} options
 */
async function loadConfig ({ cwd, config }) {
  const defaults = {
    ignoreMatches: ['oxlint'],
    skipMissing: false,
    skipUnused: false,
    skipOutdated: false,
    projectDirectories: [...DEFAULT_PROJECT_DIRECTORIES],
  }

  if (!config) {
    return defaults
  }

  const resolved = await resolveConfigPath({ cwd, config })

  if (!resolved) {
    return defaults
  }

  try {
    const contents = await fs.readFile(resolved, 'utf8')
    const parsed = JSON.parse(contents)
    const merged = {
      ...defaults,
      ...parsed,
    }

    if (!Array.isArray(merged.projectDirectories) || merged.projectDirectories.length === 0) {
      merged.projectDirectories = [...DEFAULT_PROJECT_DIRECTORIES]
    }

    return merged
  } catch (error) {
    console.warn(`Unable to read dependency config at ${resolved}. Using defaults.`)
    return defaults
  }
}

/**
 * @param {{ cwd: string, config: string }} options
 */
async function resolveConfigPath ({ cwd, config }) {
  const configPath = path.isAbsolute(config) ? config : path.join(cwd, config)

  try {
    const stat = await fs.stat(configPath)

    if (stat.isDirectory()) {
      for (const filename of DEFAULT_CONFIG_FILES) {
        const candidate = path.join(configPath, filename)

        if (await fileExists(candidate)) {
          return candidate
        }
      }

      return null
    }

    return configPath
  } catch (error) {
    return null
  }
}

/**
 * @param {{ dependencies?: Record<string, string>, devDependencies?: Record<string, string>, peerDependencies?: Record<string, string>, optionalDependencies?: Record<string, string> }} deps
 */
function collectDeclared (deps) {
  const declared = new Map()

  if (!deps) {
    return declared
  }

  const sections = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']

  for (const key of sections) {
    const section = deps[key]

    if (!section) {
      continue
    }

    for (const [name, version] of Object.entries(section)) {
      declared.set(name, { version, section: key })
    }
  }

  return declared
}

function buildIgnoreMatchers (patterns) {
  return patterns.map((pattern) => {
    const regex = new RegExp(`^${pattern.split('*').map(escapeRegex).join('.*')}$`)
    return (value) => regex.test(value)
  })
}

function escapeRegex (value) {
  return value.replace(/[.+?^${}()|[\]\\]/g, '\\$&')
}

function shouldIgnore (matchers, value) {
  return matchers.some((matches) => matches(value))
}

async function findMissing ({ cwd, declared, ignoreMatchers, lockInfo }) {
  const results = new Map()
  const nodeModulesDir = path.join(cwd, 'node_modules')
  const hasNodeModules = await directoryExists(nodeModulesDir)

  for (const [name, meta] of declared.entries()) {
    if (shouldIgnore(ignoreMatchers, name)) {
      continue
    }

    if (!hasNodeModules) {
      results.set(name, meta.version)
      continue
    }

    const installed = lockInfo ? isDeclaredInLockfile({ name, lockInfo }) : await packageExists(nodeModulesDir, name)

    if (!installed) {
      results.set(name, meta.version)
    }
  }

  return results
}

async function loadLockfile ({ cwd }) {
  const lockPaths = [
    path.join(cwd, 'package-lock.json'),
    path.join(cwd, 'node_modules', '.package-lock.json'),
  ]

  for (const filepath of lockPaths) {
    const contents = await readFile(filepath)

    if (!contents) {
      continue
    }

    try {
      const parsed = JSON.parse(contents)
      const packages = parsed?.packages

      if (packages && typeof packages === 'object') {
        return { packages }
      }
    } catch (error) {
      console.warn(
        `Unable to parse lockfile at ${filepath}: ${error instanceof Error ? error.message : 'unknown error'}`,
      )
    }
  }

  return null
}

function isDeclaredInLockfile ({ name, lockInfo }) {
  const entry = lockInfo.packages[`node_modules/${name}`]
  return Boolean(entry)
}

async function packageExists (nodeModulesDir, name) {
  const parts = name.split('/')
  const packagePath = path.join(nodeModulesDir, ...parts)
  return directoryExists(packagePath)
}

async function findUnused ({ cwd, declared, ignoreMatchers, projectDirectories }) {
  if (declared.size === 0) {
    return []
  }

  const projectFiles = await loadProjectFiles({ cwd, projectDirectories })
  const unused = []

  for (const [name] of declared) {
    if (shouldIgnore(ignoreMatchers, name)) {
      continue
    }

    if (!isDependencyReferenced(name, projectFiles)) {
      unused.push(name)
    }
  }

  return unused
}

const TEXT_EXTENSIONS = new Set(['.js', '.cjs', '.mjs', '.ts', '.cts', '.mts', '.json', '.md'])

async function loadProjectFiles ({ cwd, projectDirectories }) {
  const files = []

  for (const directory of projectDirectories) {
    const absolute = path.join(cwd, directory)

    if (!(await directoryExists(absolute))) {
      continue
    }

    await collectFiles(absolute, files)
  }

  return files
}

async function collectFiles (directory, files) {
  const entries = await fs.readdir(directory)

  for (const name of entries) {
    const filepath = path.join(directory, name)
    let stats

    try {
      stats = await fs.stat(filepath)
    } catch (error) {
      console.warn(`Unable to stat ${filepath}: ${error instanceof Error ? error.message : error}`)
      continue
    }

    if (stats.isDirectory()) {
      await collectFiles(filepath, files)
      continue
    }

    const extension = path.extname(name)

    if (!TEXT_EXTENSIONS.has(extension)) {
      continue
    }

    try {
      const content = await fs.readFile(filepath, 'utf8')
      files.push(content)
    } catch (error) {
      console.warn(`Unable to read ${filepath}: ${error instanceof Error ? error.message : error}`)
    }
  }
}

function isDependencyReferenced (name, files) {
  return files.some((content) =>
    content.includes(`'${name}'`) || content.includes(`"${name}"`) || content.includes(name)
  )
}

async function findOutdated ({ cwd, ignoreMatchers }) {
  const result = spawnSync('npm', ['outdated', '--json'], { cwd })
  const stdout = result.stdout ? result.stdout.toString() : ''

  if (!stdout) {
    const stderr = result.stderr ? result.stderr.toString() : ''

    if (stderr.includes('ENOTFOUND') || stderr.includes('network')) {
      console.warn(`npm outdated failed: ${stderr.trim()}`)
      return {}
    }

    if (result.status === 0) {
      return {}
    }

    throw new Error(stderr || 'npm outdated failed without output')
  }

  return parseOutdated(stdout, ignoreMatchers)
}

function filterIgnored (outdated, ignoreMatchers) {
  if (!outdated) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(outdated).filter(([name]) => !shouldIgnore(ignoreMatchers, name)),
  )
}

function parseOutdated (stdout, ignoreMatchers) {
  try {
    const parsed = JSON.parse(stdout)

    if (parsed && typeof parsed === 'object' && 'error' in parsed) {
      const summary = parsed.error?.summary || parsed.error?.message || 'Unknown npm error'
      console.warn(`npm outdated failed: ${summary}`)
      return {}
    }

    return filterIgnored(parsed, ignoreMatchers)
  } catch (parseError) {
    console.warn('Unable to parse npm outdated output.')
    return {}
  }
}

async function installUpdates ({ cwd, outdated, declared }) {
  for (const name of Object.keys(outdated)) {
    const meta = declared.get(name)
    const section = meta?.section
    const args = ['install', `${name}@latest`]

    if (section === 'devDependencies') {
      args.push('--save-dev')
    } else if (section === 'optionalDependencies') {
      args.push('--save-optional')
    } else if (section === 'peerDependencies') {
      args.push('--save-peer')
    }

    console.log(`Installing latest version of ${name}...`)

    try {
      await runNpmCommand(args, { cwd })
    } catch (error) {
      console.warn(`Failed to update ${name}. ${error instanceof Error ? error.message : error}`)
    }
  }
}

function runNpmCommand (args, { cwd }) {
  return new Promise((resolve, reject) => {
    const child = spawn('npm', args, {
      cwd,
      stdio: 'inherit',
    })

    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`npm exited with code ${code}`))
      }
    })

    child.on('error', reject)
  })
}
