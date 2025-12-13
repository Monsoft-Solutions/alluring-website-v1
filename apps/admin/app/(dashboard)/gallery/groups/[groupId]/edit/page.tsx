import { notFound } from 'next/navigation'

import {
    getGalleryGroupById,
    getMediaByGroupId,
    getGalleryGroups,
} from '@/lib/queries/gallery.query'
import { GroupEditClient } from './group-edit-client.component'

export const dynamic = 'force-dynamic'

type PageProps = {
    params: Promise<{ groupId: string }>
}

export default async function GroupEditPage({ params }: PageProps) {
    const { groupId } = await params

    // Fetch group details, current media in group, and all groups for cover image selection
    const [group, groupMedia, allGroups] = await Promise.all([
        getGalleryGroupById(groupId),
        getMediaByGroupId(groupId),
        getGalleryGroups(),
    ])

    if (!group) {
        notFound()
    }

    return (
        <GroupEditClient
            group={group}
            groupMedia={groupMedia}
            allGroups={allGroups}
        />
    )
}
