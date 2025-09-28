# @dxv/cli

A convenient wrapper around:

- [oxlint](https://oxc-project.github.io/docs/guide/oxlint/intro)
- [dprint](https://dprint.dev/)
- [typescript's tsc command](https://www.typescriptlang.org/).
- Dependency checks (missing, unused, and outdated packages)

## Voltron, Frankenstein's monster, etcetera

Maintaining JavaScript projects is... a lot. I made `dxv` to make things a little easier.

I'm solving my own problems here, but if this is useful to you that's cool!

## Install

```shell
npm install -g bare
npm i -D @dxv/cli
```

The CLI executes under the [Bare](https://github.com/holepunchto/bare) runtime. Ensure the `bare` binary is available on your PATH before running any `dxv` commands.

## Usage

```
Usage
dxv <command>

Commands
init     create config files in ./.config by default
lint     lint files with oxlint
fmt      format files with dprint
type	   run typescript to check types, emit definitions, etcetera
deps	   audit dependencies for missing/unused/outdated packages
help     show this help message

Options
--config, -c       specify config file location
--cwd              set working directory (default: os.cwd())
--update -c        update outdated dependencies when running `dxv deps`

Examples
dxv help                  # show this help message
dxv init                  # create config files in ./.config
dxv init .                # create config files in ./
dxv lint                  # lint with specific oxlint config
dxv format                # format with specific dprint config
dxv type                  # typecheck with specific tsconfig
dxv deps --update         # check dependencies and update
```

## Configuration

We directly use the config files from each project:

- [dprint](https://dprint.dev/config/)
- [Oxlint](https://oxc-project.github.io/docs/guide/oxlint/intro)
- [TypeScript](https://www.typescriptlang.org/tsconfig)
- `npm outdated` via a lightweight wrapper
- `package-lock.json` metadata (if present) to distinguish direct vs transitive installs during `dxv deps`

### Use a `.config/` directory

By default dexv puts all those annoying little dotfiles out of the way in a `./.config` directory.

You can specify an alternate location of config files:

```
dxv init .somewhere
dxv lint --config .somewhere/oxlintrc.json
dxv fmt  --config .somewhere/dprint.json
dxv type --config .somewhere/tsconfig.json
dxv deps --config .somewhere/dependencies.json
```

By default `dxv init` creates all the config files in `.config/`.

If you have other config files that could live in there, go for it. Keep things tidy. It's nice. Treat yourself.

Dependency checks read config from `.config/dependencies.json`, a JSON file that controls ignore lists and whether missing/unused/outdated checks run. It also supports a `projectDirectories` array when you need dxv to scan additional source roots (e.g. tests).

### npm scripts

Recommended npm scripts:

```
"fmt": "dxv fmt -c .config/dprint.jsonc",
"lint": "dxv lint -c .config/oxlintrc.json",
"deps": "dxv deps -c .config/dependencies.json",
"type": "dxv type -c .config/tsconfig.json"
```

### Maintainer scripts

```
npm run integration   # copy the tmp fixture into a scratch workspace and run fmt/lint/type/deps
```

The fixture intentionally lacks installed dependencies, so missing/unused warnings in this run are expected—it’s a smoke test that dxv reports issues rather than a failure.

## Types and the types that type real hard

My usage of this tool is focused on writing types in jsdoc/tsdoc comments rather than using typescript itself. Because the tsconfig.json file is fully configurable per-project this shouldn't be a big deal, but there may be decisions at some point that make using type comments easier and using typescript harder. 🤷‍♂️

## License

[MIT](LICENSE.md)
