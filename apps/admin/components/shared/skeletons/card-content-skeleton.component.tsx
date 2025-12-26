import { Skeleton } from '@workspace/ui/components/skeleton'

type CardContentSkeletonProps = {
    /** Number of text lines to display. Default: 3 */
    lines?: number
    /** Whether to show badge placeholders. Default: false */
    showBadges?: boolean
}

/**
 * Generic card content skeleton for loading states.
 */
export function CardContentSkeleton({
    lines = 3,
    showBadges = false,
}: CardContentSkeletonProps) {
    return (
        <div className='space-y-3'>
            {showBadges && (
                <div className='flex gap-2'>
                    <Skeleton className='h-5 w-16 rounded-full' />
                    <Skeleton className='h-5 w-12 rounded-full' />
                </div>
            )}
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
                />
            ))}
        </div>
    )
}
