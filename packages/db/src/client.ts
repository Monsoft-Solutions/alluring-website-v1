import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { env } from './env'
import * as schema from './schema'

// Shared client configuration - safe for both web and admin
const client = postgres(env.POSTGRES_URL, {
    // Required for Supabase pgBouncer transaction mode
    prepare: false,

    // Conservative timeouts to prevent hangs
    connect_timeout: 10, // Fail fast on connection issues (seconds)
    idle_timeout: 20, // Close idle connections (seconds) - good for pooler

    // Serverless optimization
    max: 5, // One connection per serverless function instance
})

export const db = drizzle(client, { schema })
