'use client'

import dynamicImport from 'next/dynamic'
import { Globe, AlertCircle, RefreshCw } from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Button } from '@workspace/ui/components/button'

import { useBrowserBreakdown } from '@/hooks/use-analytics.hook'

// Lazy load chart for better performance
const BrowserChart = dynamicImport(
    () =>
        import('@/components/charts/analytics-charts.component').then(
            (mod) => mod.BrowserChart
        ),
    {
        loading: () => <Skeleton className='h-[200px] w-full' />,
    }
)

/**
 * Browsers chart card component that fetches its own data via TanStack Query.
 * Shows browser distribution.
 */
export function BrowsersCard() {
    const { data, isLoading, error, refetch } = useBrowserBreakdown(5)

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                    <Globe className='h-5 w-5' />
                    Browsers
                </CardTitle>
                <CardDescription>Browser distribution</CardDescription>
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
                    <BrowserChart data={data} />
                ) : (
                    <div className='flex h-[200px] items-center justify-center'>
                        <p className='text-muted-foreground text-sm'>
                            No browser data yet
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
