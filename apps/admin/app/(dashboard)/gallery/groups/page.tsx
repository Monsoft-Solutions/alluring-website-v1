import { getGalleryGroups } from '@/lib/queries/gallery.query'
import { GroupsPageClient } from './groups-client.component'

export const dynamic = 'force-dynamic'

export default async function GroupsPage() {
    const groups = await getGalleryGroups()

    return <GroupsPageClient groups={groups} />
}
