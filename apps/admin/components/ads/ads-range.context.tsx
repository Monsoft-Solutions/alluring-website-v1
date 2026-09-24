'use client'

/**
 * The Ads console's date window, shared by every /ads screen.
 *
 * Lives in the /ads layout, so moving between Overview, Keywords, Leads and
 * Changes keeps the window, and mirrors itself into `?from=&to=` so a link
 * opens on the same days. Dates are calendar days (YYYY-MM-DD) in Miami time,
 * the zone both the ad account and the lead timestamps use.
 */
import { usePathname, useSearchParams } from 'next/navigation'
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react'

import type { AdsRange } from '@/lib/types/ads/ads.type'
import { localDateToIso, shiftIsoDate } from '@/lib/utils/ads/ads-format.util'

export type AdsRangePreset = '7d' | '28d' | '90d' | 'custom'

export const ADS_RANGE_PRESETS: { value: AdsRangePreset; label: string }[] = [
    { value: '7d', label: 'Last 7 days' },
    { value: '28d', label: 'Last 28 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: 'custom', label: 'Custom…' },
]

const PRESET_DAYS: Record<Exclude<AdsRangePreset, 'custom'>, number> = {
    '7d': 7,
    '28d': 28,
    '90d': 90,
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** "Today" in Miami, whatever zone the browser is in. */
function miamiToday(): string {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date())
}

export function rangeForPreset(
    preset: Exclude<AdsRangePreset, 'custom'>
): AdsRange {
    const to = miamiToday()
    return { from: shiftIsoDate(to, -(PRESET_DAYS[preset] - 1)), to }
}

type AdsRangeContextValue = {
    range: AdsRange
    preset: AdsRangePreset
    setPreset: (preset: Exclude<AdsRangePreset, 'custom'>) => void
    setCustomRange: (from: Date, to: Date) => void
    /** `?from=…&to=…` for links that should keep the window. */
    query: string
}

const AdsRangeContext = createContext<AdsRangeContextValue | null>(null)

function initialState(params: URLSearchParams | null): {
    range: AdsRange
    preset: AdsRangePreset
} {
    const from = params?.get('from')
    const to = params?.get('to')
    if (from && to && ISO_DATE.test(from) && ISO_DATE.test(to) && from <= to) {
        return { range: { from, to }, preset: 'custom' }
    }
    return { range: rangeForPreset('28d'), preset: '28d' }
}

export function AdsRangeProvider({ children }: { children: ReactNode }) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const [state, setState] = useState(() => initialState(searchParams))

    const setPreset = useCallback(
        (preset: Exclude<AdsRangePreset, 'custom'>) => {
            setState({ range: rangeForPreset(preset), preset })
        },
        []
    )

    const setCustomRange = useCallback((from: Date, to: Date) => {
        setState({
            range: { from: localDateToIso(from), to: localDateToIso(to) },
            preset: 'custom',
        })
    }, [])

    const query = `from=${state.range.from}&to=${state.range.to}`

    // Mirror the window into the URL without a navigation, and again after
    // each move between /ads screens (sidebar links carry no query).
    useEffect(() => {
        const url = new URL(window.location.href)
        if (
            url.searchParams.get('from') === state.range.from &&
            url.searchParams.get('to') === state.range.to
        ) {
            return
        }
        url.searchParams.set('from', state.range.from)
        url.searchParams.set('to', state.range.to)
        window.history.replaceState(window.history.state, '', url)
    }, [state.range.from, state.range.to, pathname])

    const value = useMemo<AdsRangeContextValue>(
        () => ({
            range: state.range,
            preset: state.preset,
            setPreset,
            setCustomRange,
            query,
        }),
        [state, setPreset, setCustomRange, query]
    )

    return (
        <AdsRangeContext.Provider value={value}>
            {children}
        </AdsRangeContext.Provider>
    )
}

export function useAdsRange(): AdsRangeContextValue {
    const context = useContext(AdsRangeContext)
    if (!context) {
        throw new Error('useAdsRange must be used within AdsRangeProvider')
    }
    return context
}
