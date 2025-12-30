'use client'

import { Calendar } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'

import { useDateRange } from '@/components/analytics/date-range-context.component'
import {
    DATE_RANGE_OPTIONS,
    type DateRangePreset,
} from '@/lib/types/analytics/date-range.type'

/**
 * Date range selector for analytics dashboard.
 *
 * Renders a Select component with preset date range options.
 * Uses the DateRangeContext to share state across all analytics cards.
 */
export function DateRangeSelector() {
    const { dateRange, setDateRange } = useDateRange()

    return (
        <Select
            value={dateRange}
            onValueChange={(value) => setDateRange(value as DateRangePreset)}
        >
            <SelectTrigger className='w-[160px]'>
                <Calendar className='mr-2 h-4 w-4' />
                <SelectValue placeholder='Select period' />
            </SelectTrigger>
            <SelectContent>
                {DATE_RANGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
