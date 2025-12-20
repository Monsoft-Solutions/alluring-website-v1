import { Card, CardContent, CardHeader } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'

export default function DashboardLoading() {
    return (
        <div className='space-y-8'>
            {/* Stats Grid Skeleton */}
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className='flex flex-row items-center justify-between pb-2'>
                            <Skeleton className='h-4 w-24' />
                            <Skeleton className='h-4 w-4' />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className='h-8 w-16' />
                            <Skeleton className='mt-1 h-3 w-32' />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Row Skeleton */}
            <div className='grid gap-6 lg:grid-cols-2'>
                {Array.from({ length: 2 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className='h-5 w-40' />
                            <Skeleton className='h-4 w-48' />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className='h-[280px] w-full' />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Second Charts Row Skeleton */}
            <div className='grid gap-6 lg:grid-cols-2'>
                {Array.from({ length: 2 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className='h-5 w-40' />
                            <Skeleton className='h-4 w-48' />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className='h-[280px] w-full' />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Activity Skeleton */}
            <div className='grid gap-6 lg:grid-cols-2'>
                {Array.from({ length: 2 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className='flex flex-row items-center justify-between'>
                            <Skeleton className='h-5 w-32' />
                            <Skeleton className='h-4 w-16' />
                        </CardHeader>
                        <CardContent>
                            <div className='space-y-4'>
                                {Array.from({ length: 5 }).map((_, j) => (
                                    <div
                                        key={j}
                                        className='flex items-start justify-between gap-4 rounded-lg border p-3'
                                    >
                                        <div className='min-w-0 flex-1 space-y-2'>
                                            <Skeleton className='h-4 w-32' />
                                            <Skeleton className='h-3 w-48' />
                                        </div>
                                        <Skeleton className='h-3 w-16' />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
