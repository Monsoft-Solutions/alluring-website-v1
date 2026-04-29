'use client'

import { format } from 'date-fns'

import type { Granularity } from '@/lib/types/analytics/lead-trends.type'

type TooltipPayloadItem = {
    name: string
    value: number
    color: string
}

type Props = {
    active?: boolean
    payload?: TooltipPayloadItem[]
    label?: string | number
    granularity: Granularity
}

export function LeadTrendsTooltip({
    active,
    payload,
    label,
    granularity,
}: Props) {
    if (!active || !payload || payload.length === 0 || label == null)
        return null

    const items = [...payload]
        .filter((p) => p.value > 0)
        .sort((a, b) => b.value - a.value)
    const total = items.reduce((sum, p) => sum + p.value, 0)
    const formatted = formatBucketLabel(new Date(label), granularity)

    return (
        <div className='rounded-lg border bg-white px-3 py-2 shadow-md'>
            <p className='text-muted-foreground text-xs'>{formatted}</p>
            <p className='mt-0.5 font-medium'>{total.toLocaleString()} leads</p>
            <ul className='mt-2 space-y-0.5 text-sm'>
                {items.map((p, idx) => (
                    <li
                        key={p.name}
                        className={`flex items-center gap-2 ${
                            idx === 0 ? 'font-semibold' : ''
                        }`}
                    >
                        <span
                            className='inline-block h-2 w-2 rounded-full'
                            style={{ backgroundColor: p.color }}
                        />
                        <span>{p.name}</span>
                        <span className='text-muted-foreground ml-auto'>
                            {p.value}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

function formatBucketLabel(date: Date, granularity: Granularity): string {
    switch (granularity) {
        case 'hour':
            return format(date, 'MMM d · h:mm a')
        case 'day':
            return format(date, 'MMM d, yyyy')
        case 'week': {
            const end = new Date(date)
            end.setDate(end.getDate() + 6)
            return `${format(date, 'MMM d')} – ${format(end, 'MMM d')}`
        }
    }
}
