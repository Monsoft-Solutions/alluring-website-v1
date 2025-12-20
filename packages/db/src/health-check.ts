import { sql } from 'drizzle-orm'

import { db } from './client'

/**
 * Test database connection health
 * Useful for debugging connection issues
 */
export async function checkDatabaseConnection(): Promise<{
    healthy: boolean
    latency?: number
    error?: string
}> {
    try {
        const start = Date.now()
        await db.execute(sql`SELECT 1`)
        const latency = Date.now() - start

        return { healthy: true, latency }
    } catch (error) {
        return {
            healthy: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}
