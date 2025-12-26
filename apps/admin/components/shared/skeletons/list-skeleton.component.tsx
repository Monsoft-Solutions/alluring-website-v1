import { Skeleton } from '@workspace/ui/components/skeleton'

type ListSkeletonProps = {
    /** Number of list items to display. Default: 5 */
    count?: number
    /** Whether to show avatar placeholders. Default: false */
    showAvatar?: boolean
}

/**
 * List item skeleton for loading states.
 */
export function ListSkeleton({
    count = 5,
    showAvatar = false,
}: ListSkeletonProps) {
    return (
        <div className='space-y-3'>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className='flex items-center gap-3'>
                    {showAvatar && (
                        <Skeleton className='h-10 w-10 rounded-full' />
                    )}
                    <div className='flex-1 space-y-2'>
                        <Skeleton className='h-4 w-3/4' />
                        <Skeleton className='h-3 w-1/2' />
                    </div>
                </div>
            ))}
        </div>
    )
}
