import { NextResponse } from 'next/server'

import { listActiveTagsWithCounts } from '@/lib/queries/blog/taxonomy.query'
import type { BlogTagsResponse } from '@/lib/types/blog/api-response.type'

/**
 * GET /api/blog/tags
 * Returns all active blog tags with published post counts
 *
 * @returns JSON array of tags with id, name, slug, and count
 */
export async function GET() {
    try {
        const tags = await listActiveTagsWithCounts()

        return NextResponse.json<BlogTagsResponse>(tags)
    } catch (error) {
        console.error('Error fetching tags:', error)
        return NextResponse.json(
            { error: 'Failed to fetch tags' },
            { status: 500 }
        )
    }
}
