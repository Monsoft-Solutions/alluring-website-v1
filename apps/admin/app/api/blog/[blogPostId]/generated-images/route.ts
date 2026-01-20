import { db } from '@workspace/db/client'
import { sql } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'

import { requireAuth, UnauthorizedError } from '@/lib/utils/auth.util'

export const runtime = 'nodejs'

type RouteContext = {
    params: Promise<{ blogPostId: string }>
}

type GeneratedImage = {
    id: string
    url: string
    prompt: string | null
    created_at: Date
}

/**
 * GET /api/blog/[blogPostId]/generated-images
 * Fetch all generated images for a blog post
 */
export async function GET(
    _request: NextRequest,
    context: RouteContext
): Promise<NextResponse> {
    try {
        await requireAuth()

        const { blogPostId } = await context.params

        // Fetch generated images with their metadata using raw SQL
        const result = await db.execute<GeneratedImage>(sql`
            SELECT i.id, i.url, bpi.prompt, bpi.created_at
            FROM blog_post_images bpi
            INNER JOIN images i ON bpi.image_id = i.id
            WHERE bpi.blog_post_id = ${blogPostId}
            ORDER BY bpi.created_at DESC
        `)

        // postgres-js returns result directly as array
        const generatedImages = Array.isArray(result) ? result : []

        return NextResponse.json({
            success: true,
            images: generatedImages,
        })
    } catch (error) {
        console.error('Error fetching generated images:', error)

        if (error instanceof UnauthorizedError) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch generated images',
            },
            { status: 500 }
        )
    }
}
