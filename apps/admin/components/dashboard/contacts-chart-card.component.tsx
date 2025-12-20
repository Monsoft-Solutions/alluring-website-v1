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

import { useContactsChart } from '@/hooks/use-dashboard.hook'

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
 * Shows contacts over time for the last 30 days.
 */
export function ContactsChartCard() {
    const { data, isLoading, error, refetch } = useContactsChart(30)

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                    <TrendingUp className='h-5 w-5' />
                    Contacts Over Time
                </CardTitle>
                <CardDescription>
                    Last 30 days of contact submissions
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
                    <ContactsChart data={data} />
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
