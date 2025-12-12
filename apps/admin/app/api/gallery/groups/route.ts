import { NextResponse } from 'next/server'
import { getGalleryGroupsWithSlug } from '@/lib/queries/gallery.query'

export async function GET() {
    try {
        const groups = await getGalleryGroupsWithSlug()
        return NextResponse.json({ groups })
    } catch (error) {
        console.error('Error fetching gallery groups:', error)
        return NextResponse.json(
            { error: 'Failed to fetch gallery groups' },
            { status: 500 }
        )
    }
}
