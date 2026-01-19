import { NextResponse } from 'next/server'

import { listActiveCategoriesWithCounts } from '@/lib/queries/blog/taxonomy.query'
import type { BlogCategoriesResponse } from '@/lib/types/blog/api-response.type'

/**
 * GET /api/blog/categories
 * Returns all active blog categories with published post counts
 *
 * @returns JSON array of categories with id, name, slug, and count
 */
export async function GET() {
    try {
        const categories = await listActiveCategoriesWithCounts()

        return NextResponse.json<BlogCategoriesResponse>(categories)
    } catch (error) {
        console.error('Error fetching categories:', error)
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        )
    }
}
