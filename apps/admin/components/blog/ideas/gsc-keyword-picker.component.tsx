'use client'

import { useState, useCallback } from 'react'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@workspace/ui/components/collapsible'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { Skeleton } from '@workspace/ui/components/skeleton'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table'
import {
    ChevronDown,
    Search,
    AlertCircle,
    Target,
    MousePointerClick,
} from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

import { useQuerySearch } from '@/hooks/use-search-console.hook'
import { useDebounce } from '@/hooks/use-debounce.hook'

type GscKeywordPickerProps = {
    primaryKeyword: string
    secondaryKeywords: string[]
    onPrimaryChange: (keyword: string) => void
    onSecondaryChange: (keywords: string[]) => void
}

/**
 * Google Search Console Keyword Picker
 *
 * Collapsible section that allows users to browse real search queries
 * from Google Search Console and select them as primary or secondary keywords.
 */
export function GscKeywordPicker({
    primaryKeyword,
    secondaryKeywords,
    onPrimaryChange,
    onSecondaryChange,
}: GscKeywordPickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    // Debounce search term to avoid too many API calls
    const debouncedSearchTerm = useDebounce(searchTerm, 300)

    // Fetch queries from Google Search Console
    const {
        data: queryResponse,
        isLoading,
        error,
    } = useQuerySearch(
        debouncedSearchTerm,
        28, // days
        30, // limit
        'clicks', // orderBy
        'desc', // orderDirection
        isOpen // only fetch when open
    )

    const queries = queryResponse?.data ?? []
    const isConfigured = queryResponse?.configured ?? true

    // Handle setting a query as the primary keyword
    const handleSetPrimary = useCallback(
        (query: string) => {
            onPrimaryChange(query)
        },
        [onPrimaryChange]
    )

    // Handle toggling a query in secondary keywords
    const handleToggleSecondary = useCallback(
        (query: string, checked: boolean) => {
            if (checked) {
                // Add to secondary keywords if not already there
                if (!secondaryKeywords.includes(query)) {
                    onSecondaryChange([...secondaryKeywords, query])
                }
            } else {
                // Remove from secondary keywords
                onSecondaryChange(secondaryKeywords.filter((k) => k !== query))
            }
        },
        [secondaryKeywords, onSecondaryChange]
    )

    // Format CTR for display
    const formatCtr = (ctr: number) => {
        return `${(ctr * 100).toFixed(1)}%`
    }

    // Format position for display
    const formatPosition = (position: number) => {
        return position.toFixed(1)
    }

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
                <Button
                    type='button'
                    variant='outline'
                    className='w-full justify-between'
                >
                    <span className='flex items-center gap-2'>
                        <Search className='h-4 w-4' />
                        Select from Search Console
                    </span>
                    <ChevronDown
                        className={cn(
                            'h-4 w-4 transition-transform duration-200',
                            isOpen && 'rotate-180'
                        )}
                    />
                </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className='mt-3 space-y-3'>
                {!isConfigured ? (
                    <div className='flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800'>
                        <AlertCircle className='h-4 w-4 flex-shrink-0' />
                        <span>
                            Google Search Console is not configured. Add your
                            credentials in settings to enable this feature.
                        </span>
                    </div>
                ) : (
                    <>
                        {/* Search Input */}
                        <div className='relative'>
                            <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                            <Input
                                placeholder='Search queries...'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className='pl-9'
                            />
                        </div>

                        {/* Query Table */}
                        <div className='max-h-[300px] overflow-y-auto rounded-lg border'>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className='w-[40px]'>
                                            <span className='sr-only'>
                                                Secondary
                                            </span>
                                        </TableHead>
                                        <TableHead>Query</TableHead>
                                        <TableHead className='w-[70px] text-right'>
                                            Clicks
                                        </TableHead>
                                        <TableHead className='w-[80px] text-right'>
                                            Impr.
                                        </TableHead>
                                        <TableHead className='w-[60px] text-right'>
                                            CTR
                                        </TableHead>
                                        <TableHead className='w-[60px] text-right'>
                                            Pos.
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        // Loading skeleton
                                        Array.from({ length: 5 }).map(
                                            (_, i) => (
                                                <TableRow key={i}>
                                                    <TableCell>
                                                        <Skeleton className='h-4 w-4' />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Skeleton className='h-4 w-32' />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Skeleton className='ml-auto h-4 w-8' />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Skeleton className='ml-auto h-4 w-10' />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Skeleton className='ml-auto h-4 w-8' />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Skeleton className='ml-auto h-4 w-8' />
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        )
                                    ) : error ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
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
                                                colSpan={6}
                                                className='py-8 text-center'
                                            >
                                                <div className='text-muted-foreground flex flex-col items-center gap-2'>
                                                    <Search className='h-5 w-5' />
                                                    <span>
                                                        {searchTerm
                                                            ? 'No queries match your search'
                                                            : 'No queries found in the last 28 days'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        queries.map((q) => {
                                            const isPrimary =
                                                primaryKeyword === q.query
                                            const isSecondary =
                                                secondaryKeywords.includes(
                                                    q.query
                                                )

                                            return (
                                                <TableRow
                                                    key={q.query}
                                                    className={cn(
                                                        'cursor-pointer',
                                                        isPrimary &&
                                                            'bg-amber-50'
                                                    )}
                                                    onClick={() =>
                                                        handleSetPrimary(
                                                            q.query
                                                        )
                                                    }
                                                >
                                                    <TableCell
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                    >
                                                        <Checkbox
                                                            checked={
                                                                isSecondary
                                                            }
                                                            onCheckedChange={(
                                                                checked
                                                            ) =>
                                                                handleToggleSecondary(
                                                                    q.query,
                                                                    checked ===
                                                                        true
                                                                )
                                                            }
                                                            aria-label={`Add "${q.query}" as secondary keyword`}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className='flex items-center gap-2'>
                                                            <span
                                                                className={cn(
                                                                    'truncate',
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
                                                    <TableCell className='text-right tabular-nums'>
                                                        {q.clicks.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className='text-right tabular-nums'>
                                                        {q.impressions.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className='text-right tabular-nums'>
                                                        {formatCtr(q.ctr)}
                                                    </TableCell>
                                                    <TableCell className='text-right tabular-nums'>
                                                        {formatPosition(
                                                            q.position
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Helper text */}
                        <p className='text-muted-foreground flex items-center gap-1.5 text-xs'>
                            <MousePointerClick className='h-3.5 w-3.5' />
                            Click a row to set as primary keyword. Use
                            checkboxes for secondary keywords.
                        </p>
                    </>
                )}
            </CollapsibleContent>
        </Collapsible>
    )
}
