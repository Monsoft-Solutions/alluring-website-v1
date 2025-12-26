import { Skeleton } from '@workspace/ui/components/skeleton'

type ChartSkeletonProps = {
    /** Height of the chart skeleton in pixels. Default: 200 */
    height?: number
}

/**
 * Simple chart skeleton for loading states.
 */
export function ChartSkeleton({ height = 200 }: ChartSkeletonProps) {
    return <Skeleton className='w-full' style={{ height }} />
}
