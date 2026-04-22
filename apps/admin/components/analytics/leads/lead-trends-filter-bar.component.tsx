'use client'

import { useMemo } from 'react'

import { MultiSelect } from '@workspace/ui/components/multi-select'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'

import { useDateRange } from '@/components/analytics/date-range-context.component'
import { CustomDateRangePicker } from '@/components/analytics/leads/custom-date-range-picker.component'
import {
    DATE_RANGE_OPTIONS,
    type DateRangePreset,
} from '@/lib/types/analytics/date-range.type'
import type {
    BreakdownBy,
    ClassifiedLead,
} from '@/lib/types/analytics/lead-trends.type'

type Props = {
    allLeads: ClassifiedLead[] // unfiltered dataset — drives option lists
    sources: string[]
    onSourcesChange: (next: string[]) => void
    mediums: string[]
    onMediumsChange: (next: string[]) => void
    breakdownBy: BreakdownBy
    onBreakdownChange: (next: BreakdownBy) => void
}

const BREAKDOWN_OPTIONS: { value: BreakdownBy; label: string }[] = [
    { value: 'source', label: 'Source' },
    { value: 'medium', label: 'Medium' },
    { value: 'sourceMedium', label: 'Source + Medium' },
]

export function LeadTrendsFilterBar({
    allLeads,
    sources,
    onSourcesChange,
    mediums,
    onMediumsChange,
    breakdownBy,
    onBreakdownChange,
}: Props) {
    const { dateRange, setDateRange, startDate, endDate, setCustomRange } =
        useDateRange()

    const sourceOptions = useMemo(
        () =>
            uniqueSorted(allLeads.map((l) => l.source)).map((v) => ({
                label: v,
                value: v,
            })),
        [allLeads]
    )
    const mediumOptions = useMemo(
        () =>
            uniqueSorted(allLeads.map((l) => l.medium)).map((v) => ({
                label: v,
                value: v,
            })),
        [allLeads]
    )

    return (
        <div className='bg-card sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b px-4 py-3'>
            <Select
                value={dateRange}
                onValueChange={(v) => setDateRange(v as DateRangePreset)}
            >
                <SelectTrigger className='w-[170px]'>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {DATE_RANGE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {dateRange === 'custom' && (
                <CustomDateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onChange={setCustomRange}
                />
            )}

            <MultiSelect
                options={sourceOptions}
                value={sources}
                onValueChange={onSourcesChange}
                placeholder='All sources'
                searchable
                className='min-w-[200px]'
            />

            <MultiSelect
                options={mediumOptions}
                value={mediums}
                onValueChange={onMediumsChange}
                placeholder='All mediums'
                searchable
                className='min-w-[200px]'
            />

            <div className='text-muted-foreground ml-auto flex items-center gap-2 text-sm'>
                <span>Group by</span>
                <Select
                    value={breakdownBy}
                    onValueChange={(v) => onBreakdownChange(v as BreakdownBy)}
                >
                    <SelectTrigger className='w-[180px]'>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {BREAKDOWN_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}

function uniqueSorted(values: string[]): string[] {
    return [...new Set(values)].sort((a, b) => a.localeCompare(b))
}
