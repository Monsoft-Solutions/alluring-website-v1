/**
 * Refresh Queue Page
 *
 * Active refresh candidates (epic #144, #147): which published posts are
 * decaying, why (each signal with its triggering metric), and in what
 * priority order. Running a refresh from here arrives with Phase 4 (#148);
 * until then the queue supports manual queueing, dismissal, and on-demand
 * detection.
 *
 * @module app/(dashboard)/blog/refresh/page
 */
import { Badge } from '@workspace/ui/components/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table'

import { getBlogAiConfig } from '@/lib/queries/blog-ai-config.query'
import {
    getPostsAvailableForRefresh,
    getRefreshQueue,
} from '@/lib/queries/content-refresh.query'
import {
    DismissCandidateButton,
    QueuePostForm,
    RunDetectionButton,
} from '@/components/blog/refresh/refresh-queue-actions.component'
import { RefreshSignalBadges } from '@/components/blog/refresh/refresh-signal-badges.component'

export const dynamic = 'force-dynamic'
// The detect-now server action runs on this route segment; detection is a
// handful of SQL aggregates but gets the same generous budget as the other
// job-triggering pages.
export const maxDuration = 300

const STATUS_LABELS: Record<string, string> = {
    pending: 'Pending',
    in_progress: 'Refreshing',
    ready_for_review: 'Ready for review',
}

/** Whole days since an ISO timestamp (server-rendered per request). */
function daysSince(iso: string): number {
    return Math.floor(
        (Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000)
    )
}

export default async function RefreshQueuePage() {
    const [queue, availablePosts, config] = await Promise.all([
        getRefreshQueue(),
        getPostsAvailableForRefresh(),
        getBlogAiConfig(),
    ])

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex flex-wrap items-start justify-between gap-4'>
                <div>
                    <h1 className='text-2xl font-semibold'>Refresh Queue</h1>
                    <p className='text-muted-foreground'>
                        Published posts whose search performance is decaying,
                        prioritized by impact. Signals come from the daily decay
                        detection, the weekly cannibalization report, the
                        ideation gate and manual requests.
                    </p>
                </div>
                <div className='flex flex-wrap items-center gap-2'>
                    <RunDetectionButton
                        disabled={config.refreshMode === 'off'}
                    />
                    <QueuePostForm posts={availablePosts} />
                </div>
            </div>

            {config.refreshMode === 'off' ? (
                <div className='rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200'>
                    Content refresh is off — detection queues nothing. Enable it
                    under Blog → Settings → Content Refresh.
                </div>
            ) : null}

            {queue.length === 0 ? (
                <div className='text-muted-foreground rounded-md border border-dashed p-10 text-center text-sm'>
                    The queue is empty. Detection runs daily at 06:40 UTC once
                    due, or run it now.
                </div>
            ) : (
                <div className='rounded-md border'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Post</TableHead>
                                <TableHead>Signals</TableHead>
                                <TableHead className='w-20 text-right'>
                                    Score
                                </TableHead>
                                <TableHead className='w-20 text-right'>
                                    Age
                                </TableHead>
                                <TableHead className='w-36'>Status</TableHead>
                                <TableHead className='w-28' />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {queue.map((entry) => {
                                const ageDays = daysSince(entry.createdAt)
                                return (
                                    <TableRow key={entry.id}>
                                        <TableCell className='align-top'>
                                            <p className='font-medium'>
                                                {entry.postTitle}
                                            </p>
                                            {entry.postSlug ? (
                                                <p className='text-muted-foreground text-xs'>
                                                    /{entry.postSlug}
                                                </p>
                                            ) : null}
                                        </TableCell>
                                        <TableCell className='align-top'>
                                            <RefreshSignalBadges
                                                sources={entry.sources}
                                            />
                                        </TableCell>
                                        <TableCell className='text-right align-top font-mono text-sm'>
                                            {entry.score.toFixed(1)}
                                        </TableCell>
                                        <TableCell className='text-muted-foreground text-right align-top text-sm'>
                                            {ageDays}d
                                        </TableCell>
                                        <TableCell className='align-top'>
                                            <Badge
                                                variant={
                                                    entry.status === 'pending'
                                                        ? 'outline'
                                                        : 'secondary'
                                                }
                                            >
                                                {STATUS_LABELS[entry.status] ??
                                                    entry.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className='text-right align-top'>
                                            {entry.status === 'pending' ? (
                                                <DismissCandidateButton
                                                    id={entry.id}
                                                />
                                            ) : null}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}
