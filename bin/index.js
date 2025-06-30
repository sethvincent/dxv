#!/usr/bin/env node

import mri from 'mri'
import outdent from 'outdent'
import path from 'path'

import { readPackageJson } from '../lib/utils/read-package-json.js'

import { deps } from '../lib/deps.js'
import { format } from '../lib/format.js'
import { init } from '../lib/init.js'
import { lint } from '../lib/lint.js'
import { type } from '../lib/type.js'

const defaultConfigPathname = new URL('../.config', import.meta.url).pathname

const flags = mri(process.argv.slice(2), {
  alias: {
    help: 'h',
    update: 'u',
    config: 'c',
  },
  default: {
    cwd: process.cwd(),
    config: defaultConfigPathname,
  },
})

const args = flags._
const cmd = args.shift()
let pkg

try {
  pkg = await readPackageJson({ cwd: flags.cwd })
} catch (error) {
  if (error.code !== 'ENOTFOUND') {
    throw error
  }

  console.error(outdent`
      Error: package.json not found in ${flags.cwd}

      Initialize your project with \`npm init\` first.
  `)

  process.exit(1)
}

if (!cmd || cmd === 'help' || flags.help) {
  const message = outdent`
      Usage
      dxv <command>

      Commands
      init     create config files in ./.config by default
     	lint     lint files with eslint
     	fmt      format files with dprint
     	type	   run typescript to check types, emit definitions, etcetera
     	deps	   check versions & missing/unused dependencies
     	help     show this help message

      Options
      --config, -c       specify config file location
      --cwd              set working directory (default: process.cwd())
      --update -c        update outdated dependencies when running \`dxv deps\`

      Examples
      dxv help                               # show this help message
      dxv init                               # create config files in ./.config
      dxv init .                             # create config files in ./
      dxv lint -c .config/eslint.config.js   # lint with specific eslint config
      dxv format -c .config/dprint.json      # format with specific dprint config
      dxv type -c .config/tsconfig.json      # typecheck with specific tsconfig
      dxv deps -c .config/.depcheckrc -u     # check deps, update outdated
```

  console.log(message)
}

const options = { cwd: flags.cwd, config: flags.config }

switch (cmd) {
  case 'init': {
    const directory = args[0] || path.join(options.cwd, '.config')
    await init({ directory, cwd: flags.cwd })
    break
  }

  case 'lint': {
    await lint(options)
    break
  }

  case 'fmt': {
    await format(options)
    break
  }

  case 'type': {
    await type(options)
    break
  }

  case 'deps': {
    await deps({
      ...options,
      update: flags.update,
      deps: {
        dependencies: pkg.dependencies,
        devDependencies: pkg.devDependencies,
        peerDependencies: pkg.peerDependencies,
        optionalDependencies: pkg.optionalDependencies,
      },
    })
    break
  }

  default: {
    if (cmd) {
      console.error(`Error: Unknown command "${cmd}"`)
      process.exit(1)
    }
  }
}
