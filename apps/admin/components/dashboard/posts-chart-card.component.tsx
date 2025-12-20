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

import { useTopPosts } from '@/hooks/use-dashboard.hook'

// Lazy load chart for better performance
const PostsChart = dynamicImport(
    () =>
        import('@/components/charts/posts-chart.component').then(
            (mod) => mod.PostsChart
        ),
    {
        loading: () => <Skeleton className='h-[200px] w-full' />,
    }
)

/**
 * Top posts chart card component that fetches its own data via TanStack Query.
 * Shows top 5 published posts by views.
 */
export function PostsChartCard() {
    const { data, isLoading, error, refetch } = useTopPosts(5)

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                    <BarChart3 className='h-5 w-5' />
                    Top Posts by Views
                </CardTitle>
                <CardDescription>Most viewed published posts</CardDescription>
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
                    <PostsChart data={data} />
                ) : (
                    <div className='flex h-[200px] items-center justify-center'>
                        <p className='text-muted-foreground text-sm'>
                            No published posts yet
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
