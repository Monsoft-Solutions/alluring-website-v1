import { NextResponse } from 'next/server'
import { getGalleryGroupsWithSlug } from '@/lib/queries/gallery.query'
import { isAuthenticated } from '@/lib/utils/auth.util'

export async function GET() {
    try {
        const authenticated = await isAuthenticated()
        if (!authenticated) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

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
