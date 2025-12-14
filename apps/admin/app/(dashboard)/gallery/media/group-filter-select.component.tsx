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
    hasGroup?: boolean | null
    currentStatus: string
    currentType: string
    sortBy: string
    sortOrder: string
}

export function GroupFilterSelect({
    groups,
    selectedGroupId,
    hasGroup,
    currentStatus,
    currentType,
    sortBy,
    sortOrder,
}: GroupFilterSelectProps) {
    const router = useRouter()

    const handleChange = (value: string) => {
        const params = new URLSearchParams()
        params.set('sortBy', sortBy)
        params.set('sortOrder', sortOrder)
        if (currentStatus !== 'all') params.set('status', currentStatus)
        if (currentType !== 'all') params.set('type', currentType)

        if (value === 'ungrouped') {
            // Show only ungrouped media
            params.set('hasGroup', 'false')
        } else if (value !== 'all') {
            // Show media from specific group
            params.set('groupId', value)
        }
        // For 'all', don't set groupId or hasGroup params

        router.push(`/gallery/media?${params.toString()}`)
    }

    // Determine current value for select
    const currentValue =
        selectedGroupId || (hasGroup === false ? 'ungrouped' : 'all')

    return (
        <Select value={currentValue} onValueChange={handleChange}>
            <SelectTrigger className='w-[200px]'>
                <SelectValue placeholder='Filter by group' />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value='all'>All Groups</SelectItem>
                <SelectItem value='ungrouped'>Ungrouped Media</SelectItem>
                {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                        {group.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
