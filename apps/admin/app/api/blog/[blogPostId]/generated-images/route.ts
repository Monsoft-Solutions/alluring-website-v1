import { db } from '@workspace/db/client'
import { blogPostImages, images } from '@workspace/db/schema'
import { eq, desc } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'

import { requireAuth, UnauthorizedError } from '@/lib/utils/auth.util'

export const runtime = 'nodejs'

type RouteContext = {
    params: Promise<{ blogPostId: string }>
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

        // Fetch generated images with their metadata
        const generatedImages = await db
            .select({
                id: images.id,
                url: images.url,
                prompt: blogPostImages.prompt,
                createdAt: blogPostImages.createdAt,
            })
            .from(blogPostImages)
            .innerJoin(images, eq(blogPostImages.imageId, images.id))
            .where(eq(blogPostImages.blogPostId, blogPostId))
            .orderBy(desc(blogPostImages.createdAt))

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
