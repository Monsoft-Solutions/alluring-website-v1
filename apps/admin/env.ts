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
        POSTGRES_URL: z.string(),

        // Admin authentication (min 4 chars for dev, use longer in production)
        ADMIN_PASSWORD: z.string().min(4),

        // Vercel Blob storage for media uploads
        BLOB_READ_WRITE_TOKEN: z.string().min(1),

        // Cache revalidation secret for invalidating web app cache
        REVALIDATION_SECRET: z.string().min(32),
    },
    client: {
        // Public web app URL for building absolute links
        NEXT_PUBLIC_WEB_URL: z.url(),
    },
    shared: {
        NODE_ENV: z
            .enum(['development', 'production', 'test'])
            .default('development'),
    },
    experimental__runtimeEnv: {
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_WEB_URL: process.env.NEXT_PUBLIC_WEB_URL,
    },
    onInvalidAccess: (variable: string) => {
        throw new Error(
            `❌ Attempted to access a server-side environment variable on the client: ${variable}`
        )
    },
})
