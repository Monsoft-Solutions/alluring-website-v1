/**
 * Refresh Signal Badges
 *
 * Server-rendered presentation of a candidate's detection signals with
 * their triggering metrics (issue #147's acceptance surface: the metric
 * that queued a post is visible in the UI).
 *
 * @module components/blog/refresh/refresh-signal-badges
 */
import { Badge } from '@workspace/ui/components/badge'
import type { RefreshSignal } from '@workspace/db/types'

const SOURCE_LABELS: Record<RefreshSignal['source'], string> = {
    'position-drop': 'Position drop',
    'ctr-gap': 'CTR gap',
    'stale-age': 'Stale',
    cannibalization: 'Cannibalization',
    'ideation-gate': 'Ideation gate',
    manual: 'Manual',
}

/** One human sentence per signal, from its triggering metrics. */
function describeSignal(signal: RefreshSignal): string {
    const metrics = signal.metrics
    switch (signal.source) {
        case 'position-drop':
            return `−${metrics.driftAdjustedDrop} spots over 28d (${Number(metrics.impressions).toLocaleString()} impressions, ${metrics.windowStart} → ${metrics.windowEnd})`
        case 'ctr-gap':
            return `CTR ${(Number(metrics.ctr) * 100).toFixed(1)}% vs ${(Number(metrics.expectedCtr) * 100).toFixed(1)}% expected at position ${metrics.position}`
        case 'stale-age':
            return `${metrics.ageMonths} months since the last touch`
        case 'cannibalization':
            return `Splits “${metrics.query}” — should consolidate into ${metrics.ownerUrl}`
        case 'ideation-gate':
            return `Search demand behind “${metrics.topicTitle}” belongs to this post`
        case 'manual':
            return 'Queued by an admin'
    }
}

export function RefreshSignalBadges({ sources }: { sources: RefreshSignal[] }) {
    return (
        <div className='flex flex-col gap-1.5'>
            {sources.map((signal) => (
                <div
                    key={signal.source}
                    className='flex items-start gap-2 text-xs'
                >
                    <Badge
                        variant={
                            signal.source === 'manual' ? 'default' : 'secondary'
                        }
                        className='shrink-0'
                    >
                        {SOURCE_LABELS[signal.source]}
                    </Badge>
                    <span className='text-muted-foreground pt-0.5'>
                        {describeSignal(signal)}
                    </span>
                </div>
            ))}
        </div>
    )
}
