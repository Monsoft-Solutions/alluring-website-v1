'use client'

import { useMemo, useState } from 'react'
import {
    Area,
    AreaChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import { format } from 'date-fns'

import { Button } from '@workspace/ui/components/button'

import { resolveSeriesColor } from '@/lib/analytics/series-colors'
import type {
    ChartMode,
    Granularity,
    TrendPipelineOutput,
} from '@/lib/types/analytics/lead-trends.type'

import { LeadTrendsLegend } from './lead-trends-legend.component'
import { LeadTrendsTooltip } from './lead-trends-tooltip.component'

type RechartsTooltipProps = {
    active?: boolean
    payload?: { name?: string | number; value?: number; color?: string }[]
    label?: string | number
}

type OurTooltipPayloadItem = { name: string; value: number; color: string }

function mapRechartsTooltipProps(input: unknown): {
    active?: boolean
    payload?: OurTooltipPayloadItem[]
    label?: string | number
} {
    const { active, payload, label } = input as RechartsTooltipProps
    const mapped: OurTooltipPayloadItem[] | undefined = payload?.map((p) => ({
        name: String(p.name ?? ''),
        value: typeof p.value === 'number' ? p.value : 0,
        color: p.color ?? '#78716c',
    }))
    return { active, payload: mapped, label }
}

type Props = {
    trend: TrendPipelineOutput
    granularity: Granularity
}

export function LeadTrendsChart({ trend, granularity }: Props) {
    const [mode, setMode] = useState<ChartMode>('stacked')
    const [hidden, setHidden] = useState<Set<string>>(new Set())

    const data = useMemo(
        () =>
            trend.buckets.map((b) => {
                const row: Record<string, number | string> = { ts: b.ts }
                for (const key of trend.seriesKeys) {
                    row[key] = b.series[key] ?? 0
                }
                return row
            }),
        [trend]
    )

    const visibleKeys = useMemo(
        () => trend.seriesKeys.filter((k) => !hidden.has(k)),
        [trend.seriesKeys, hidden]
    )

    const handleToggle = (key: string, shiftKey: boolean) => {
        setHidden((prev) => {
            const next = new Set(prev)
            if (shiftKey) {
                // Shift-click: isolate this key. If only this key is visible,
                // restore all.
                const onlyThisVisible =
                    visibleKeys.length === 1 && visibleKeys[0] === key
                if (onlyThisVisible) return new Set()
                for (const k of trend.seriesKeys) {
                    if (k !== key) next.add(k)
                    else next.delete(k)
                }
                return next
            }
            if (next.has(key)) next.delete(key)
            else next.add(key)
            return next
        })
    }

    const xTickFormatter = (value: string) => {
        const d = new Date(value)
        switch (granularity) {
            case 'hour':
                return format(d, 'ha')
            case 'day':
                return format(d, 'MMM d')
            case 'week':
                return format(d, 'MMM d')
        }
    }

    return (
        <div>
            <div className='flex items-center justify-end gap-1 pb-2'>
                <Button
                    size='sm'
                    variant={mode === 'stacked' ? 'default' : 'outline'}
                    onClick={() => setMode('stacked')}
                >
                    Stacked
                </Button>
                <Button
                    size='sm'
                    variant={mode === 'line' ? 'default' : 'outline'}
                    onClick={() => setMode('line')}
                >
                    Line
                </Button>
            </div>

            <ResponsiveContainer width='100%' height={400}>
                {mode === 'stacked' ? (
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                        <CartesianGrid
                            strokeDasharray='3 3'
                            vertical={false}
                            stroke='#e7e5e4'
                        />
                        <XAxis
                            dataKey='ts'
                            tick={{ fontSize: 11, fill: '#78716c' }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={xTickFormatter}
                            interval='preserveStartEnd'
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: '#78716c' }}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                        />
                        <Tooltip
                            content={(props) => (
                                <LeadTrendsTooltip
                                    {...mapRechartsTooltipProps(props)}
                                    granularity={granularity}
                                />
                            )}
                        />
                        {visibleKeys.map((key) => {
                            const { color, opacity } = resolveSeriesColor(key)
                            return (
                                <Area
                                    key={key}
                                    dataKey={key}
                                    stackId='1'
                                    type='monotone'
                                    stroke={color}
                                    fill={color}
                                    fillOpacity={opacity * 0.45}
                                    strokeWidth={1.5}
                                />
                            )
                        })}
                    </AreaChart>
                ) : (
                    <LineChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                        <CartesianGrid
                            strokeDasharray='3 3'
                            vertical={false}
                            stroke='#e7e5e4'
                        />
                        <XAxis
                            dataKey='ts'
                            tick={{ fontSize: 11, fill: '#78716c' }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={xTickFormatter}
                            interval='preserveStartEnd'
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: '#78716c' }}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                        />
                        <Tooltip
                            content={(props) => (
                                <LeadTrendsTooltip
                                    {...mapRechartsTooltipProps(props)}
                                    granularity={granularity}
                                />
                            )}
                        />
                        {visibleKeys.map((key) => {
                            const { color, opacity } = resolveSeriesColor(key)
                            return (
                                <Line
                                    key={key}
                                    dataKey={key}
                                    type='monotone'
                                    stroke={color}
                                    strokeOpacity={opacity}
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 4 }}
                                />
                            )
                        })}
                    </LineChart>
                )}
            </ResponsiveContainer>

            <LeadTrendsLegend
                seriesKeys={trend.seriesKeys}
                hiddenKeys={hidden}
                onToggle={handleToggle}
            />
        </div>
    )
}
