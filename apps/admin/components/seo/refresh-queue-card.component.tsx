'use client'

import Link from 'next/link'
import { AlertCircle, ArrowRight, RefreshCw, RotateCcw } from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Skeleton } from '@workspace/ui/components/skeleton'

import { useRefreshQueueSummary } from '@/hooks/use-seo-health.hook'

/**
 * Refresh queue at a glance (epic #144, #147): how many published posts are
 * flagged as decaying and the top candidates by score, linking to the queue.
 */
export function RefreshQueueCard() {
    const { data, isLoading, error, refetch } = useRefreshQueueSummary()

    const summary = data?.data

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                    <RotateCcw className='h-5 w-5 text-stone-500' />
                    Refresh Queue
                </CardTitle>
                <CardDescription>
                    Published posts flagged by decay detection, waiting for a
                    content refresh
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className='space-y-3'>
                        <Skeleton className='h-6 w-full' />
                        <Skeleton className='h-6 w-2/3' />
                    </div>
                ) : error ? (
                    <div className='flex flex-col items-center gap-3 py-6'>
                        <AlertCircle className='h-5 w-5 text-red-500' />
                        <p className='text-muted-foreground text-sm'>
                            Failed to load the refresh queue
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
                ) : (
                    <div className='space-y-4'>
                        <div className='flex items-end justify-between'>
                            <div>
                                <p className='text-2xl font-semibold'>
                                    {summary?.depth ?? 0}
                                </p>
                                <p className='text-muted-foreground text-xs'>
                                    Active candidates
                                </p>
                            </div>
                            {summary?.refreshMode === 'off' ? (
                                <Badge variant='outline'>Refresh off</Badge>
                            ) : (
                                <Badge variant='secondary'>
                                    {summary?.refreshMode}
                                </Badge>
                            )}
                        </div>

                        {summary && summary.top.length > 0 ? (
                            <ul className='space-y-2 border-t pt-3'>
                                {summary.top.map((entry) => (
                                    <li
                                        key={entry.id}
                                        className='flex items-center justify-between gap-3 text-sm'
                                    >
                                        <span className='truncate'>
                                            {entry.postTitle}
                                        </span>
                                        <span className='text-muted-foreground shrink-0 font-mono text-xs'>
                                            {entry.score.toFixed(1)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className='text-muted-foreground border-t pt-3 text-sm'>
                                {summary?.refreshMode === 'off'
                                    ? 'Enable content refresh in Blog → Settings to start detection.'
                                    : 'No decay detected — the queue is empty.'}
                            </p>
                        )}

                        <Button
                            asChild
                            variant='outline'
                            size='sm'
                            className='w-full'
                        >
                            <Link href='/blog/refresh'>
                                Open queue
                                <ArrowRight className='ml-2 h-3.5 w-3.5' />
                            </Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
