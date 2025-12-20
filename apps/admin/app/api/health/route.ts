import { NextResponse } from 'next/server'

import { checkDatabaseConnection } from '@workspace/db/health'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
    const dbHealth = await checkDatabaseConnection()

    if (!dbHealth.healthy) {
        return NextResponse.json(
            { status: 'unhealthy', database: dbHealth },
            { status: 503 }
        )
    }

    return NextResponse.json({
        status: 'healthy',
        database: dbHealth,
        timestamp: new Date().toISOString(),
    })
}
