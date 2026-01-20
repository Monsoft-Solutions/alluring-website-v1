import { db } from '@workspace/db/client'
import { sql } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'

import { requireAuth, UnauthorizedError } from '@/lib/utils/auth.util'

export const runtime = 'nodejs'

type RouteContext = {
    params: Promise<{ blogPostId: string; imageId: string }>
}

/**
 * DELETE /api/blog/[blogPostId]/generated-images/[imageId]
 * Delete a generated image
 */
export async function DELETE(
    _request: NextRequest,
    context: RouteContext
): Promise<NextResponse> {
    try {
        await requireAuth()

        const { blogPostId, imageId } = await context.params

        // Delete both records in a transaction to ensure atomicity
        await db.transaction(async (tx) => {
            // Delete the junction record using raw SQL
            await tx.execute(sql`
                DELETE FROM blog_post_images
                WHERE blog_post_id = ${blogPostId} AND image_id = ${imageId}
            `)

            // Delete the image record
            await tx.execute(sql`
                DELETE FROM images WHERE id = ${imageId}
            `)
        })

        return NextResponse.json({
            success: true,
        })
    } catch (error) {
        console.error('Error deleting generated image:', error)

        if (error instanceof UnauthorizedError) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to delete image',
            },
            { status: 500 }
        )
    }
}
