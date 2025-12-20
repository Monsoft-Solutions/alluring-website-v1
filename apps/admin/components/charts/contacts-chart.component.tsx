'use client'

import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

import type { DailyCount } from '@/lib/types/common.type'

type ContactsChartProps = {
    data: DailyCount[]
}

export function ContactsChart({ data }: ContactsChartProps) {
    const formattedData = data.map((item) => ({
        ...item,
        formattedDate: formatDate(item.date),
    }))

    return (
        <ResponsiveContainer width='100%' height={200}>
            <AreaChart
                data={formattedData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
                <defs>
                    <linearGradient
                        id='contactsGradient'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'
                    >
                        <stop
                            offset='5%'
                            stopColor='#78716c'
                            stopOpacity={0.3}
                        />
                        <stop
                            offset='95%'
                            stopColor='#78716c'
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
                        const data = payload[0].payload as DailyCount & {
                            formattedDate: string
                        }
                        return (
                            <div className='rounded-lg border bg-white px-3 py-2 shadow-sm'>
                                <p className='text-muted-foreground text-xs'>
                                    {formatFullDate(data.date)}
                                </p>
                                <p className='font-medium'>
                                    {data.count} contact
                                    {data.count !== 1 ? 's' : ''}
                                </p>
                            </div>
                        )
                    }}
                />
                <Area
                    type='monotone'
                    dataKey='count'
                    stroke='#78716c'
                    strokeWidth={2}
                    fill='url(#contactsGradient)'
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}

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
