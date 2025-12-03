/* eslint-disable no-restricted-properties */
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

// Only load dotenv in server-side environments
if (typeof window === 'undefined') {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const dotenv = require('dotenv')
        dotenv.config({ path: '.env.local' })
        dotenv.config()
    } catch {
        // Dotenv not available or already loaded
    }
}

/**
 * Admin Dashboard Environment Variables
 */
export const env = createEnv({
    server: {
        // Database
        POSTGRES_URL: z.string().url(),

        // Admin authentication (min 4 chars for dev, use longer in production)
        ADMIN_PASSWORD: z.string().min(4),
    },
    client: {},
    shared: {
        NODE_ENV: z
            .enum(['development', 'production', 'test'])
            .default('development'),
    },
    experimental__runtimeEnv: {
        NODE_ENV: process.env.NODE_ENV,
    },
    // Skip validation in CI/build environments if needed
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
    onInvalidAccess: (variable: string) => {
        throw new Error(
            `❌ Attempted to access a server-side environment variable on the client: ${variable}`
        )
    },
})
