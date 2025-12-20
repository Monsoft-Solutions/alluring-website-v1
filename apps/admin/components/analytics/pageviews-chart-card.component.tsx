'use client'

import dynamicImport from 'next/dynamic'
import { BarChart3, AlertCircle, RefreshCw } from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Button } from '@workspace/ui/components/button'

import { usePageViewsChart } from '@/hooks/use-analytics.hook'

// Lazy load chart for better performance
const PageViewsChart = dynamicImport(
    () =>
        import('@/components/charts/analytics-charts.component').then(
            (mod) => mod.PageViewsChart
        ),
    {
        loading: () => <Skeleton className='h-[280px] w-full' />,
    }
)

/**
 * Page views chart card component that fetches its own data via TanStack Query.
 * Shows page views and sessions over the last 30 days.
 */
export function PageViewsChartCard() {
    const { data, isLoading, error, refetch } = usePageViewsChart(30)

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                    <BarChart3 className='h-5 w-5' />
                    Page Views Over Time
                </CardTitle>
                <CardDescription>
                    Page views and sessions for the last 30 days
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
                    <PageViewsChart data={data} />
                ) : (
                    <div className='flex h-[280px] items-center justify-center'>
                        <p className='text-muted-foreground text-sm'>
                            No page view data yet
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
