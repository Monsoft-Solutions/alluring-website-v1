'use client'

import Link from 'next/link'

import { cn } from '@workspace/ui/lib/utils'

import { useAdsRange } from '@/components/ads/ads-range.context'
import type { AttentionItem } from '@/lib/types/ads/ads.type'

const AREA_LINKS: Record<
    AttentionItem['area'],
    { href: string; label: string }
> = {
    campaigns: { href: '/ads/campaigns', label: 'Campaigns' },
    daily: { href: '/ads', label: 'Daily trend' },
    terms: { href: '/ads/keywords?tab=terms', label: 'Search terms' },
    changes: { href: '/ads/changes', label: 'Changes' },
    tracking: { href: '/ads/changes', label: 'Tracking' },
}

const MARKS: Record<AttentionItem['severity'], string> = {
    bad: 'bg-rose-600',
    warn: 'bg-amber-500',
    info: 'bg-sky-600',
}

/** The overview's "Needs attention" list: worst first, each linking to its screen. */
export function AdsAttentionList({ items }: { items: AttentionItem[] }) {
    const { query } = useAdsRange()
    if (items.length === 0) {
        return (
            <p className='text-muted-foreground text-sm'>
                Nothing stands out in this window.
            </p>
        )
    }

    const order = { bad: 0, warn: 1, info: 2 }
    const sorted = [...items].sort(
        (a, b) => order[a.severity] - order[b.severity]
    )

    return (
        <ul className='grid gap-3'>
            {sorted.map((item) => {
                const link = AREA_LINKS[item.area]
                const joiner = link.href.includes('?') ? '&' : '?'
                return (
                    <li
                        key={item.id}
                        className='grid grid-cols-[10px_1fr] items-start gap-2.5 text-sm leading-snug'
                    >
                        <span
                            aria-hidden
                            className={cn(
                                'mt-1.5 h-2 w-2 rounded-sm',
                                MARKS[item.severity]
                            )}
                        />
                        <div className='min-w-0'>
                            <p className='font-semibold'>{item.title}</p>
                            <p className='text-muted-foreground text-xs'>
                                {item.detail}{' '}
                                <Link
                                    href={`${link.href}${joiner}${query}`}
                                    className='text-gold-700 underline-offset-2 hover:underline'
                                >
                                    {link.label}
                                </Link>
                            </p>
                        </div>
                    </li>
                )
            })}
        </ul>
    )
}
