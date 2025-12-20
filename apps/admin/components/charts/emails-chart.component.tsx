'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import type { EmailStatusCount } from '@/lib/types/email-status-count.type'

type EmailsChartProps = {
    data: EmailStatusCount[]
}

const COLORS: Record<string, string> = {
    sent: '#22c55e', // green
    failed: '#ef4444', // red
    pending: '#eab308', // yellow
}

const LABELS: Record<string, string> = {
    sent: 'Delivered',
    failed: 'Failed',
    pending: 'Pending',
}

export function EmailsChart({ data }: EmailsChartProps) {
    const totalEmails = data.reduce((sum, item) => sum + item.count, 0)

    if (totalEmails === 0) {
        return (
            <div className='flex h-[200px] items-center justify-center'>
                <p className='text-muted-foreground text-sm'>No emails sent</p>
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
                        nameKey='status'
                        cx='50%'
                        cy='50%'
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                    >
                        {data.map((entry) => (
                            <Cell
                                key={entry.status}
                                fill={COLORS[entry.status] ?? '#a8a29e'}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        content={({ active, payload }) => {
                            if (!active || !payload?.length) return null
                            const data = payload[0].payload as EmailStatusCount
                            const percentage = Math.round(
                                (data.count / totalEmails) * 100
                            )
                            return (
                                <div className='rounded-lg border bg-white px-3 py-2 shadow-sm'>
                                    <p className='text-muted-foreground text-xs'>
                                        {LABELS[data.status] ?? data.status}
                                    </p>
                                    <p className='font-medium'>
                                        {data.count} ({percentage}%)
                                    </p>
                                </div>
                            )
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
            <div className='flex flex-col gap-2'>
                {data.map((item) => (
                    <div key={item.status} className='flex items-center gap-2'>
                        <div
                            className='h-3 w-3 rounded-full'
                            style={{
                                backgroundColor:
                                    COLORS[item.status] ?? '#a8a29e',
                            }}
                        />
                        <span className='text-muted-foreground text-sm'>
                            {LABELS[item.status] ?? item.status}
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
