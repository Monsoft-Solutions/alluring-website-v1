'use client'

import dynamicImport from 'next/dynamic'
import { ExternalLink, AlertCircle, RefreshCw } from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Button } from '@workspace/ui/components/button'

import { useTrafficSources } from '@/hooks/use-analytics.hook'
import { useDateRange } from '@/components/analytics/date-range-context.component'

// Lazy load chart for better performance
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
 * Traffic sources chart card component that fetches its own data via TanStack Query.
 * Shows where visitors come from in the selected date range.
 */
export function TrafficSourcesCard() {
    const { days, label } = useDateRange()
    const { data, isLoading, error, refetch } = useTrafficSources(days, 10)

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                    <ExternalLink className='h-5 w-5' />
                    Traffic Sources
                </CardTitle>
                <CardDescription>
                    Where your visitors come from - {label.toLowerCase()}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className='h-[280px] w-full' />
                ) : error ? (
                    <div className='flex h-[280px] flex-col items-center justify-center gap-3'>
                        <AlertCircle className='h-5 w-5 text-red-500' />
                        <p className='text-muted-foreground text-sm'>
                            Failed to load chart
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
                            No traffic source data yet
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
