'use client'

import { Grid3x3, Loader2 } from 'lucide-react'
import { Badge } from '@workspace/ui/components/badge'

type PostCounterBadgeProps = {
    current: number
    total: number
    isLoading?: boolean
}

export function PostCounterBadge({
    current,
    total,
    isLoading = false,
}: PostCounterBadgeProps) {
    return (
        <Badge
            variant='secondary'
            className='gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all'
            aria-label={`${current} of ${total} posts loaded`}
        >
            <Grid3x3 className='text-muted-foreground h-3.5 w-3.5' />
            <span className='tabular-nums'>
                {current.toLocaleString()} of {total.toLocaleString()} posts
            </span>
            {isLoading && (
                <Loader2 className='text-muted-foreground h-3.5 w-3.5 animate-spin' />
            )}
        </Badge>
    )
}
