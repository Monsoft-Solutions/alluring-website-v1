import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './'),
            // Resolve workspace source directly so tests don't need a dist build
            '@workspace/shared/cache': path.resolve(
                __dirname,
                '../../packages/shared/src/cache'
            ),
            '@workspace/shared': path.resolve(
                __dirname,
                '../../packages/shared/src'
            ),
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        include: ['__tests__/**/*.test.ts', '__tests__/**/*.test.tsx'],
    },
})
