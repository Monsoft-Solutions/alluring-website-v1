/**
 * Analytics Chart Components
 *
 * Chart components for the analytics dashboard.
 *
 * @module components/charts/analytics-charts
 */
'use client'

import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    Cell,
    CartesianGrid,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Legend,
} from 'recharts'

import type {
    DailyViewCount,
    TopPage,
    TrafficSource,
    DeviceStats,
    BrowserStats,
    GeoStats,
} from '@/lib/types/analytics.type'

// ============================================================================
// Color Palette
// ============================================================================

const COLORS = {
    primary: '#78716c',
    primaryLight: '#a8a29e',
    accent: '#d4a574',
    desktop: '#78716c',
    mobile: '#d4a574',
    tablet: '#a8a29e',
    unknown: '#e7e5e4',
}

const PIE_COLORS = ['#78716c', '#d4a574', '#a8a29e', '#e7e5e4', '#57534e']

// ============================================================================
// Page Views Over Time Chart
// ============================================================================

type PageViewsChartProps = {
    data: DailyViewCount[]
}

export function PageViewsChart({ data }: PageViewsChartProps) {
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
                        id='viewsGradient'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'
                    >
                        <stop
                            offset='5%'
                            stopColor={COLORS.primary}
                            stopOpacity={0.3}
                        />
                        <stop
                            offset='95%'
                            stopColor={COLORS.primary}
                            stopOpacity={0}
                        />
                    </linearGradient>
                    <linearGradient
                        id='sessionsGradient'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'
                    >
                        <stop
                            offset='5%'
                            stopColor={COLORS.accent}
                            stopOpacity={0.3}
                        />
                        <stop
                            offset='95%'
                            stopColor={COLORS.accent}
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
                        if (!active || !payload?.length) return null
                        const data = payload[0]?.payload as DailyViewCount & {
                            formattedDate: string
                        }
                        return (
                            <div className='rounded-lg border bg-white px-3 py-2 shadow-sm'>
                                <p className='text-muted-foreground text-xs'>
                                    {formatFullDate(data.date)}
                                </p>
                                <p className='font-medium'>
                                    {data.views.toLocaleString()} page views
                                </p>
                                <p className='text-muted-foreground text-sm'>
                                    {data.sessions.toLocaleString()} sessions
                                </p>
                            </div>
                        )
                    }}
                />
                <Legend
                    verticalAlign='top'
                    height={36}
                    formatter={(value) =>
                        value === 'views' ? 'Page Views' : 'Sessions'
                    }
                />
                <Area
                    type='monotone'
                    dataKey='views'
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    fill='url(#viewsGradient)'
                />
                <Area
                    type='monotone'
                    dataKey='sessions'
                    stroke={COLORS.accent}
                    strokeWidth={2}
                    fill='url(#sessionsGradient)'
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}

// ============================================================================
// Top Pages Bar Chart
// ============================================================================

type TopPagesChartProps = {
    data: TopPage[]
}

export function TopPagesChart({ data }: TopPagesChartProps) {
    const formattedData = data.map((item) => ({
        ...item,
        displayPath:
            item.pagePath.length > 30
                ? item.pagePath.slice(0, 30) + '...'
                : item.pagePath,
    }))

    return (
        <ResponsiveContainer width='100%' height={280}>
            <BarChart
                data={formattedData}
                layout='vertical'
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
                <CartesianGrid
                    strokeDasharray='3 3'
                    horizontal={true}
                    vertical={false}
                    stroke='#e7e5e4'
                />
                <XAxis
                    type='number'
                    tick={{ fontSize: 11, fill: '#78716c' }}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    type='category'
                    dataKey='displayPath'
                    tick={{ fontSize: 11, fill: '#78716c' }}
                    tickLine={false}
                    axisLine={false}
                    width={120}
                />
                <Tooltip
                    content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        const data = payload[0]?.payload as TopPage
                        return (
                            <div className='rounded-lg border bg-white px-3 py-2 shadow-sm'>
                                <p className='mb-1 max-w-[250px] truncate font-medium'>
                                    {data.pageTitle ?? data.pagePath}
                                </p>
                                <p className='text-muted-foreground text-xs'>
                                    {data.pagePath}
                                </p>
                                <p className='mt-1 text-sm'>
                                    {data.views.toLocaleString()} views
                                </p>
                                <p className='text-muted-foreground text-xs'>
                                    {data.uniqueSessions.toLocaleString()}{' '}
                                    unique sessions
                                </p>
                            </div>
                        )
                    }}
                />
                <Bar
                    dataKey='views'
                    fill={COLORS.primary}
                    radius={[0, 4, 4, 0]}
                >
                    {formattedData.map((_, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={index === 0 ? COLORS.accent : COLORS.primary}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
}

// ============================================================================
// Traffic Sources Chart
// ============================================================================

type TrafficSourcesChartProps = {
    data: TrafficSource[]
}

export function TrafficSourcesChart({ data }: TrafficSourcesChartProps) {
    return (
        <ResponsiveContainer width='100%' height={280}>
            <BarChart
                data={data}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
                <CartesianGrid
                    strokeDasharray='3 3'
                    vertical={false}
                    stroke='#e7e5e4'
                />
                <XAxis
                    dataKey='source'
                    tick={{ fontSize: 11, fill: '#78716c' }}
                    tickLine={false}
                    axisLine={false}
                    angle={-45}
                    textAnchor='end'
                    height={60}
                />
                <YAxis
                    tick={{ fontSize: 11, fill: '#78716c' }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                />
                <Tooltip
                    content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        const data = payload[0]?.payload as TrafficSource
                        return (
                            <div className='rounded-lg border bg-white px-3 py-2 shadow-sm'>
                                <p className='font-medium'>{data.source}</p>
                                <p className='text-sm'>
                                    {data.views.toLocaleString()} views
                                </p>
                                <p className='text-muted-foreground text-xs'>
                                    {data.sessions.toLocaleString()} sessions
                                </p>
                            </div>
                        )
                    }}
                />
                <Bar
                    dataKey='views'
                    fill={COLORS.primary}
                    radius={[4, 4, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    )
}

// ============================================================================
// Device Breakdown Pie Chart
// ============================================================================

type DeviceChartProps = {
    data: DeviceStats[]
}

export function DeviceChart({ data }: DeviceChartProps) {
    const getDeviceColor = (deviceType: string): string => {
        switch (deviceType.toLowerCase()) {
            case 'desktop':
                return COLORS.desktop
            case 'mobile':
                return COLORS.mobile
            case 'tablet':
                return COLORS.tablet
            default:
                return COLORS.unknown
        }
    }

    return (
        <ResponsiveContainer width='100%' height={200}>
            <PieChart>
                <Pie
                    data={data}
                    cx='50%'
                    cy='50%'
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey='views'
                    nameKey='deviceType'
                    labelLine={false}
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={getDeviceColor(entry.deviceType)}
                        />
                    ))}
                </Pie>
                <Tooltip
                    content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        const data = payload[0]?.payload as DeviceStats
                        return (
                            <div className='rounded-lg border bg-white px-3 py-2 shadow-sm'>
                                <p className='font-medium capitalize'>
                                    {data.deviceType}
                                </p>
                                <p className='text-sm'>
                                    {data.views.toLocaleString()} views (
                                    {data.percentage}%)
                                </p>
                            </div>
                        )
                    }}
                />
                <Legend
                    verticalAlign='bottom'
                    height={36}
                    formatter={(value) => (
                        <span className='text-xs capitalize'>{value}</span>
                    )}
                />
            </PieChart>
        </ResponsiveContainer>
    )
}

