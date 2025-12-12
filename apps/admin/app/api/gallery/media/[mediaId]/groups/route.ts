import { NextRequest, NextResponse } from 'next/server'
import { galleryMediaGroup } from '@workspace/db/schema'
import { eq } from 'drizzle-orm'
import { db } from '@workspace/db/client'

type Params = {
    params: Promise<{
        mediaId: string
    }>
}

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
        const { mediaId } = await params

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
