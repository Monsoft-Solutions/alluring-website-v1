'use client'

/**
 * Daily spend (bars) against paid leads (dots), with the day's combined
 * budget as a dashed step line and a marker on every day someone changed the
 * account — so "spend doubled on 14 Sep" sits next to "ads edited on 14 Sep".
 */
import { useMemo } from 'react'
import {
    Bar,
    CartesianGrid,
    ComposedChart,
    Line,
    ReferenceLine,
    ResponsiveContainer,
    Scatter,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

import type { AdsChangeMarker, AdsDailyPoint } from '@/lib/types/ads/ads.type'
import {
    formatConversions,
    formatCount,
    formatDay,
    formatMoney,
} from '@/lib/utils/ads/ads-format.util'

const COLORS = {
    bar: 'var(--gold-300)',
    lead: 'var(--stone-900)',
    budget: 'var(--gold-600)',
    marker: 'var(--stone-400)',
    grid: 'var(--stone-200)',
    tick: 'var(--stone-500)',
}

type ChartRow = AdsDailyPoint & {
    /** Leads as a dot height; null hides the dot on days without one. */
    leadDot: number | null
    marker?: AdsChangeMarker
}

type TooltipProps = {
    active?: boolean
    payload?: { payload?: ChartRow }[]
}

function SpendTooltip({ active, payload }: TooltipProps) {
    const row = payload?.[0]?.payload
    if (!active || !row) return null
    return (
        <div className='bg-card max-w-[260px] rounded-lg border px-3 py-2 text-xs shadow-md'>
            <p className='mb-1 font-semibold'>{formatDay(row.date)}</p>
            <dl className='grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 tabular-nums'>
                <dt className='text-muted-foreground'>Spend</dt>
                <dd>{formatMoney(row.cost)}</dd>
                <dt className='text-muted-foreground'>Clicks</dt>
                <dd>{formatCount(row.clicks)}</dd>
                <dt className='text-muted-foreground'>Paid leads</dt>
                <dd>{formatCount(row.leads)}</dd>
                <dt className='text-muted-foreground'>Google conv.</dt>
                <dd>{formatConversions(row.googleConversions)}</dd>
                {row.budget !== null && (
                    <>
                        <dt className='text-muted-foreground'>Budget</dt>
                        <dd>{formatMoney(row.budget)}</dd>
                    </>
                )}
            </dl>
            {row.marker && (
                <p className='text-muted-foreground mt-1.5 border-t pt-1.5'>
                    {row.marker.summary}
                </p>
            )}
        </div>
    )
}

export function AdsSpendChart({
    daily,
    markers,
    height = 260,
}: {
    daily: AdsDailyPoint[]
    markers: AdsChangeMarker[]
    height?: number
}) {
    const data = useMemo<ChartRow[]>(() => {
        const byDate = new Map(markers.map((marker) => [marker.date, marker]))
        return daily.map((day) => ({
            ...day,
            leadDot: day.leads > 0 ? day.leads : null,
            marker: byDate.get(day.date),
        }))
    }, [daily, markers])

    const maxLeads = Math.max(1, ...daily.map((day) => day.leads))

    return (
        <div>
            <ResponsiveContainer width='100%' height={height}>
                <ComposedChart
                    data={data}
                    margin={{ top: 12, right: 4, left: -8, bottom: 0 }}
                >
                    <CartesianGrid
                        strokeDasharray='3 3'
                        vertical={false}
                        stroke={COLORS.grid}
                    />
                    <XAxis
                        dataKey='date'
                        tickFormatter={formatDay}
                        tick={{ fontSize: 11, fill: COLORS.tick }}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={16}
                    />
                    <YAxis
                        yAxisId='spend'
                        tickFormatter={(value: number) => `$${value}`}
                        tick={{ fontSize: 11, fill: COLORS.tick }}
                        tickLine={false}
                        axisLine={false}
                        width={52}
                    />
                    <YAxis
                        yAxisId='leads'
                        orientation='right'
                        allowDecimals={false}
                        domain={[0, maxLeads + 1]}
                        tick={{ fontSize: 11, fill: COLORS.tick }}
                        tickLine={false}
                        axisLine={false}
                        width={24}
                    />
                    <Tooltip
                        content={<SpendTooltip />}
                        cursor={{ fill: 'var(--stone-100)' }}
                    />
                    {markers.map((marker) => (
                        <ReferenceLine
                            key={marker.date}
                            yAxisId='spend'
                            x={marker.date}
                            stroke={COLORS.marker}
                            strokeDasharray='2 3'
                            label={{
                                value: '◆',
                                position: 'top',
                                fill: COLORS.budget,
                                fontSize: 9,
                            }}
                        />
                    ))}
                    <Bar
                        yAxisId='spend'
                        dataKey='cost'
                        fill={COLORS.bar}
                        radius={[3, 3, 0, 0]}
                        maxBarSize={28}
                    />
                    <Line
                        yAxisId='spend'
                        dataKey='budget'
                        type='stepAfter'
                        stroke={COLORS.budget}
                        strokeDasharray='4 4'
                        strokeWidth={1.2}
                        dot={false}
                        connectNulls={false}
                        isAnimationActive={false}
                    />
                    <Scatter
                        yAxisId='leads'
                        dataKey='leadDot'
                        fill={COLORS.lead}
                        isAnimationActive={false}
                    />
                </ComposedChart>
            </ResponsiveContainer>
            <div className='text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 pt-2 text-xs'>
                <span className='inline-flex items-center gap-1.5'>
                    <i
                        className='inline-block h-2.5 w-2.5 rounded-sm'
                        style={{ background: COLORS.bar }}
                    />
                    Spend
                </span>
                <span className='inline-flex items-center gap-1.5'>
                    <i
                        className='inline-block h-2.5 w-2.5 rounded-full'
                        style={{ background: COLORS.lead }}
                    />
                    Paid leads (right axis)
                </span>
                <span className='inline-flex items-center gap-1.5'>
                    <i
                        className='inline-block h-0 w-3 border-t border-dashed'
                        style={{ borderColor: COLORS.budget }}
                    />
                    Daily budget
                </span>
                <span className='inline-flex items-center gap-1.5'>
                    <span style={{ color: COLORS.budget }}>◆</span>
                    Account changed
                </span>
            </div>
        </div>
    )
}