// ============================================================================
// Browser Breakdown Chart
// ============================================================================

type BrowserChartProps = {
    data: BrowserStats[]
}

export function BrowserChart({ data }: BrowserChartProps) {
    return (
        <ResponsiveContainer width='100%' height={200}>
            <PieChart>
                <Pie
                    data={data}
                    cx='50%'
                    cy='50%'
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey='views'
                    nameKey='browser'
                    labelLine={false}
                >
                    {data.map((_, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                    ))}
                </Pie>
                <Tooltip
                    content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        const data = payload[0]?.payload as BrowserStats
                        return (
                            <div className='rounded-lg border bg-white px-3 py-2 shadow-sm'>
                                <p className='font-medium'>{data.browser}</p>
                                <p className='text-sm'>
                                    {data.views.toLocaleString()} views (
                                    {data.percentage}%)
                                </p>
                            </div>
                        )
                    }}
                />
                <Legend
                    verticalAlign='bottom'
                    height={36}
                    formatter={(value) => (
                        <span className='text-xs'>{value}</span>
                    )}
                />
            </PieChart>
        </ResponsiveContainer>
    )
}

// ============================================================================
// Geo Distribution Table (Not a chart, but lives here for organization)
// ============================================================================

type GeoTableProps = {
    data: GeoStats[]
}

/** Country code to name mapping for common countries */
const COUNTRY_NAMES: Record<string, string> = {
    US: 'United States',
    GB: 'United Kingdom',
    CA: 'Canada',
    AU: 'Australia',
    DE: 'Germany',
    FR: 'France',
    ES: 'Spain',
    IT: 'Italy',
    BR: 'Brazil',
    MX: 'Mexico',
    AR: 'Argentina',
    CO: 'Colombia',
    CL: 'Chile',
    PE: 'Peru',
    VE: 'Venezuela',
    PR: 'Puerto Rico',
    DO: 'Dominican Republic',
    CU: 'Cuba',
    JM: 'Jamaica',
    HT: 'Haiti',
    XX: 'Unknown',
}

function getCountryName(code: string): string {
    return COUNTRY_NAMES[code] ?? code
}

export function GeoTable({ data }: GeoTableProps) {
    const total = data.reduce((sum, item) => sum + item.views, 0)

    return (
        <div className='space-y-2'>
            {data.map((item, index) => {
                const percentage =
                    total > 0 ? Math.round((item.views / total) * 100) : 0
                return (
                    <div
                        key={item.countryCode}
                        className='flex items-center gap-3'
                    >
                        <span className='w-6 text-center text-sm text-stone-500'>
                            {index + 1}
                        </span>
                        <span className='min-w-[140px] flex-1 truncate text-sm font-medium'>
                            {getCountryName(item.countryCode)}
                        </span>
                        <div className='flex w-24 items-center gap-2'>
                            <div className='h-2 flex-1 overflow-hidden rounded-full bg-stone-100'>
                                <div
                                    className='h-full rounded-full bg-stone-500'
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <span className='w-8 text-right text-xs text-stone-500'>
                                {percentage}%
                            </span>
                        </div>
                        <span className='w-16 text-right text-sm tabular-nums'>
                            {item.views.toLocaleString()}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}

// ============================================================================
// Helpers
// ============================================================================

function formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatFullDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}
