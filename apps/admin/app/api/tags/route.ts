import { NextResponse } from 'next/server'

import { getTags } from '@/lib/queries/tags.query'
import { isAuthenticated } from '@/lib/utils/auth.util'

export async function GET() {
    try {
        const authenticated = await isAuthenticated()
        if (!authenticated) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const tags = await getTags()
        return NextResponse.json(tags)
    } catch (error) {
        console.error('Error fetching tags:', error)
        return NextResponse.json(
            { error: 'Failed to fetch tags' },
            { status: 500 }
        )
    }
}
