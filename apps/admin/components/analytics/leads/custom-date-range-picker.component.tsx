'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { Calendar } from '@workspace/ui/components/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@workspace/ui/components/popover'

type Props = {
    startDate: Date
    endDate: Date
    onChange: (start: Date, end: Date) => void
}

/** Compatible with react-day-picker's DateRange. */
type CalendarRange = { from: Date | undefined; to?: Date | undefined }

const DATE_LABEL_FORMAT: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
}

/**
 * Popover calendar for picking an arbitrary start/end date pair.
 * Commits only when both endpoints are selected.
 */
export function CustomDateRangePicker({ startDate, endDate, onChange }: Props) {
    const [open, setOpen] = useState(false)
    // Undefined while the user is picking — prevents react-day-picker's range
    // mode from treating the first click as an extension of the previous range
    // (which would immediately satisfy the both-endpoints-selected guard).
    const [range, setRange] = useState<CalendarRange | undefined>(undefined)

    const handleOpenChange = (next: boolean) => {
        if (next) setRange(undefined)
        setOpen(next)
    }

    const label = `${startDate.toLocaleDateString(undefined, DATE_LABEL_FORMAT)} – ${endDate.toLocaleDateString(undefined, DATE_LABEL_FORMAT)}`

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button variant='outline' size='sm'>
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {label}
                </Button>
            </PopoverTrigger>
            <PopoverContent align='end' className='w-auto p-0'>
                <Calendar
                    mode='range'
                    // min={1} keeps `to` undefined after the first click so the
                    // popover stays open until the user picks a second day.
                    // Without it, react-day-picker fills `to` with the same date
                    // as `from` (see addToRange.js), which trips the auto-close.
                    min={1}
                    selected={range}
                    onSelect={(next) => {
                        setRange(next)
                        if (next?.from && next?.to) {
                            const start = new Date(next.from)
                            start.setHours(0, 0, 0, 0)
                            const end = new Date(next.to)
                            end.setHours(23, 59, 59, 999)
                            onChange(start, end)
                            setOpen(false)
                        }
                    }}
                    numberOfMonths={2}
                    defaultMonth={startDate}
                />
            </PopoverContent>
        </Popover>
    )
}
