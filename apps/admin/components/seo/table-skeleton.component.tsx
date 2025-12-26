import { Skeleton } from '@workspace/ui/components/skeleton'

/**
 * TableSkeleton component for IndexCoverageCard loading state.
 */
export function TableSkeleton() {
    return (
        <div className='space-y-4'>
            <div className='flex gap-2'>
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className='h-6 w-24' />
                ))}
            </div>
            <Skeleton className='h-10 w-full' />
            <div className='space-y-3'>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className='flex items-center gap-4'>
                        <Skeleton className='h-4 flex-1' />
                        <Skeleton className='h-5 w-20' />
                        <Skeleton className='h-4 w-12' />
                        <Skeleton className='h-4 w-20' />
                    </div>
                ))}
            </div>
        </div>
    )
}
