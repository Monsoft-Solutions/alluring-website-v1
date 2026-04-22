'use client'

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from 'react'

import {
    DATE_RANGE_OPTIONS,
    DEFAULT_DATE_RANGE,
    deriveGranularityFromRange,
    getDateRangeFromPreset,
    getDaysFromPreset,
    getLabelFromPreset,
    type DateRangePreset,
} from '@/lib/types/analytics/date-range.type'
import type { Granularity } from '@/lib/types/analytics/lead-trends.type'

type DateRangeContextValue = {
    dateRange: DateRangePreset
    setDateRange: (preset: DateRangePreset) => void
    days: number
    label: string
    startDate: Date
    endDate: Date
    granularity: Granularity
    setCustomRange: (startDate: Date, endDate: Date) => void
}

const DateRangeContext = createContext<DateRangeContextValue | null>(null)

type DateRangeProviderProps = {
    children: ReactNode
    defaultValue?: DateRangePreset
}

export function DateRangeProvider({
    children,
    defaultValue = DEFAULT_DATE_RANGE,
}: DateRangeProviderProps) {
    const [dateRange, setDateRangeState] =
        useState<DateRangePreset>(defaultValue)
    const [customStart, setCustomStart] = useState<Date | null>(null)
    const [customEnd, setCustomEnd] = useState<Date | null>(null)

    const setDateRange = useCallback((preset: DateRangePreset) => {
        setDateRangeState(preset)
    }, [])

    const setCustomRange = useCallback((startDate: Date, endDate: Date) => {
        setCustomStart(startDate)
        setCustomEnd(endDate)
        setDateRangeState('custom')
    }, [])

    const value = useMemo<DateRangeContextValue>(() => {
        let startDate: Date
        let endDate: Date

        if (dateRange === 'custom' && customStart && customEnd) {
            startDate = customStart
            endDate = customEnd
        } else {
            const presetForRange =
                dateRange === 'custom' ? DEFAULT_DATE_RANGE : dateRange
            const range = getDateRangeFromPreset(presetForRange)
            startDate = range.startDate
            endDate = range.endDate
        }

        const days = getDaysFromPreset(
            dateRange === 'custom' ? DEFAULT_DATE_RANGE : dateRange
        )
        const label =
            dateRange === 'custom'
                ? formatCustomLabel(startDate, endDate)
                : getLabelFromPreset(dateRange)
        const granularity = deriveGranularityFromRange(startDate, endDate)

        return {
            dateRange,
            setDateRange,
            days,
            label,
            startDate,
            endDate,
            granularity,
            setCustomRange,
        }
    }, [dateRange, customStart, customEnd, setDateRange, setCustomRange])

    return (
        <DateRangeContext.Provider value={value}>
            {children}
        </DateRangeContext.Provider>
    )
}

function formatCustomLabel(start: Date, end: Date): string {
    const fmt = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
    })
    return `${fmt.format(start)} – ${fmt.format(end)}`
}

export function useDateRange(): DateRangeContextValue {
    const context = useContext(DateRangeContext)
    if (!context) {
        throw new Error('useDateRange must be used within a DateRangeProvider')
    }
    return context
}

export { DATE_RANGE_OPTIONS }
