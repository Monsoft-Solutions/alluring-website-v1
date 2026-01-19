import { NextResponse } from 'next/server'

import { listAuthorsWithCounts } from '@/lib/queries/blog/taxonomy.query'
import type { BlogAuthorsResponse } from '@/lib/types/blog/api-response.type'

/**
 * GET /api/blog/authors
 * Returns all blog authors with published post counts
 *
 * @returns JSON array of authors with id, name, slug, and count
 */
export async function GET() {
    try {
        const authors = await listAuthorsWithCounts()

        return NextResponse.json<BlogAuthorsResponse>(authors)
    } catch (error) {
        console.error('Error fetching authors:', error)
        return NextResponse.json(
            { error: 'Failed to fetch authors' },
            { status: 500 }
        )
    }
}
