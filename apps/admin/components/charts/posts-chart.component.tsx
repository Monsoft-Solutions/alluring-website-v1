'use client'

import {
    Bar,
    BarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

import type { TopPost } from '@/lib/types/top-post.type'

type PostsChartProps = {
    data: TopPost[]
}

export function PostsChart({ data }: PostsChartProps) {
    if (data.length === 0) {
        return (
            <div className='flex h-[200px] items-center justify-center'>
                <p className='text-muted-foreground text-sm'>
                    No published posts
                </p>
            </div>
        )
    }

    const chartData = data.map((post) => ({
        ...post,
        shortTitle:
            post.title.length > 25
                ? post.title.slice(0, 25) + '...'
                : post.title,
    }))

    return (
        <ResponsiveContainer width='100%' height={200}>
            <BarChart
                data={chartData}
                layout='vertical'
                margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
            >
                <XAxis
                    type='number'
                    tick={{ fontSize: 11, fill: '#78716c' }}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    type='category'
                    dataKey='shortTitle'
                    tick={{ fontSize: 11, fill: '#78716c' }}
                    tickLine={false}
                    axisLine={false}
                    width={120}
                />
                <Tooltip
                    content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        const data = payload[0].payload as TopPost & {
                            shortTitle: string
                        }
                        return (
                            <div className='max-w-[250px] rounded-lg border bg-white px-3 py-2 shadow-sm'>
                                <p className='text-muted-foreground text-xs'>
                                    {data.title}
                                </p>
                                <p className='font-medium'>
                                    {data.views.toLocaleString()} views
                                </p>
                            </div>
                        )
                    }}
                />
                <Bar
                    dataKey='views'
                    fill='#78716c'
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                />
            </BarChart>
        </ResponsiveContainer>
    )
}
