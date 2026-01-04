'use client'

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

import { useGeoDistribution } from '@/hooks/use-analytics.hook'
import { useDateRange } from '@/components/analytics/date-range-context.component'
import { GeoTable } from '@/components/charts/analytics-charts.component'

/**
 * Geographic distribution card component that fetches its own data via TanStack Query.
 * Shows where visitors are located by country in the selected date range.
 */
export function GeoCard() {
    const { days, label } = useDateRange()
    const { data, isLoading, error, refetch } = useGeoDistribution(days, 10)

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                    <Globe className='h-5 w-5' />
                    Countries
                </CardTitle>
                <CardDescription>
                    Geographic distribution - {label.toLowerCase()}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className='space-y-3'>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className='h-6 w-full' />
                        ))}
                    </div>
                ) : error ? (
                    <div className='flex h-[200px] flex-col items-center justify-center gap-3'>
                        <AlertCircle className='h-5 w-5 text-red-500' />
                        <p className='text-muted-foreground text-sm'>
                            Failed to load geo data
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
                    <GeoTable data={data} />
                ) : (
                    <div className='flex h-[200px] items-center justify-center'>
                        <p className='text-muted-foreground text-sm'>
                            No geo data yet
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
