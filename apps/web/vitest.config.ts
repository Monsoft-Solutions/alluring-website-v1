import path from 'node:path'

import { defineConfig } from 'vitest/config'

export default defineConfig({
    // tsconfig keeps JSX for Next (`jsx: preserve`); tests that render a
    // component on the server need it compiled.
    oxc: { jsx: { runtime: 'automatic' } },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './'),
        },
    },
    test: {
        environment: 'node',
        include: ['__tests__/**/*.test.ts'],
    },
})
