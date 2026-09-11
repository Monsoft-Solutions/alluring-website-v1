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
            '@workspace/shared/seo': path.resolve(
                __dirname,
                '../../packages/shared/src/seo'
            ),
            '@workspace/shared/content': path.resolve(
                __dirname,
                '../../packages/shared/src/content'
            ),
            '@workspace/shared': path.resolve(
                __dirname,
                '../../packages/shared/src'
            ),
            '@workspace/ai': path.resolve(__dirname, '../../packages/ai/src'),
            // The AI SDK is a dependency of packages/ai, not of the admin app.
            // Tests that build SDK error objects resolve it from there so the
            // module identity matches what @workspace/ai itself imports.
            ai: path.resolve(__dirname, '../../packages/ai/node_modules/ai'),
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        include: ['__tests__/**/*.test.ts', '__tests__/**/*.test.tsx'],
    },
})
