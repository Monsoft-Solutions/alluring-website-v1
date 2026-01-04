'use client'

import dynamicImport from 'next/dynamic'
import { Share2, AlertCircle, RefreshCw } from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Button } from '@workspace/ui/components/button'

import { useDateRange } from '@/components/analytics/date-range-context.component'
import { useTrafficSources } from '@/hooks/use-analytics.hook'

// Lazy load chart
const TrafficSourcesChart = dynamicImport(
    () =>
        import('@/components/charts/analytics-charts.component').then(
            (mod) => mod.TrafficSourcesChart
        ),
    {
        loading: () => <Skeleton className='h-[280px] w-full' />,
    }
)

/**
 * Traffic sources card showing where visitors are coming from.
 * Uses the date range context to filter data.
 */
export function TrafficSourcesCard() {
    const { days, label } = useDateRange()
    const { data, isLoading, error, refetch } = useTrafficSources(days, 6)

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                    <Share2 className='h-5 w-5' />
                    Traffic Sources
                </CardTitle>
                <CardDescription>Visitor sources ({label})</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className='h-[280px] w-full' />
                ) : error ? (
                    <div className='flex h-[280px] flex-col items-center justify-center gap-3'>
                        <AlertCircle className='h-5 w-5 text-red-500' />
                        <p className='text-muted-foreground text-sm'>
                            Failed to load source data
                        </p>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={() => refetch()}
                        >
                            <RefreshCw className='mr-2 h-4 w-4' />
                            Retry
                        </Button>
                    </div>
                ) : data && data.length > 0 ? (
                    <TrafficSourcesChart data={data} />
                ) : (
                    <div className='flex h-[280px] items-center justify-center'>
                        <p className='text-muted-foreground text-sm'>
                            No source data available
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
