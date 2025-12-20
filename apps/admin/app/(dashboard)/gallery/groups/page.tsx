import {
    getGalleryGroups,
    getGalleryMediaForSelect,
} from '@/lib/queries/gallery.query'
import { GroupsPageClient } from './groups-client.component'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export default async function GroupsPage() {
    const [groups, mediaOptions] = await Promise.all([
        getGalleryGroups(),
        getGalleryMediaForSelect(),
    ])

    return <GroupsPageClient groups={groups} mediaOptions={mediaOptions} />
}
