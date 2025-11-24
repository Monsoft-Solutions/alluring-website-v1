/* eslint-disable no-restricted-properties */
import { createEnv } from '@t3-oss/env-core'
import z from 'zod'

/**
 * Environment configuration for SEO package
 *
 * Note: This package is shared and may be imported in both server and client contexts.
 * Environment variables are loaded by the Next.js app (apps/web/env.ts), so we don't
 * need to load dotenv here.
 */
export const env = createEnv({
    server: {
        NODE_ENV: z
            .enum(['development', 'production', 'test'])
            .default('development'),
        VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),
        VERCEL_URL: z.string().optional(),
        NEXT_PUBLIC_BASE_URL: z.string().optional(),
    },
    runtimeEnv: typeof window === 'undefined' ? process.env : {},
})
