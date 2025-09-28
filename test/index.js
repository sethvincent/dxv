#!/usr/bin/env bare

import fs from 'bare-fs/promises'
import * as path from 'bare-path'
import { spawn } from 'bare-subprocess'
import test from 'brittle'

const cwd = path.resolve(new URL('..', import.meta.url).pathname)
const cmd = path.join(cwd, 'bin', 'index.js')

const fixturesDirectory = path.join(cwd, 'test', 'fixtures')
const fixtureProjects = await fs.readdir(fixturesDirectory)
const fixtures = fixtureProjects.map((dir) => {
  return path.join(fixturesDirectory, dir)
})

test('integration test', async (t) => {
  for (const fixture of fixtures) {
    t.teardown(async () => {
      await fs.rm(path.join(fixture, '.config'), { recursive: true, force: true })
      await fs.rm(path.join(fixture, 'node_modules'), { recursive: true, force: true })
    })

    await runFixture(t, fixture)
  }
})

async function runFixture (t, fixture) {
  try {
    const configDir = path.join(fixture, '.config')

    await runDxv(['init', '--cwd', fixture])
    await runDxv(['fmt', '--cwd', fixture, '-c', path.join(configDir, 'dprint.jsonc')])
    await runDxv(['lint', '--cwd', fixture, '-c', path.join(configDir, 'oxlintrc.json')])
    await runDxv(['type', '--cwd', fixture, '-c', path.join(configDir, 'tsconfig.json')])
    await runDxv(['deps', '--cwd', fixture, '-c', path.join(configDir, 'dependencies.json')])
  } catch (err) {
    t.fail(err.message)
    console.error(err)
  } finally {
    t.pass()
  }
}

async function runDxv (args) {
  const { resolve, reject, promise } = Promise.withResolvers()

  const subprocess = spawn(cmd, args, {
    cwd,
    stdio: 'pipe',
  })

  // let output = ''
  // let error = ''

  // for await (const chunk of subprocess.stdout) {
  //   output += chunk.toString()
  // }

  // for await (const chunk of subprocess.stderr) {
  //   error += chunk.toString()
  // }

  // console.log('stdout', output)
  // console.log('stderr', error)

  subprocess.on('exit', (code) => {
    if (code === 0) {
      resolve()
    } else {
      reject(new Error(`${cmd} exited with code ${code}`))
    }
  })
}
