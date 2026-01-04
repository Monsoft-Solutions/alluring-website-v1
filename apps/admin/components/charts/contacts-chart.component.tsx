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

import type { DailyCount, HourlyCount } from '@/lib/types/common/common.type'

type ContactsChartProps = {
    data: DailyCount[] | HourlyCount[]
    mode?: 'daily' | 'hourly'
}

export function ContactsChart({ data, mode = 'daily' }: ContactsChartProps) {
    const isHourly = mode === 'hourly'

    const formattedData = isHourly
        ? (data as HourlyCount[]).map((item) => ({
              ...item,
              formattedLabel: formatHour(item.hour),
          }))
        : (data as DailyCount[]).map((item) => ({
              ...item,
              formattedLabel: formatDate(item.date),
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
                    dataKey='formattedLabel'
                    tick={{ fontSize: 11, fill: '#78716c' }}
                    tickLine={false}
                    axisLine={false}
                    interval={isHourly ? 2 : 'preserveStartEnd'}
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

                        if (isHourly) {
                            const item = payload[0] as {
                                payload: HourlyCount & {
                                    formattedLabel: string
                                }
                            }
                            const hourData = item.payload
                            return (
                                <div className='rounded-lg border bg-white px-3 py-2 shadow-sm'>
                                    <p className='text-muted-foreground text-xs'>
                                        {formatHourFull(hourData.hour)}
                                    </p>
                                    <p className='font-medium'>
                                        {hourData.count} contact
                                        {hourData.count !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            )
                        }

                        const item = payload[0] as {
                            payload: DailyCount & { formattedLabel: string }
                        }
                        const dailyData = item.payload
                        return (
                            <div className='rounded-lg border bg-white px-3 py-2 shadow-sm'>
                                <p className='text-muted-foreground text-xs'>
                                    {formatFullDate(dailyData.date)}
                                </p>
                                <p className='font-medium'>
                                    {dailyData.count} contact
                                    {dailyData.count !== 1 ? 's' : ''}
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

/**
 * Format hour number (0-23) to short label (e.g., "9AM", "2PM")
 */
function formatHour(hour: number): string {
    if (hour === 0) return '12AM'
    if (hour === 12) return '12PM'
    if (hour < 12) return `${hour}AM`
    return `${hour - 12}PM`
}

/**
 * Format hour number (0-23) to full label (e.g., "9:00 AM", "2:00 PM")
 */
function formatHourFull(hour: number): string {
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:00 ${period}`
}
