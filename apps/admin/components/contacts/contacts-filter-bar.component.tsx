'use client'

import { useCallback, useMemo, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { MultiSelect } from '@workspace/ui/components/multi-select'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'

import { CustomDateRangePicker } from '@/components/analytics/leads/custom-date-range-picker.component'
import {
    DATE_RANGE_OPTIONS,
    type DateRangePreset,
} from '@/lib/types/analytics/date-range.type'

type Props = {
    sourceOptions: string[]
    mediumOptions: string[]
    selectedSources: string[]
    selectedMediums: string[]
    dateRangePreset: DateRangePreset
    startDate: Date
    endDate: Date
}

const FILTER_KEYS = ['dateRange', 'startDate', 'endDate', 'sources', 'mediums']

export function ContactsFilterBar({
    sourceOptions,
    mediumOptions,
    selectedSources,
    selectedMediums,
    dateRangePreset,
    startDate,
    endDate,
}: Props) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const sourceChoices = useMemo(
        () => sourceOptions.map((v) => ({ label: v, value: v })),
        [sourceOptions]
    )
    const mediumChoices = useMemo(
        () => mediumOptions.map((v) => ({ label: v, value: v })),
        [mediumOptions]
    )

    const updateParams = useCallback(
        (mutate: (params: URLSearchParams) => void) => {
            const next = new URLSearchParams(searchParams.toString())
            mutate(next)
            // Any filter change resets pagination.
            next.delete('page')
            const query = next.toString()
            const href = query ? `${pathname}?${query}` : pathname
            startTransition(() => {
                router.replace(href, { scroll: false })
            })
        },
        [pathname, router, searchParams]
    )

    const handlePresetChange = (value: string) => {
        updateParams((params) => {
            if (value === '28d') {
                // Default — drop the param so URLs stay clean.
                params.delete('dateRange')
            } else {
                params.set('dateRange', value)
            }
            // Custom-only params become stale when switching to a preset.
            if (value !== 'custom') {
                params.delete('startDate')
                params.delete('endDate')
            } else {
                // Seed with the current resolved window so the calendar
                // opens on something sensible.
                params.set('startDate', startDate.toISOString())
                params.set('endDate', endDate.toISOString())
            }
        })
    }

    const handleCustomRange = (start: Date, end: Date) => {
        updateParams((params) => {
            params.set('dateRange', 'custom')
            params.set('startDate', start.toISOString())
            params.set('endDate', end.toISOString())
        })
    }

    const handleSourcesChange = (values: string[]) => {
        updateParams((params) => {
            params.delete('sources')
            if (values.length) params.set('sources', values.join(','))
        })
    }

    const handleMediumsChange = (values: string[]) => {
        updateParams((params) => {
            params.delete('mediums')
            if (values.length) params.set('mediums', values.join(','))
        })
    }

    const hasActiveFilters = FILTER_KEYS.some((key) => searchParams.has(key))

    const handleClearAll = () => {
        startTransition(() => {
            router.replace(pathname, { scroll: false })
        })
    }

    return (
        <div
            className='bg-card flex flex-wrap items-center gap-3 rounded-md border px-4 py-3'
            data-pending={isPending || undefined}
        >
            <Select value={dateRangePreset} onValueChange={handlePresetChange}>
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

            {dateRangePreset === 'custom' && (
                <CustomDateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onChange={handleCustomRange}
                />
            )}

            <MultiSelect
                options={sourceChoices}
                value={selectedSources}
                onValueChange={handleSourcesChange}
                placeholder='All sources'
                searchable
                className='min-w-[200px]'
            />

            <MultiSelect
                options={mediumChoices}
                value={selectedMediums}
                onValueChange={handleMediumsChange}
                placeholder='All mediums'
                searchable
                className='min-w-[200px]'
            />

            {hasActiveFilters && (
                <button
                    type='button'
                    onClick={handleClearAll}
                    className='text-muted-foreground hover:text-foreground ml-auto text-sm underline-offset-4 hover:underline'
                >
                    Clear filters
                </button>
            )}
        </div>
    )
}
