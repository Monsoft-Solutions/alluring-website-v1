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

/**
 * Popover calendar for picking an arbitrary start/end date pair.
 * Commits only when both endpoints are selected.
 */
export function CustomDateRangePicker({ startDate, endDate, onChange }: Props) {
    const [open, setOpen] = useState(false)
    const [range, setRange] = useState<CalendarRange>({
        from: startDate,
        to: endDate,
    })

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant='outline' size='sm'>
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    Pick dates
                </Button>
            </PopoverTrigger>
            <PopoverContent align='end' className='w-auto p-0'>
                <Calendar
                    mode='range'
                    selected={range}
                    onSelect={(next) => {
                        setRange(next ?? { from: undefined })
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
