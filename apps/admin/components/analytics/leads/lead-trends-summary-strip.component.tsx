'use client'

import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'

import { Card, CardContent } from '@workspace/ui/components/card'

import type {
    BreakdownBy,
    LeadTrendsSummary,
} from '@/lib/types/analytics/lead-trends.type'

const BREAKDOWN_LABEL: Record<BreakdownBy, string> = {
    source: 'Top source',
    medium: 'Top medium',
    sourceMedium: 'Top source / medium',
}

type Props = {
    summary: LeadTrendsSummary
    breakdownBy: BreakdownBy
    priorWindowLabel: string // e.g. "previous 28 days"
}

export function LeadTrendsSummaryStrip({
    summary,
    breakdownBy,
    priorWindowLabel,
}: Props) {
    return (
        <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
            <SummaryTile
                label='Total leads'
                value={summary.total.toLocaleString()}
                subline='in selected range'
            />
            <SummaryTile
                label={BREAKDOWN_LABEL[breakdownBy]}
                value={summary.topSeries?.key ?? '—'}
                subline={
                    summary.topSeries
                        ? `${summary.topSeries.count.toLocaleString()} leads (${Math.round(
                              (summary.topSeries.count /
                                  Math.max(summary.total, 1)) *
                                  100
                          )}%)`
                        : 'no data'
                }
            />
            <DeltaTile
                percent={summary.priorDelta.percent}
                subline={`vs ${priorWindowLabel}`}
            />
            <SummaryTile
                label='Classified'
                value={
                    summary.total > 0
                        ? `${Math.round(
                              (1 - summary.unclassifiedRatio) * 100
                          )}%`
                        : '—'
                }
                subline={`${summary.unclassifiedCount.toLocaleString()} direct (unclassified)`}
            />
        </div>
    )
}

function SummaryTile({
    label,
    value,
    subline,
}: {
    label: string
    value: string
    subline: string
}) {
    return (
        <Card>
            <CardContent className='p-4'>
                <p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
                    {label}
                </p>
                <p className='mt-1 font-serif text-2xl leading-tight'>
                    {value}
                </p>
                <p className='text-muted-foreground mt-1 text-xs'>{subline}</p>
            </CardContent>
        </Card>
    )
}

function DeltaTile({
    percent,
    subline,
}: {
    percent: number | null
    subline: string
}) {
    if (percent === null) {
        return <SummaryTile label='vs prior' value='—' subline={subline} />
    }
    const Icon =
        percent > 0 ? ArrowUpRight : percent < 0 ? ArrowDownRight : Minus
    const colorClass =
        percent > 0
            ? 'text-emerald-600'
            : percent < 0
              ? 'text-rose-600'
              : 'text-muted-foreground'
    const label = `${percent > 0 ? '+' : ''}${Math.round(percent * 100)}%`
    return (
        <Card>
            <CardContent className='p-4'>
                <p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
                    Change
                </p>
                <p
                    className={`mt-1 flex items-center gap-1 font-serif text-2xl leading-tight ${colorClass}`}
                >
                    <Icon className='h-5 w-5' />
                    {label}
                </p>
                <p className='text-muted-foreground mt-1 text-xs'>{subline}</p>
            </CardContent>
        </Card>
    )
}
