'use client'

import dynamicImport from 'next/dynamic'
import { Send, AlertCircle, RefreshCw } from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Button } from '@workspace/ui/components/button'

import { useEmailsChart } from '@/hooks/use-dashboard.hook'

// Lazy load chart for better performance
const EmailsChart = dynamicImport(
    () =>
        import('@/components/charts/emails-chart.component').then(
            (mod) => mod.EmailsChart
        ),
    {
        loading: () => <Skeleton className='h-[200px] w-full' />,
    }
)

/**
 * Emails chart card component that fetches its own data via TanStack Query.
 * Shows email delivery status breakdown.
 */
export function EmailsChartCard() {
    const { data, isLoading, error, refetch } = useEmailsChart()

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                    <Send className='h-5 w-5' />
                    Email Delivery
                </CardTitle>
                <CardDescription>Email delivery success rate</CardDescription>
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
                    <EmailsChart data={data} />
                ) : (
                    <div className='flex h-[200px] items-center justify-center'>
                        <p className='text-muted-foreground text-sm'>
                            No emails sent yet
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
