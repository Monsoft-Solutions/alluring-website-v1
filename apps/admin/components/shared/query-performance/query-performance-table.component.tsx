'use client'

import { useState, useMemo, Fragment, useCallback } from 'react'
import type {
    ColumnDef,
    SortingState,
    OnChangeFn,
    ExpandedState,
} from '@tanstack/react-table'
import {
    ChevronDown,
    ChevronRight,
    AlertTriangle,
    Search,
    AlertCircle,
    RefreshCw,
} from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import {
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    useReactTable,
} from '@tanstack/react-table'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table'
import { Skeleton } from '@workspace/ui/components/skeleton'

import type { SearchQuery } from '@/lib/types/search-console/search-console.type'
import { SortableHeader } from '@/components/shared/sortable-header.component'
import { QueryDetailPanel } from './query-detail-panel.component'

type QueryPerformanceTableProps = {
    /** Query data to display */
    data: SearchQuery[]
    /** Whether data is loading */
    isLoading?: boolean
    /** Error state */
    error?: Error | null
    /** Retry callback for error state */
    onRetry?: () => void
    /** Current sorting state */
    sorting: SortingState
    /** Callback when sorting changes */
    onSortingChange: (sorting: SortingState) => void
    /** Number of days for detail panel analysis */
    days?: number
    /** Set of queries identified as content gaps */
    contentGapQueries?: Set<string>
    /** Empty state message */
    emptyMessage?: string
}

/**
 * Query performance table with expandable rows.
 * Each row can be expanded to show query details including trend and pages.
 * Shared component for query analysis pages.
 */
export function QueryPerformanceTable({
    data,
    isLoading = false,
    error = null,
    onRetry,
    sorting,
    onSortingChange,
    days = 28,
    contentGapQueries = new Set(),
    emptyMessage = 'No queries found',
}: QueryPerformanceTableProps) {
    const [expanded, setExpanded] = useState<ExpandedState>({})

    // Wrapper to convert OnChangeFn to the expected callback
    const handleExpandedChange: OnChangeFn<ExpandedState> = useCallback(
        (updaterOrValue) => {
            if (typeof updaterOrValue === 'function') {
                setExpanded((prev) => updaterOrValue(prev))
            } else {
                setExpanded(updaterOrValue)
            }
        },
        []
    )

    const columns = useMemo<ColumnDef<SearchQuery>[]>(
        () => [
            {
                id: 'expander',
                header: () => null,
                cell: ({ row }) => (
                    <Button
                        variant='ghost'
                        size='sm'
                        className='h-8 w-8 p-0'
                        onClick={() => row.toggleExpanded()}
                    >
                        {row.getIsExpanded() ? (
                            <ChevronDown className='h-4 w-4' />
                        ) : (
                            <ChevronRight className='h-4 w-4' />
                        )}
                        <span className='sr-only'>
                            {row.getIsExpanded() ? 'Collapse' : 'Expand'}
                        </span>
                    </Button>
                ),
                enableSorting: false,
            },
            {
                accessorKey: 'query',
                header: 'Query',
                enableSorting: false,
                cell: ({ row }) => {
                    const hasGap = contentGapQueries.has(row.original.query)
                    return (
                        <div className='flex items-center gap-2'>
                            <span
                                className='max-w-[300px] truncate font-medium'
                                title={row.original.query}
                            >
                                {row.original.query}
                            </span>
                            {hasGap && (
                                <Badge
                                    variant='outline'
                                    className='flex-shrink-0 border-amber-500 text-amber-600'
                                >
                                    <AlertTriangle className='mr-1 h-3 w-3' />
                                    Gap
                                </Badge>
                            )}
                        </div>
                    )
                },
            },
            {
                accessorKey: 'clicks',
                header: ({ column }) => (
                    <SortableHeader
                        column={column}
                        title='Clicks'
                        className='justify-center'
                    />
                ),
                cell: ({ row }) => (
                    <div className='text-center font-medium'>
                        {row.original.clicks.toLocaleString()}
                    </div>
                ),
            },
            {
                accessorKey: 'impressions',
                header: ({ column }) => (
                    <SortableHeader
                        column={column}
                        title='Impressions'
                        className='justify-center'
                    />
                ),
                cell: ({ row }) => (
                    <div className='text-center'>
                        {row.original.impressions.toLocaleString()}
                    </div>
                ),
            },
            {
                accessorKey: 'ctr',
                header: ({ column }) => (
                    <SortableHeader
                        column={column}
                        title='CTR'
                        className='justify-center'
                    />
                ),
                cell: ({ row }) => (
                    <div className='text-center'>
                        {(row.original.ctr * 100).toFixed(1)}%
                    </div>
                ),
            },
            {
                accessorKey: 'position',
                header: ({ column }) => (
                    <SortableHeader
                        column={column}
                        title='Position'
                        className='justify-center'
                    />
                ),
                cell: ({ row }) => (
                    <div className='text-center'>
                        {row.original.position.toFixed(1)}
                    </div>
                ),
            },
        ],
        [contentGapQueries]
    )

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            expanded,
        },
        onSortingChange: onSortingChange as OnChangeFn<SortingState>,
        onExpandedChange: handleExpandedChange,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getRowId: (row) => row.query,
        manualSorting: true,
    })

    if (isLoading) {
        return <TableSkeleton />
    }

    if (error) {
        return (
            <div className='flex h-[300px] flex-col items-center justify-center gap-3'>
                <AlertCircle className='h-5 w-5 text-red-500' />
                <p className='text-muted-foreground text-sm'>
                    Failed to load queries
                </p>
                {onRetry && (
                    <Button variant='outline' size='sm' onClick={onRetry}>
                        <RefreshCw className='mr-2 h-4 w-4' />
                        Retry
                    </Button>
                )}
            </div>
        )
    }

    if (data.length === 0) {
        return (
            <div className='flex h-[300px] flex-col items-center justify-center gap-2'>
                <Search className='text-muted-foreground h-8 w-8' />
                <p className='text-muted-foreground text-sm'>{emptyMessage}</p>
            </div>
        )
    }

    return (
        <div className='max-h-[600px] overflow-auto rounded-md border'>
            <Table>
                <TableHeader className='bg-muted/50 sticky top-0'>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead
                                    key={header.id}
                                    className='text-xs font-medium'
                                >
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.header,
                                              header.getContext()
                                          )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows.map((row) => (
                        <Fragment key={row.id}>
                            <TableRow
                                className={
                                    row.getIsExpanded() ? 'bg-muted/30' : ''
                                }
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                            {row.getIsExpanded() && (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className='p-4'
                                    >
                                        <QueryDetailPanel
                                            query={row.original.query}
                                            days={days}
                                            hasContentGap={contentGapQueries.has(
                                                row.original.query
                                            )}
                                            onClose={() => row.toggleExpanded()}
                                        />
                                    </TableCell>
                                </TableRow>
                            )}
                        </Fragment>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

function TableSkeleton() {
    return (
        <div className='space-y-3'>
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className='flex items-center gap-4'>
                    <Skeleton className='h-4 w-8' />
                    <Skeleton className='h-4 flex-1' />
                    <Skeleton className='h-4 w-16' />
                    <Skeleton className='h-4 w-20' />
                    <Skeleton className='h-4 w-12' />
                    <Skeleton className='h-4 w-14' />
                </div>
            ))}
        </div>
    )
}
