import { config } from '@workspace/eslint-config/base'

/** @type {import("eslint").Linter.Config} */
export default [
    ...config,
    {
        // Node.js maintenance scripts (registry generator)
        files: ['scripts/**/*.mjs'],
        languageOptions: {
            globals: {
                process: 'readonly',
                console: 'readonly',
            },
        },
    },
]
