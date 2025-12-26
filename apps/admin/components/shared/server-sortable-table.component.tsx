'use client'

import type { ReactNode } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table'
import { Skeleton } from '@workspace/ui/components/skeleton'

import type { SortDirection } from '@/lib/types/shared/sorting.type'

/**
 * Column definition for server-sortable tables.
 */
export type ServerSortableColumn<T> = {
    /** Unique key for the column */
    key: string
    /** Header display text */
    header: string
    /** Whether this column is sortable (default: false) */
    sortable?: boolean
    /** Cell alignment */
    align?: 'left' | 'right' | 'center'
    /** Custom render function for the cell */
    render: (item: T) => ReactNode
    /** Optional className for the cell */
    className?: string
    /** Optional className for the header */
    headerClassName?: string
}

export type ServerSortableTableProps<T> = {
    /** Array of data items to display */
    data: T[]
    /** Column definitions */
    columns: ServerSortableColumn<T>[]
    /** Currently sorted column key (null if no sort) */
    sortColumn: string | null
    /** Current sort direction */
    sortDirection: SortDirection
    /** Callback when user clicks a sortable header */
    onSortChange: (column: string, direction: SortDirection) => void
    /** Whether data is loading */
    isLoading?: boolean
    /** Function to get unique key for each row */
    getRowKey: (item: T) => string
    /** Message to display when no data */
    emptyMessage?: string
    /** Number of skeleton rows to show when loading */
    skeletonRows?: number
}

/**
 * A lightweight table component for server-side sorting.
 *
 * Unlike DataTable which handles sorting client-side, this component
 * delegates sorting to the server via the onSortChange callback.
 * When a user clicks a sortable column header, it calls onSortChange
 * with the column key and new direction.
 *
 * Sort cycle: click unsorted → asc → desc → asc (cycles between asc/desc)
 */
export function ServerSortableTable<T>({
    data,
    columns,
    sortColumn,
    sortDirection,
    onSortChange,
    isLoading = false,
    getRowKey,
    emptyMessage = 'No data available',
    skeletonRows = 8,
}: ServerSortableTableProps<T>) {
    /**
     * Handle column header click.
     * Cycles: unsorted → asc → desc → asc
     */
    const handleHeaderClick = (columnKey: string) => {
        if (sortColumn === columnKey) {
            // Toggle direction
            const newDirection: SortDirection =
                sortDirection === 'asc' ? 'desc' : 'asc'
            onSortChange(columnKey, newDirection)
        } else {
            // New column - start with descending (most useful default for metrics)
            onSortChange(columnKey, 'desc')
        }
    }

    if (isLoading) {
        return <TableSkeleton columns={columns} rows={skeletonRows} />
    }

    if (data.length === 0) {
        return (
            <div className='flex h-[200px] items-center justify-center'>
                <p className='text-muted-foreground text-sm'>{emptyMessage}</p>
            </div>
        )
    }

    return (
        <div className='max-h-[400px] overflow-auto'>
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map((column) => (
                            <TableHead
                                key={column.key}
                                className={getHeaderClassName(column)}
                            >
                                {column.sortable ? (
                                    <button
                                        type='button'
                                        onClick={() =>
                                            handleHeaderClick(column.key)
                                        }
                                        className='flex items-center gap-1 transition-colors hover:text-stone-900'
                                    >
                                        {column.header}
                                        <SortIcon
                                            active={sortColumn === column.key}
                                            direction={
                                                sortColumn === column.key
                                                    ? sortDirection
                                                    : null
                                            }
                                        />
                                    </button>
                                ) : (
                                    column.header
                                )}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item) => (
                        <TableRow key={getRowKey(item)}>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.key}
                                    className={getCellClassName(column)}
                                >
                                    {column.render(item)}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

/**
 * Sort direction indicator icon
 */
function SortIcon({
    active,
    direction,
}: {
    active: boolean
    direction: SortDirection | null
}) {
    if (!active || !direction) {
        return <ArrowUpDown className='h-3 w-3 opacity-50' />
    }

    if (direction === 'asc') {
        return <ArrowUp className='h-3 w-3' />
    }

    return <ArrowDown className='h-3 w-3' />
}

/**
 * Loading skeleton for the table
 */
function TableSkeleton<T>({
    columns,
    rows,
}: {
    columns: ServerSortableColumn<T>[]
    rows: number
}) {
    return (
        <div className='space-y-3'>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className='flex items-center gap-4'>
                    {columns.map((column) => (
                        <Skeleton
                            key={column.key}
                            className={getSkeletonClassName(column)}
                        />
                    ))}
                </div>
            ))}
        </div>
    )
}

/**
 * Get header className based on column alignment
 */
function getHeaderClassName<T>(column: ServerSortableColumn<T>): string {
    const classes: string[] = []

    if (column.headerClassName) {
        classes.push(column.headerClassName)
    }

    if (column.align === 'right') {
        classes.push('text-right')
    } else if (column.align === 'center') {
        classes.push('text-center')
    }

    return classes.join(' ')
}

/**
 * Get cell className based on column alignment
 */
function getCellClassName<T>(column: ServerSortableColumn<T>): string {
    const classes: string[] = []

    if (column.className) {
        classes.push(column.className)
    }

    if (column.align === 'right') {
        classes.push('text-right')
    } else if (column.align === 'center') {
        classes.push('text-center')
    }

    return classes.join(' ')
}

/**
 * Get skeleton className based on column type
 */
function getSkeletonClassName<T>(column: ServerSortableColumn<T>): string {
    // First column (usually text) gets flex-1, others get fixed widths
    if (column.align === 'left' || !column.align) {
        return 'h-4 flex-1'
    }
    return 'h-4 w-16'
}
