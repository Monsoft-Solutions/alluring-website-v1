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
    },
    runtimeEnv: process.env,
})
