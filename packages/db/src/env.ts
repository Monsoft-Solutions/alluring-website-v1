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
        NODE_ENV: z
            .enum(['development', 'production', 'test'])
            .default('development'),
        // Admin seed environment variables (optional)
        ADMIN_EMAIL: z.string().email().optional(),
        ADMIN_PASSWORD: z.string().min(1).optional(),
        ADMIN_NAME: z.string().optional(),
    },
    runtimeEnv: process.env,
})
