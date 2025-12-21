import { db } from '@workspace/db/client'
import { blogPostImages, images } from '@workspace/db/schema'
import { and, eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

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

        // Delete the junction record
        await db
            .delete(blogPostImages)
            .where(
                and(
                    eq(blogPostImages.blogPostId, blogPostId),
                    eq(blogPostImages.imageId, imageId)
                )
            )

        // Delete the image record
        // Note: If this image is used as a featured image elsewhere,
        // we should handle that case, but for now we'll just delete it
        await db.delete(images).where(eq(images.id, imageId))

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
