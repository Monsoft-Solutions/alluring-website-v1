import { createEnv } from '@t3-oss/env-core'
import { config } from 'dotenv'
import z from 'zod'

config({
    path: ['.env.local', '.env'],
})
config()

export const env = createEnv({
    server: {
        POSTGRES_URL: z.url(),
        /**
         * The remote (Supabase) database. Optional so a fresh clone with no
         * production credentials can still run every local command; the
         * `:prod` variants fail with a setup message when it is missing.
         */
        POSTGRES_URL_PROD: z.url().optional(),
        NODE_ENV: z
            .enum(['development', 'production', 'test'])
            .default('development'),
    },
    runtimeEnv: process.env,
})
