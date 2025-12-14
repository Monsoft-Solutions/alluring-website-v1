'use client'

import { useRouter } from 'next/navigation'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'

import type { GalleryGroupOption } from '@/lib/queries/gallery.query'

type GroupFilterSelectProps = {
    groups: GalleryGroupOption[]
    selectedGroupId?: string
    currentStatus: string
    currentType: string
    sortBy: string
    sortOrder: string
}

export function GroupFilterSelect({
    groups,
    selectedGroupId,
    currentStatus,
    currentType,
    sortBy,
    sortOrder,
}: GroupFilterSelectProps) {
    const router = useRouter()

    const handleChange = (value: string) => {
        const groupId = value === 'all' ? undefined : value
        const params = new URLSearchParams()
        params.set('sortBy', sortBy)
        params.set('sortOrder', sortOrder)
        if (currentStatus !== 'all') params.set('status', currentStatus)
        if (currentType !== 'all') params.set('type', currentType)
        if (groupId) params.set('groupId', groupId)
        router.push(`/gallery/media?${params.toString()}`)
    }

    return (
        <Select value={selectedGroupId || 'all'} onValueChange={handleChange}>
            <SelectTrigger className='w-[200px]'>
                <SelectValue placeholder='Filter by group' />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value='all'>All Groups</SelectItem>
                {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                        {group.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
