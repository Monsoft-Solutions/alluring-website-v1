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

import {
    usePageViewsChart,
    usePageViewsHourly,
} from '@/hooks/use-analytics.hook'
import { useDateRange } from '@/components/analytics/date-range-context.component'

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
 * Shows page views and sessions over the selected date range.
 * Uses hourly breakdown for Today and Yesterday, daily breakdown for longer periods.
 */
export function PageViewsChartCard() {
    const { dateRange, days, label, startDate } = useDateRange()

    // Determine if we should show hourly data
    const isHourlyMode = dateRange === 'today' || dateRange === 'yesterday'

    // Fetch daily data (used for multi-day periods)
    const dailyQuery = usePageViewsChart(days)

    // Fetch hourly data (used for today/yesterday)
    const hourlyQuery = usePageViewsHourly(startDate)

    // Select the appropriate query based on mode
    const { data, isLoading, error, refetch } = isHourlyMode
        ? hourlyQuery
        : dailyQuery

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                    <BarChart3 className='h-5 w-5' />
                    Page Views Over Time
                </CardTitle>
                <CardDescription>
                    Page views and sessions for {label.toLowerCase()}
                    {isHourlyMode && ' (by hour)'}
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
                    <PageViewsChart
                        data={data}
                        mode={isHourlyMode ? 'hourly' : 'daily'}
                    />
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
