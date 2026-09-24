/**
 * How each rung of the lead → click match ladder reads on screen. A plain
 * module (no 'use client') so the server-rendered contact page can use it.
 */
import type { LeadAdMatch } from '@workspace/db/schema/ads'

export type MatchTone = 'good' | 'warn' | 'bad' | 'info' | 'neutral'

/** How each rung of the match ladder reads, in ladder order. */
export const MATCH_META: Record<
    LeadAdMatch,
    { label: string; legend: string; tone: MatchTone; bar: string }
> = {
    click: {
        label: 'Click',
        legend: 'Click matched',
        tone: 'good',
        bar: 'bg-emerald-600',
    },
    campaign: {
        label: 'Campaign',
        legend: 'Campaign only',
        tone: 'info',
        bar: 'bg-sky-600',
    },
    ios_click: {
        label: 'iPhone click',
        legend: "iPhone click (gbraid), can't match",
        tone: 'warn',
        bar: 'bg-amber-500',
    },
    tagged_only: {
        label: 'Tagged only',
        legend: 'Tagged google/cpc, no click id',
        tone: 'neutral',
        bar: 'bg-stone-400',
    },
    not_found: {
        label: 'Not found',
        legend: 'gclid not in the click report',
        tone: 'bad',
        bar: 'bg-rose-500',
    },
    expired: {
        label: 'Expired',
        legend: 'Click older than 90 days',
        tone: 'neutral',
        bar: 'bg-stone-300',
    },
}

export const MATCH_ORDER: LeadAdMatch[] = [
    'click',
    'campaign',
    'ios_click',
    'tagged_only',
    'not_found',
    'expired',
]
