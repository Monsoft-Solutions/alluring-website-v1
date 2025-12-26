'use client'

import { useState, useCallback, useMemo } from 'react'
import { Input } from '@workspace/ui/components/input'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { Badge } from '@workspace/ui/components/badge'
import { Skeleton } from '@workspace/ui/components/skeleton'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table'
import { Search, AlertCircle, Target, X } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

import { useQuerySearch } from '@/hooks/use-search-console.hook'
import { useDebounce } from '@/hooks/use-debounce.hook'
import type { SearchQuery } from '@/lib/types/search-console/search-console.type'

export type SelectedKeywords = {
    primary: string | null
    secondary: string[]
}

type GscKeywordSelectorProps = {
    selectedKeywords: SelectedKeywords
    onSelectionChange: (keywords: SelectedKeywords) => void
}

/**
 * GSC Keyword Selector
 *
 * Left panel component for browsing and selecting keywords from
 * Google Search Console. Supports primary/secondary keyword designation.
 */
export function GscKeywordSelector({
    selectedKeywords,
    onSelectionChange,
}: GscKeywordSelectorProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearchTerm = useDebounce(searchTerm, 300)

    // Fetch queries from Google Search Console
    const {
        data: queryResponse,
        isLoading,
        error,
    } = useQuerySearch(
        debouncedSearchTerm,
        28, // days
        50, // limit
        'clicks', // orderBy
        'desc' // orderDirection
    )

    const queries = queryResponse?.data ?? []
    const isConfigured = queryResponse?.configured ?? true

    // Get all selected keywords (primary + secondary)
    const allSelected = useMemo(
        () => [
            ...(selectedKeywords.primary ? [selectedKeywords.primary] : []),
            ...selectedKeywords.secondary,
        ],
        [selectedKeywords.primary, selectedKeywords.secondary]
    )

    // Check if a query is selected
    const isSelected = useCallback(
        (query: string) => allSelected.includes(query),
        [allSelected]
    )

    // Toggle keyword selection
    const handleToggleKeyword = useCallback(
        (query: string, checked: boolean) => {
            if (checked) {
                // Add to selection
                if (!selectedKeywords.primary) {
                    // First selection becomes primary
                    onSelectionChange({
                        primary: query,
                        secondary: selectedKeywords.secondary,
                    })
                } else {
                    // Additional selections become secondary
                    onSelectionChange({
                        primary: selectedKeywords.primary,
                        secondary: [...selectedKeywords.secondary, query],
                    })
                }
            } else {
                // Remove from selection
                if (selectedKeywords.primary === query) {
                    // Removing primary - promote first secondary
                    const [newPrimary, ...restSecondary] =
                        selectedKeywords.secondary
                    onSelectionChange({
                        primary: newPrimary ?? null,
                        secondary: restSecondary,
                    })
                } else {
                    onSelectionChange({
                        primary: selectedKeywords.primary,
                        secondary: selectedKeywords.secondary.filter(
                            (k) => k !== query
                        ),
                    })
                }
            }
        },
        [selectedKeywords, onSelectionChange]
    )

    // Set as primary keyword
    const handleSetPrimary = useCallback(
        (query: string) => {
            if (selectedKeywords.primary === query) return // Already primary

            const newSecondary = selectedKeywords.secondary.filter(
                (k) => k !== query
            )
            if (
                selectedKeywords.primary &&
                selectedKeywords.primary !== query
            ) {
                // Move current primary to secondary
                newSecondary.unshift(selectedKeywords.primary)
            }

            onSelectionChange({
                primary: query,
                secondary: newSecondary,
            })
        },
        [selectedKeywords, onSelectionChange]
    )

    // Remove keyword from selection
    const handleRemoveKeyword = useCallback(
        (query: string) => {
            handleToggleKeyword(query, false)
        },
        [handleToggleKeyword]
    )

    // Format position for display
    const formatPosition = (position: number) => position.toFixed(1)

    return (
        <div className='flex h-full flex-col'>
            <div className='mb-4'>
                <h3 className='mb-1 text-sm font-medium'>Search Queries</h3>
                <p className='text-muted-foreground text-xs'>
                    Select keywords from your Google Search Console data
                </p>
            </div>

            {!isConfigured ? (
                <div className='flex flex-1 items-center justify-center'>
                    <div className='flex flex-col items-center gap-2 text-center'>
                        <AlertCircle className='h-8 w-8 text-amber-500' />
                        <p className='text-muted-foreground text-sm'>
                            Google Search Console is not configured
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Search Input */}
                    <div className='relative mb-3'>
                        <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                        <Input
                            placeholder='Search queries...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='pl-9'
                        />
                    </div>

                    {/* Query Table */}
                    <div className='flex-1 overflow-y-auto rounded-lg border'>
                        <Table>
                            <TableHeader className='sticky top-0 bg-white'>
                                <TableRow>
                                    <TableHead className='w-[40px]'>
                                        <span className='sr-only'>Select</span>
                                    </TableHead>
                                    <TableHead>Query</TableHead>
                                    <TableHead className='w-[60px] text-right'>
                                        Clicks
                                    </TableHead>
                                    <TableHead className='w-[60px] text-right'>
                                        Impr.
                                    </TableHead>
                                    <TableHead className='w-[50px] text-right'>
                                        Pos.
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 8 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell>
                                                <Skeleton className='h-4 w-4' />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className='h-4 w-28' />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className='ml-auto h-4 w-8' />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className='ml-auto h-4 w-8' />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className='ml-auto h-4 w-6' />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : error ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className='py-8 text-center'
                                        >
                                            <div className='text-muted-foreground flex flex-col items-center gap-2'>
                                                <AlertCircle className='h-5 w-5 text-red-500' />
                                                <span>
                                                    Failed to load queries
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : queries.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className='py-8 text-center'
                                        >
                                            <div className='text-muted-foreground flex flex-col items-center gap-2'>
                                                <Search className='h-5 w-5' />
                                                <span>
                                                    {searchTerm
                                                        ? 'No queries match your search'
                                                        : 'No queries found'}
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    queries.map((q: SearchQuery) => {
                                        const isPrimary =
                                            selectedKeywords.primary === q.query
                                        const selected = isSelected(q.query)

                                        return (
                                            <TableRow
                                                key={q.query}
                                                className={cn(
                                                    'cursor-pointer',
                                                    isPrimary && 'bg-amber-50',
                                                    selected &&
                                                        !isPrimary &&
                                                        'bg-stone-50'
                                                )}
                                                onClick={() =>
                                                    handleSetPrimary(q.query)
                                                }
                                            >
                                                <TableCell
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    <Checkbox
                                                        checked={selected}
                                                        onCheckedChange={(
                                                            checked
                                                        ) =>
                                                            handleToggleKeyword(
                                                                q.query,
                                                                checked === true
                                                            )
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className='flex items-center gap-2'>
                                                        <span
                                                            className={cn(
                                                                'truncate text-sm',
                                                                isPrimary &&
                                                                    'font-medium text-amber-700'
                                                            )}
                                                        >
                                                            {q.query}
                                                        </span>
                                                        {isPrimary && (
                                                            <Target className='h-3.5 w-3.5 flex-shrink-0 text-amber-600' />
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className='text-right text-sm tabular-nums'>
                                                    {q.clicks.toLocaleString()}
                                                </TableCell>
                                                <TableCell className='text-muted-foreground text-right text-sm tabular-nums'>
                                                    {q.impressions.toLocaleString()}
                                                </TableCell>
                                                <TableCell className='text-muted-foreground text-right text-sm tabular-nums'>
                                                    {formatPosition(q.position)}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Selected Keywords */}
                    {allSelected.length > 0 && (
                        <div className='mt-3 space-y-2'>
                            <div className='text-muted-foreground text-xs font-medium'>
                                Selected ({allSelected.length})
                            </div>
                            <div className='flex flex-wrap gap-1.5'>
                                {selectedKeywords.primary && (
                                    <Badge
                                        variant='default'
                                        className='gap-1 bg-amber-500 pr-1 hover:bg-amber-600'
                                    >
                                        <Target className='h-3 w-3' />
                                        {selectedKeywords.primary}
                                        <button
                                            type='button'
                                            onClick={() =>
                                                handleRemoveKeyword(
                                                    selectedKeywords.primary!
                                                )
                                            }
                                            className='ml-0.5 rounded p-0.5 hover:bg-amber-400'
                                        >
                                            <X className='h-3 w-3' />
                                        </button>
                                    </Badge>
                                )}
                                {selectedKeywords.secondary.map((keyword) => (
                                    <Badge
                                        key={keyword}
                                        variant='secondary'
                                        className='gap-1 pr-1'
                                    >
                                        {keyword}
                                        <button
                                            type='button'
                                            onClick={() =>
                                                handleRemoveKeyword(keyword)
                                            }
                                            className='hover:bg-muted ml-0.5 rounded p-0.5'
                                        >
                                            <X className='h-3 w-3' />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                            <p className='text-muted-foreground text-xs'>
                                Click a row to set as primary keyword
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
