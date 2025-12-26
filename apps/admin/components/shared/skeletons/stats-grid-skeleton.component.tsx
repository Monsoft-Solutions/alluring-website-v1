import { Card, CardContent, CardHeader } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'

type StatsGridSkeletonProps = {
    /** Number of stat cards to display. Default: 4 */
    count?: number
}

/**
 * Configurable stats grid skeleton for dashboard loading states.
 */
export function StatsGridSkeleton({ count = 4 }: StatsGridSkeletonProps) {
    return (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {Array.from({ length: count }).map((_, i) => (
                <Card key={i}>
                    <CardHeader className='flex flex-row items-center justify-between pb-2'>
                        <Skeleton className='h-4 w-24' />
                        <Skeleton className='h-4 w-4' />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className='h-8 w-20' />
                        <Skeleton className='mt-1 h-3 w-16' />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
