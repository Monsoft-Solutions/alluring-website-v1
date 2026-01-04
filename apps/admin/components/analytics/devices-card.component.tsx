'use client'

import dynamicImport from 'next/dynamic'
import { Monitor, Smartphone, AlertCircle, RefreshCw } from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Button } from '@workspace/ui/components/button'

import { useDeviceBreakdown } from '@/hooks/use-analytics.hook'
import { useDateRange } from '@/components/analytics/date-range-context.component'

// Lazy load chart for better performance
const DeviceChart = dynamicImport(
    () =>
        import('@/components/charts/analytics-charts.component').then(
            (mod) => mod.DeviceChart
        ),
    {
        loading: () => <Skeleton className='h-[200px] w-full' />,
    }
)

/**
 * Devices chart card component that fetches its own data via TanStack Query.
 * Shows device type breakdown (mobile, desktop, tablet).
 */
export function DevicesCard() {
    const { days, label } = useDateRange()
    const { data, isLoading, error, refetch } = useDeviceBreakdown(days)

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                    <Monitor className='h-5 w-5' />
                    Devices
                </CardTitle>
                <CardDescription>
                    Device breakdown - {label.toLowerCase()}
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
                    <>
                        <DeviceChart data={data} />
                        <div className='mt-4 flex flex-wrap justify-center gap-4'>
                            {data.map((device) => (
                                <div
                                    key={device.deviceType}
                                    className='flex items-center gap-2 text-sm'
                                >
                                    {device.deviceType === 'mobile' ? (
                                        <Smartphone className='h-4 w-4 text-amber-600' />
                                    ) : (
                                        <Monitor className='h-4 w-4 text-stone-500' />
                                    )}
                                    <span className='capitalize'>
                                        {device.deviceType}
                                    </span>
                                    <span className='text-muted-foreground'>
                                        {device.percentage}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className='flex h-[200px] items-center justify-center'>
                        <p className='text-muted-foreground text-sm'>
                            No device data yet
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
