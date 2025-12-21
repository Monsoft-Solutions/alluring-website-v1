import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { galleryMediaGroup } from '@workspace/db/schema'
import { eq } from 'drizzle-orm'
import { db } from '@workspace/db/client'
import { z } from 'zod'
import { isAuthenticated } from '@/lib/utils/auth.util'

type Params = {
    params: Promise<{
        mediaId: string
    }>
}

const paramsSchema = z.object({
    mediaId: z.string().uuid(),
})

/**
 * GET /api/gallery/media/[mediaId]/groups
 *
 * Fetch gallery group IDs that a specific media item is assigned to.
 */
export async function GET(
    request: NextRequest,
    { params }: Params
): Promise<NextResponse> {
    try {
        const authenticated = await isAuthenticated()
        if (!authenticated) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const rawParams = await params
        const result = paramsSchema.safeParse(rawParams)

        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid mediaId: must be a valid UUID' },
                { status: 400 }
            )
        }

        const { mediaId } = result.data

        // Fetch group assignments for this media
        const assignments = await db
            .select({ groupId: galleryMediaGroup.groupId })
            .from(galleryMediaGroup)
            .where(eq(galleryMediaGroup.mediaId, mediaId))
            .orderBy(galleryMediaGroup.displayOrder)

        const groupIds = assignments.map((a) => a.groupId)

        return NextResponse.json({
            groupIds,
        })
    } catch (error) {
        console.error('Error fetching media groups:', error)
        return NextResponse.json(
            { error: 'Failed to fetch media groups' },
            { status: 500 }
        )
    }
}
