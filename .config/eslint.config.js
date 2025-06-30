import { defineConfig } from "eslint/config";
import pluginJs from '@eslint/js'
import globals from 'globals'
import { fileURLToPath } from "node:url";
import { includeIgnoreFile } from "@eslint/compat";

const gitignorePath = fileURLToPath(new URL("../.gitignore", import.meta.url));

// See more configuration options:
// https://eslint.org/docs/latest/use/configure/configuration-files

/** @type {import('eslint').Linter.Config[]} */
export default defineConfig([
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node
            }
        }
    },
    pluginJs.configs.recommended,
	includeIgnoreFile(gitignorePath),
	{
        ignores: ['types'],
        rules: {
          'no-fallthrough': 'off',
          'no-unused-vars': 'off',
          'no-unused-private-class-members': 'off',
        }
    },
]);
