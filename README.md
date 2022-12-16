# @dxv/cli

A simple wrapper around [eslint](https://eslint.org/), [dprint](https://dprint.dev/), and [typescript's tsc command](https://www.typescriptlang.org/).

Please consider sponsoring these projects:

- [eslint](https://github.com/sponsors/eslint)
- [dprint](https://github.com/sponsors/dprint)

## 🚧 Work in progress

There may still be inconsistencies between eslint and dprint rules that will be sorted out with time.

In addition, this cli tool does not yet recognize project-specific eslint and dprint config files, though that will be added eventually.

This project may not solve your needs directly, but I think this kind of wrapper is a useful way to have consistency between a team's or individual's projects in a way that allows team-specific and project-specific configuration. The config chosen in this repo might not work for you, so I'm open to exposing all the configuration options available. Pull requests welcome! Or fork it, rename it, and make it your own!

## Install

```shell
npm i -D @dxv/cli
```

## Usage

```
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
```

### Type checking

The type checking functionality is somewhat limited. For now it reads a tsconfig.json file in the current working directory. This can be overwritten with a `--cwd desired/path` flag.

Create a tsconfig.json file before running the `dxv type` or `dxv check` commands, for example using `tsc --init`.

My usage of this tool is focused on writing types in jsdoc/tsdoc comments rather than using typescript itself. Because the tsconfig.json file is fully configurable per-project this shouldn't be a big deal, but there may be decisions at some point that make using type comments easier and using typescript harder. 🤷‍♂️

## License

[MIT](LICENSE.md)
