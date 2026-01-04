'use client'

import dynamicImport from 'next/dynamic'
import { TrendingUp, AlertCircle, RefreshCw } from 'lucide-react'
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
import {
    useContactsChart,
    useContactsChartHourly,
} from '@/hooks/use-dashboard.hook'

// Lazy load chart for better performance
const ContactsChart = dynamicImport(
    () =>
        import('@/components/charts/contacts-chart.component').then(
            (mod) => mod.ContactsChart
        ),
    {
        loading: () => <Skeleton className='h-[200px] w-full' />,
    }
)

/**
 * Contacts chart card component that fetches its own data via TanStack Query.
 * Uses the date range context to filter data.
 * Uses hourly breakdown for Today and Yesterday, daily breakdown for longer periods.
 */
export function ContactsChartCard() {
    const { dateRange, days, label, startDate } = useDateRange()

    // Determine if we should show hourly data
    const isHourlyMode = dateRange === 'today' || dateRange === 'yesterday'

    // Fetch daily data (used for multi-day periods) - only when NOT hourly mode
    const dailyQuery = useContactsChart(days, { enabled: !isHourlyMode })

    // Fetch hourly data (used for today/yesterday) - only when in hourly mode
    const hourlyQuery = useContactsChartHourly(startDate, {
        enabled: isHourlyMode,
    })

    // Select the appropriate query based on mode
    const { data, isLoading, error, refetch } = isHourlyMode
        ? hourlyQuery
        : dailyQuery

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                    <TrendingUp className='h-5 w-5' />
                    Contacts Over Time
                </CardTitle>
                <CardDescription>
                    Contact submissions ({label}){isHourlyMode && ' (by hour)'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className='h-[200px] w-full' />
                ) : error ? (
                    <div className='flex h-[200px] flex-col items-center justify-center gap-3'>
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
                    <ContactsChart
                        data={data}
                        mode={isHourlyMode ? 'hourly' : 'daily'}
                    />
                ) : (
                    <div className='flex h-[200px] items-center justify-center'>
                        <p className='text-muted-foreground text-sm'>
                            No contact data yet
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
