/**
 * Autopilot Status Card (server component)
 *
 * Live status of the scheduled content loop: queue/draft counters, manual
 * triggers, and the recent run history with failure acknowledgment.
 *
 * @module components/blog/autopilot-status-card
 */
import { Badge } from '@workspace/ui/components/badge'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'

import { getBlogAiConfig } from '@/lib/queries/blog-ai-config.query'
import {
    getAutopilotStatusSummary,
    getRecentAutopilotRuns,
} from '@/lib/queries/autopilot-run.query'
import {
    AcknowledgeButton,
    RunNowButtons,
} from './autopilot-run-actions.component'

const STATUS_BADGE: Record<string, string> = {
    running: 'bg-amber-100 text-amber-800',
    completed: 'bg-emerald-100 text-emerald-800',
    skipped: 'bg-stone-100 text-stone-600',
    failed: 'bg-red-100 text-red-800',
}

function formatWhen(date: Date | null): string {
    if (!date) return '—'
    return new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date)
}

export async function AutopilotStatusCard() {
    const [config, summary, runs] = await Promise.all([
        getBlogAiConfig(),
        getAutopilotStatusSummary(),
        getRecentAutopilotRuns(10),
    ])

    const capReached = summary.draftsAwaitingReview >= config.autopilotDraftCap

    return (
        <Card>
            <CardHeader>
                <CardTitle>Autopilot Status</CardTitle>
                <CardDescription>
                    {config.autopilotMode === 'off'
                        ? 'Autopilot is off — nothing runs on a schedule.'
                        : `Running in ${config.autopilotMode} mode. Ideas ${config.autopilotIdeationCadence}, writing ${config.autopilotContentCadence}.`}{' '}
                    {config.refreshMode === 'off'
                        ? 'Refresh is off.'
                        : `Refresh in ${config.refreshMode} mode${
                              summary.lastRefreshRun
                                  ? ` — last run ${formatWhen(summary.lastRefreshRun.startedAt)}`
                                  : ''
                          }.`}
                </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
                {/* Counters */}
                <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
                    <div>
                        <p className='text-2xl font-semibold tabular-nums'>
                            {summary.draftsAwaitingReview}
                            <span className='text-muted-foreground text-sm font-normal'>
                                {' '}
                                / {config.autopilotDraftCap}
                            </span>
                        </p>
                        <p className='text-muted-foreground text-xs'>
                            Drafts awaiting review
                            {capReached ? ' — writing paused' : ''}
                        </p>
                    </div>
                    <div>
                        <p className='text-2xl font-semibold tabular-nums'>
                            {summary.pendingIdeas}
                        </p>
                        <p className='text-muted-foreground text-xs'>
                            Ideas awaiting approval
                        </p>
                    </div>
                    <div>
                        <p className='text-2xl font-semibold tabular-nums'>
                            {summary.approvedIdeas}
                        </p>
                        <p className='text-muted-foreground text-xs'>
                            Approved in writing queue
                        </p>
                    </div>
                    <div>
                        <p className='text-sm font-medium'>
                            {formatWhen(
                                summary.lastContentRun?.startedAt ?? null
                            )}
                        </p>
                        <p className='text-muted-foreground text-xs'>
                            Last writing run
                        </p>
                    </div>
                </div>

                {/* Unacknowledged failures block the loop */}
                {summary.unacknowledgedFailures.length > 0 && (
                    <div className='space-y-2 rounded-md border border-red-200 bg-red-50 p-3'>
                        <p className='text-sm font-medium text-red-800'>
                            Autopilot is paused: a run failed and needs
                            acknowledgment.
                        </p>
                        {summary.unacknowledgedFailures.map((run) => (
                            <div
                                key={run.id}
                                className='flex items-center justify-between gap-3'
                            >
                                <p className='min-w-0 flex-1 truncate text-xs text-red-700'>
                                    {run.kind} · {formatWhen(run.startedAt)} ·{' '}
                                    {run.error ?? 'Unknown error'}
                                </p>
                                <AcknowledgeButton runId={run.id} />
                            </div>
                        ))}
                    </div>
                )}

                <RunNowButtons />

                {/* Recent runs */}
                <div>
                    <p className='mb-2 text-sm font-medium'>Recent runs</p>
                    {runs.length === 0 ? (
                        <p className='text-muted-foreground text-sm'>
                            No runs yet. Runs appear here once a schedule fires
                            or you trigger one manually.
                        </p>
                    ) : (
                        <div className='divide-y rounded-md border'>
                            {runs.map((run) => (
                                <div
                                    key={run.id}
                                    className='flex items-center gap-3 px-3 py-2 text-sm'
                                >
                                    <Badge
                                        className={`${STATUS_BADGE[run.status] ?? ''} shrink-0 px-1.5 py-0 text-[10px] capitalize hover:bg-inherit`}
                                    >
                                        {run.status}
                                    </Badge>
                                    <span className='text-muted-foreground shrink-0 text-xs capitalize'>
                                        {run.kind}
                                    </span>
                                    <span className='min-w-0 flex-1 truncate text-xs'>
                                        {run.topicTitle ??
                                            run.skipReason ??
                                            run.error ??
                                            '—'}
                                    </span>
                                    {run.qualityScore !== null && (
                                        <span className='text-muted-foreground shrink-0 text-xs tabular-nums'>
                                            {run.qualityScore}/100
                                        </span>
                                    )}
                                    <span className='text-muted-foreground shrink-0 text-xs'>
                                        {formatWhen(run.startedAt)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
