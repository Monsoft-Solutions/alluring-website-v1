import { Card, CardContent, CardHeader } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'

export default function AnalyticsLoading() {
    return (
        <div className='space-y-8'>
            {/* Header Skeleton */}
            <div>
                <Skeleton className='h-8 w-32' />
                <Skeleton className='mt-2 h-4 w-64' />
            </div>

            {/* Summary Stats Skeleton */}
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className='flex flex-row items-center justify-between pb-2'>
                            <Skeleton className='h-4 w-24' />
                            <Skeleton className='h-4 w-4' />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className='h-8 w-20' />
                            <Skeleton className='mt-1 h-3 w-16' />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Page Views Chart Skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className='h-5 w-48' />
                    <Skeleton className='h-4 w-56' />
                </CardHeader>
                <CardContent>
                    <Skeleton className='h-[280px] w-full' />
                </CardContent>
            </Card>

            {/* Top Pages & Traffic Sources Skeleton */}
            <div className='grid gap-6 lg:grid-cols-2'>
                {Array.from({ length: 2 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className='h-5 w-32' />
                            <Skeleton className='h-4 w-48' />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className='h-[280px] w-full' />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Device & Browser Stats Skeleton */}
            <div className='grid gap-6 lg:grid-cols-3'>
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className='h-5 w-24' />
                            <Skeleton className='h-4 w-32' />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className='h-[200px] w-full' />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Page Details Table Skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className='h-5 w-32' />
                    <Skeleton className='h-4 w-48' />
                </CardHeader>
                <CardContent>
                    <div className='space-y-3'>
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div
                                key={i}
                                className='grid grid-cols-12 gap-4 text-sm'
                            >
                                <Skeleton className='col-span-1 h-4' />
                                <div className='col-span-5 space-y-1'>
                                    <Skeleton className='h-4 w-full' />
                                    <Skeleton className='h-3 w-3/4' />
                                </div>
                                <Skeleton className='col-span-3 h-4' />
                                <Skeleton className='col-span-3 h-4' />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
