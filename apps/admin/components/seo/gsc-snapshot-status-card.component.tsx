'use client'

import { AlertCircle, Database, RefreshCw } from 'lucide-react'
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

import {
    useRunSnapshotSync,
    useSnapshotStatus,
} from '@/hooks/use-seo-health.hook'

/**
 * GSC snapshot health: how much Search Console history we own locally
 * (epic #144, #145) and how the last sync went, with a manual sync trigger.
 */
export function GscSnapshotStatusCard() {
    const { data, isLoading, error, refetch } = useSnapshotStatus()
    const runSync = useRunSnapshotSync()

    const status = data?.data

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                    <Database className='h-5 w-5 text-stone-500' />
                    GSC Snapshots
                </CardTitle>
                <CardDescription>
                    Daily Search Console history stored locally — escapes the
                    16-month retention wall
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
                            Failed to load snapshot status
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
                        <div className='grid grid-cols-3 gap-4'>
                            <div>
                                <p className='text-2xl font-semibold'>
                                    {status?.coveredDays ?? 0}
                                </p>
                                <p className='text-muted-foreground text-xs'>
                                    Days covered
                                </p>
                            </div>
                            <div>
                                <p className='text-2xl font-semibold'>
                                    {(status?.totalRows ?? 0).toLocaleString()}
                                </p>
                                <p className='text-muted-foreground text-xs'>
                                    Query/page rows
                                </p>
                            </div>
                            <div>
                                <p className='text-2xl font-semibold'>
                                    {status?.latestDate ?? '—'}
                                </p>
                                <p className='text-muted-foreground text-xs'>
                                    Newest date
                                </p>
                            </div>
                        </div>

                        <div className='flex items-center justify-between border-t pt-4'>
                            <div className='flex items-center gap-2 text-sm'>
                                {status?.lastRun ? (
                                    <>
                                        <Badge
                                            variant={
                                                status.lastRun.status ===
                                                'completed'
                                                    ? 'secondary'
                                                    : status.lastRun.status ===
                                                        'failed'
                                                      ? 'destructive'
                                                      : 'outline'
                                            }
                                        >
                                            {status.lastRun.status}
                                        </Badge>
                                        <span className='text-muted-foreground'>
                                            Last sync ({status.lastRun.trigger}
                                            ): {status.lastRun.datesPulled}{' '}
                                            {status.lastRun.datesPulled === 1
                                                ? 'day'
                                                : 'days'}
                                            , {status.lastRun.rowsUpserted ?? 0}{' '}
                                            rows
                                        </span>
                                    </>
                                ) : (
                                    <span className='text-muted-foreground'>
                                        No sync has run yet — the daily cron
                                        starts at 06:00 UTC, or sync now
                                    </span>
                                )}
                            </div>
                            <Button
                                variant='outline'
                                size='sm'
                                disabled={runSync.isPending}
                                onClick={() => runSync.mutate()}
                            >
                                <RefreshCw
                                    className={`mr-2 h-4 w-4 ${runSync.isPending ? 'animate-spin' : ''}`}
                                />
                                {runSync.isPending ? 'Syncing…' : 'Sync now'}
                            </Button>
                        </div>

                        {status?.lastRun?.error ? (
                            <p className='text-sm text-red-600'>
                                {status.lastRun.error}
                            </p>
                        ) : null}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
