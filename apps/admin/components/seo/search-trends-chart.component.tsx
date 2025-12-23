'use client'

import { TrendingUp, AlertCircle, RefreshCw } from 'lucide-react'
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
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Button } from '@workspace/ui/components/button'

import { useSearchConsoleTrends } from '@/hooks/use-search-console.hook'
import type { SearchTrend } from '@/lib/types/search-console/search-console.type'

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

type SearchTrendsChartCardProps = {
    days?: number
}

/**
 * Search trends chart displaying clicks and impressions over time.
 */
export function SearchTrendsChartCard({
    days = 28,
}: SearchTrendsChartCardProps) {
    const { data, isLoading, error, refetch } = useSearchConsoleTrends(days)

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                    <TrendingUp className='h-5 w-5' />
                    Search Performance Trend
                </CardTitle>
                <CardDescription>
                    Clicks and impressions over the last {days} days
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className='h-[280px] w-full' />
                ) : error ? (
                    <div className='flex h-[280px] flex-col items-center justify-center gap-3'>
                        <AlertCircle className='h-5 w-5 text-red-500' />
                        <p className='text-muted-foreground text-sm'>
                            Failed to load chart
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
                ) : data?.data && data.data.length > 0 ? (
                    <SearchTrendsChart data={data.data} />
                ) : (
                    <div className='flex h-[280px] items-center justify-center'>
                        <p className='text-muted-foreground text-sm'>
                            No trend data yet
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

type SearchTrendsChartProps = {
    data: SearchTrend[]
}

function SearchTrendsChart({ data }: SearchTrendsChartProps) {
    const formattedData = data.map((item) => ({
        ...item,
        formattedDate: formatDate(item.date),
    }))

    return (
        <ResponsiveContainer width='100%' height={280}>
            <AreaChart
                data={formattedData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
                <defs>
                    <linearGradient
                        id='clicksGradient'
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
                        id='impressionsGradient'
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
                    tick={{ fontSize: 11, fill: '#78716c' }}
                    tickLine={false}
                    axisLine={false}
                    interval='preserveStartEnd'
                />
                <YAxis
                    tick={{ fontSize: 11, fill: '#78716c' }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                />
                <Tooltip
                    content={({ active, payload }) => {
                        if (!active || !payload?.length || !payload[0])
                            return null
                        const item = payload[0] as {
                            payload: SearchTrend & { formattedDate: string }
                        }
                        const data = item.payload
                        return (
                            <div className='rounded-lg border bg-white px-3 py-2 shadow-sm'>
                                <p className='text-muted-foreground text-xs'>
                                    {formatFullDate(data.date)}
                                </p>
                                <p className='font-medium'>
                                    {data.clicks.toLocaleString()} clicks
                                </p>
                                <p className='text-muted-foreground text-sm'>
                                    {data.impressions.toLocaleString()}{' '}
                                    impressions
                                </p>
                                <p className='text-muted-foreground text-xs'>
                                    CTR: {(data.ctr * 100).toFixed(2)}% •
                                    Position: {data.position.toFixed(1)}
                                </p>
                            </div>
                        )
                    }}
                />
                <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType='circle'
                    iconSize={8}
                />
                <Area
                    type='monotone'
                    dataKey='clicks'
                    name='Clicks'
                    stroke={COLORS.clicks}
                    strokeWidth={2}
                    fill='url(#clicksGradient)'
                />
                <Area
                    type='monotone'
                    dataKey='impressions'
                    name='Impressions'
                    stroke={COLORS.impressions}
                    strokeWidth={2}
                    fill='url(#impressionsGradient)'
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}
