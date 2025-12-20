'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import type { SeverityCount } from '@/lib/types/severity-count.type'

type BugsChartProps = {
    data: SeverityCount[]
}

const COLORS: Record<string, string> = {
    low: '#22c55e', // green
    medium: '#eab308', // yellow
    high: '#f97316', // orange
    critical: '#ef4444', // red
}

export function BugsChart({ data }: BugsChartProps) {
    const totalBugs = data.reduce((sum, item) => sum + item.count, 0)

    if (totalBugs === 0) {
        return (
            <div className='flex h-[200px] items-center justify-center'>
                <p className='text-muted-foreground text-sm'>No bug reports</p>
            </div>
        )
    }

    return (
        <div className='flex items-center gap-4'>
            <ResponsiveContainer width='50%' height={200}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey='count'
                        nameKey='severity'
                        cx='50%'
                        cy='50%'
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                    >
                        {data.map((entry) => (
                            <Cell
                                key={entry.severity}
                                fill={COLORS[entry.severity] ?? '#a8a29e'}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        content={({ active, payload }) => {
                            if (!active || !payload?.length) return null
                            const data = payload[0].payload as SeverityCount
                            return (
                                <div className='rounded-lg border bg-white px-3 py-2 shadow-sm'>
                                    <p className='text-muted-foreground text-xs capitalize'>
                                        {data.severity}
                                    </p>
                                    <p className='font-medium'>
                                        {data.count} bug
                                        {data.count !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            )
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
            <div className='flex flex-col gap-2'>
                {data.map((item) => (
                    <div
                        key={item.severity}
                        className='flex items-center gap-2'
                    >
                        <div
                            className='h-3 w-3 rounded-full'
                            style={{
                                backgroundColor:
                                    COLORS[item.severity] ?? '#a8a29e',
                            }}
                        />
                        <span className='text-muted-foreground text-sm capitalize'>
                            {item.severity}
                        </span>
                        <span className='ml-auto text-sm font-medium'>
                            {item.count}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
