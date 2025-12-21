import { ArrowUp, ArrowDown } from 'lucide-react'

import type { SortIconProps } from '@/lib/types/blog/post.type'

export function SortIcon({ column, sortBy, sortOrder }: SortIconProps) {
    if (sortBy !== column) return <span className='ml-1 inline-block w-3' />
    return sortOrder === 'asc' ? (
        <ArrowUp className='ml-1 inline h-3 w-3' />
    ) : (
        <ArrowDown className='ml-1 inline h-3 w-3' />
    )
}
