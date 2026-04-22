'use client'

import { resolveSeriesColor } from '@/lib/analytics/series-colors'

type Props = {
    seriesKeys: string[]
    hiddenKeys: Set<string>
    onToggle: (key: string, shiftKey: boolean) => void
}

export function LeadTrendsLegend({ seriesKeys, hiddenKeys, onToggle }: Props) {
    if (seriesKeys.length === 0) return null
    return (
        <ul className='mt-3 flex flex-wrap gap-2'>
            {seriesKeys.map((key) => {
                const hidden = hiddenKeys.has(key)
                const { color, opacity } = resolveSeriesColor(key)
                return (
                    <li key={key}>
                        <button
                            type='button'
                            onClick={(e) => onToggle(key, e.shiftKey)}
                            className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition ${
                                hidden ? 'opacity-40' : 'hover:bg-muted/50'
                            }`}
                            aria-pressed={!hidden}
                            title='Click to toggle; shift-click to isolate'
                        >
                            <span
                                className='inline-block h-2.5 w-2.5 rounded-full'
                                style={{
                                    backgroundColor: color,
                                    opacity,
                                }}
                            />
                            <span>{key}</span>
                        </button>
                    </li>
                )
            })}
        </ul>
    )
}
