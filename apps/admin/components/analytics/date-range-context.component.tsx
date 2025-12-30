'use client'

import {
    createContext,
    useContext,
    useState,
    type ReactNode,
    useMemo,
} from 'react'

import {
    type DateRangePreset,
    DEFAULT_DATE_RANGE,
    getDaysFromPreset,
    getLabelFromPreset,
    getDateRangeFromPreset,
} from '@/lib/types/analytics/date-range.type'

type DateRangeContextValue = {
    /** Current date range preset */
    dateRange: DateRangePreset
    /** Update the date range preset */
    setDateRange: (preset: DateRangePreset) => void
    /** Number of days for current preset */
    days: number
    /** Human-readable label for current preset */
    label: string
    /** Start date for current preset */
    startDate: Date
    /** End date for current preset */
    endDate: Date
}

const DateRangeContext = createContext<DateRangeContextValue | null>(null)

type DateRangeProviderProps = {
    children: ReactNode
    defaultValue?: DateRangePreset
}

/**
 * Provider for date range state across analytics components.
 *
 * Wraps analytics cards to share a single date range selection.
 */
export function DateRangeProvider({
    children,
    defaultValue = DEFAULT_DATE_RANGE,
}: DateRangeProviderProps) {
    const [dateRange, setDateRange] = useState<DateRangePreset>(defaultValue)

    const value = useMemo(() => {
        const days = getDaysFromPreset(dateRange)
        const label = getLabelFromPreset(dateRange)
        const { startDate, endDate } = getDateRangeFromPreset(dateRange)

        return {
            dateRange,
            setDateRange,
            days,
            label,
            startDate,
            endDate,
        }
    }, [dateRange])

    return (
        <DateRangeContext.Provider value={value}>
            {children}
        </DateRangeContext.Provider>
    )
}

/**
 * Hook to access the date range context.
 *
 * Must be used within a DateRangeProvider.
 *
 * @throws Error if used outside of DateRangeProvider
 */
export function useDateRange(): DateRangeContextValue {
    const context = useContext(DateRangeContext)

    if (!context) {
        throw new Error('useDateRange must be used within a DateRangeProvider')
    }

    return context
}
