import { createEnv } from '@t3-oss/env-core'
import { config } from 'dotenv'
import z from 'zod'

config({
    path: '.env.local',
})
config()

export const env = createEnv({
    server: {
        NODE_ENV: z
            .enum(['development', 'production', 'test'])
            .default('development'),
        VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),
        VERCEL_URL: z.string().optional(),
        NEXT_PUBLIC_BASE_URL: z.string().optional(),
    },
    runtimeEnv: process.env,
})
