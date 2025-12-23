'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Legend,
} from 'recharts'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Button } from '@workspace/ui/components/button'

import { useQueryTrend } from '@/hooks/use-search-console.hook'
import type { QueryTrendData } from '@/lib/types/search-console/search-console.type'

const COLORS = {
    clicks: '#78716c',
    impressions: '#d4a574',
}

/**
 * Format date for display in chart
 */
function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Format full date for tooltip
 */
function formatFullDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

type QueryTrendChartProps = {
    /** The query to show trend for */
    query: string
    /** Number of days to analyze */
    days?: number
    /** Height of the chart */
    height?: number
}

/**
 * Trend chart for a specific query showing clicks and impressions over time.
 * Shared component for use in query detail views.
 */
export function QueryTrendChart({
    query,
    days = 28,
    height = 200,
}: QueryTrendChartProps) {
    const { data, isLoading, error, refetch } = useQueryTrend(query, days)

    if (isLoading) {
        return <Skeleton className='w-full' style={{ height }} />
    }

    if (error) {
        return (
            <div
                className='flex flex-col items-center justify-center gap-3'
                style={{ height }}
            >
                <AlertCircle className='h-5 w-5 text-red-500' />
                <p className='text-muted-foreground text-sm'>
                    Failed to load trend
                </p>
                <Button variant='outline' size='sm' onClick={() => refetch()}>
                    <RefreshCw className='mr-2 h-4 w-4' />
                    Retry
                </Button>
            </div>
        )
    }

    if (!data?.data || data.data.length === 0) {
        return (
            <div
                className='flex items-center justify-center'
                style={{ height }}
            >
                <p className='text-muted-foreground text-sm'>
                    No trend data available
                </p>
            </div>
        )
    }

    return <TrendChart data={data.data} height={height} />
}

type TrendChartProps = {
    data: QueryTrendData[]
    height: number
}

function TrendChart({ data, height }: TrendChartProps) {
    const formattedData = data.map((item) => ({
        ...item,
        formattedDate: formatDate(item.date),
    }))

    return (
        <ResponsiveContainer width='100%' height={height}>
            <AreaChart
                data={formattedData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
                <defs>
                    <linearGradient
                        id='queryClicksGradient'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'
                    >
                        <stop
                            offset='5%'
                            stopColor={COLORS.clicks}
                            stopOpacity={0.3}
                        />
                        <stop
                            offset='95%'
                            stopColor={COLORS.clicks}
                            stopOpacity={0}
                        />
                    </linearGradient>
                    <linearGradient
                        id='queryImpressionsGradient'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'
                    >
                        <stop
                            offset='5%'
                            stopColor={COLORS.impressions}
                            stopOpacity={0.3}
                        />
                        <stop
                            offset='95%'
                            stopColor={COLORS.impressions}
                            stopOpacity={0}
                        />
                    </linearGradient>
                </defs>
                <CartesianGrid
                    strokeDasharray='3 3'
                    vertical={false}
                    stroke='#e7e5e4'
                />
                <XAxis
                    dataKey='formattedDate'
                    tick={{ fontSize: 10, fill: '#78716c' }}
                    tickLine={false}
                    axisLine={false}
                    interval='preserveStartEnd'
                />
                <YAxis
                    tick={{ fontSize: 10, fill: '#78716c' }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    width={40}
                />
                <Tooltip
                    content={({ active, payload }) => {
                        if (!active || !payload?.length || !payload[0])
                            return null
                        const item = payload[0] as {
                            payload: QueryTrendData & { formattedDate: string }
                        }
                        const d = item.payload
                        return (
                            <div className='rounded-lg border bg-white px-3 py-2 shadow-sm'>
                                <p className='text-muted-foreground text-xs'>
                                    {formatFullDate(d.date)}
                                </p>
                                <p className='font-medium'>
                                    {d.clicks.toLocaleString()} clicks
                                </p>
                                <p className='text-muted-foreground text-sm'>
                                    {d.impressions.toLocaleString()} impressions
                                </p>
                                <p className='text-muted-foreground text-xs'>
                                    CTR: {(d.ctr * 100).toFixed(2)}% • Position:{' '}
                                    {d.position.toFixed(1)}
                                </p>
                            </div>
                        )
                    }}
                />
                <Legend iconType='circle' iconSize={8} />
                <Area
                    type='monotone'
                    dataKey='clicks'
                    name='Clicks'
                    stroke={COLORS.clicks}
                    strokeWidth={2}
                    fill='url(#queryClicksGradient)'
                />
                <Area
                    type='monotone'
                    dataKey='impressions'
                    name='Impressions'
                    stroke={COLORS.impressions}
                    strokeWidth={2}
                    fill='url(#queryImpressionsGradient)'
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}
