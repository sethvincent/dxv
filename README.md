# @dxv/cli

A convenient wrapper around:

- [eslint](https://eslint.org/)
- [dprint](https://dprint.dev/)
- [typescript's tsc command](https://www.typescriptlang.org/).
- [depcheck](https://npmjs.com/depcheck)
- [npm-check-updates](https://npmjs.com/npm-check-updates)

## Voltron, Frankenstein's monster, etcetera

Maintaining JavaScript projects is... a lot. I made `dxv` to make things a little easier.

I'm solving my own problems here, but if this is useful to you that's cool!

## Install

```shell
npm i -D @dxv/cli
```

## Usage

```
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
--update -c        update outdated dependencies when running `dxv deps`

Examples
dxv help                               # show this help message
dxv init                               # create config files in ./.config
dxv init .                             # create config files in ./
dxv lint -c .config/eslint.config.js   # lint with specific eslint config
dxv format -c .config/dprint.json      # format with specific dprint config
dxv type -c .config/tsconfig.json      # typecheck with specific tsconfig
dxv deps -c .config/.depcheckrc -u     # check deps, update outdated
```

## Configuration

We directly use the config files from each project:

- [dprint](https://dprint.dev/config/)
- [ESLint](https://eslint.org/docs/latest/use/configure/configuration-files)
- [TypeScript](https://www.typescriptlang.org/tsconfig)
- [depcheck](https://github.com/depcheck/depcheck)
- [npm-check-updates](https://github.com/raineorshine/npm-check-updates)

### Use a `.config/` directory

Keep all those annoying little dotfiles out of the way. Specify the location of config files:

```
dxv lint --config .config/eslint.config.js
dxv fmt  --config .config/dprint.json
dxv type --config .config/tsconfig.json
dxv deps --config .config/.depcheckrc
```

## Types and the types that type real hard

My usage of this tool is focused on writing types in jsdoc/tsdoc comments rather than using typescript itself. Because the tsconfig.json file is fully configurable per-project this shouldn't be a big deal, but there may be decisions at some point that make using type comments easier and using typescript harder. 🤷‍♂️

## License

[MIT](LICENSE.md)
