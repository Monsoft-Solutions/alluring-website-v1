'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Button } from '@workspace/ui/components/button'

import { useTopPages } from '@/hooks/use-analytics.hook'

/**
 * Page details card component that fetches its own data via TanStack Query.
 * Shows detailed breakdown of top pages with views and sessions.
 */
export function PageDetailsCard() {
    const { data: topPages, isLoading, error, refetch } = useTopPages(30, 10)

    return (
        <Card>
            <CardHeader>
                <CardTitle className='text-lg'>Page Details</CardTitle>
                <CardDescription>
                    Detailed breakdown of top pages
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className='space-y-3'>
                        <Skeleton className='h-8 w-full' />
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className='h-12 w-full' />
                        ))}
                    </div>
                ) : error ? (
                    <div className='flex h-[200px] flex-col items-center justify-center gap-3'>
                        <AlertCircle className='h-5 w-5 text-red-500' />
                        <p className='text-muted-foreground text-sm'>
                            Failed to load page details
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
                ) : topPages && topPages.length > 0 ? (
                    <div className='space-y-3'>
                        <div className='grid grid-cols-12 gap-4 border-b pb-2 text-xs font-medium text-stone-500'>
                            <div className='col-span-1'>#</div>
                            <div className='col-span-5'>Page</div>
                            <div className='col-span-3 text-right'>Views</div>
                            <div className='col-span-3 text-right'>
                                Sessions
                            </div>
                        </div>
                        {topPages.map((page, index) => (
                            <div
                                key={page.pagePath}
                                className='grid grid-cols-12 gap-4 text-sm'
                            >
                                <div className='col-span-1 text-stone-400'>
                                    {index + 1}
                                </div>
                                <div className='col-span-5'>
                                    <p
                                        className='truncate font-medium'
                                        title={page.pageTitle ?? page.pagePath}
                                    >
                                        {page.pageTitle ?? page.pagePath}
                                    </p>
                                    <p
                                        className='text-muted-foreground truncate text-xs'
                                        title={page.pagePath}
                                    >
                                        {page.pagePath}
                                    </p>
                                </div>
                                <div className='col-span-3 text-right tabular-nums'>
                                    {page.views.toLocaleString()}
                                </div>
                                <div className='text-muted-foreground col-span-3 text-right tabular-nums'>
                                    {page.uniqueSessions.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className='flex h-[200px] items-center justify-center'>
                        <p className='text-muted-foreground text-sm'>
                            No page data yet. Views will appear after visitors
                            browse your site.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
