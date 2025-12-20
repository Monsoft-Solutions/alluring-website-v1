'use client'

import { useState, useMemo, useDeferredValue } from 'react'
import type { ReactNode, KeyboardEvent } from 'react'
import {
    Search,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Card, CardContent } from '@workspace/ui/components/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'

export type Column<T> = {
    key: keyof T | string
    header: string
    sortable?: boolean
    searchable?: boolean
    render?: (item: T) => ReactNode
    className?: string
}

export type DataTableProps<T> = {
    data: T[]
    columns: Column<T>[]
    searchPlaceholder?: string
    pageSize?: number
    pageSizeOptions?: number[]
    emptyMessage?: string
    emptyIcon?: ReactNode
    onRowClick?: (item: T) => void
    getRowKey: (item: T) => string
}

type SortDirection = 'asc' | 'desc' | null

export function DataTable<T>({
    data,
    columns,
    searchPlaceholder = 'Search...',
    pageSize: defaultPageSize = 10,
    pageSizeOptions = [10, 20, 50, 100],
    emptyMessage = 'No data found',
    emptyIcon,
    onRowClick,
    getRowKey,
}: DataTableProps<T>) {
    const [searchQuery, setSearchQuery] = useState('')
    const [sortColumn, setSortColumn] = useState<string | null>(null)
    const [sortDirection, setSortDirection] = useState<SortDirection>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(defaultPageSize)

    // Defer search query to avoid blocking UI on fast typing
    const deferredSearchQuery = useDeferredValue(searchQuery)

    // Get searchable columns
    const searchableColumns = columns.filter((col) => col.searchable !== false)

    // Filter data by search query (using deferred value)
    const filteredData = useMemo(() => {
        if (!deferredSearchQuery.trim()) return data

        const query = deferredSearchQuery.toLowerCase()
        return data.filter((item) => {
            return searchableColumns.some((col) => {
                const value = getNestedValue(item, col.key as string)
                if (value == null) return false
                return String(value).toLowerCase().includes(query)
            })
        })
    }, [data, deferredSearchQuery, searchableColumns])

    // Sort data
    const sortedData = useMemo(() => {
        if (!sortColumn || !sortDirection) return filteredData

        return [...filteredData].sort((a, b) => {
            const aValue = getNestedValue(a, sortColumn)
            const bValue = getNestedValue(b, sortColumn)

            if (aValue == null && bValue == null) return 0
            if (aValue == null) return sortDirection === 'asc' ? 1 : -1
            if (bValue == null) return sortDirection === 'asc' ? -1 : 1

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc'
                    ? aValue - bValue
                    : bValue - aValue
            }

            const aStr = String(aValue).toLowerCase()
            const bStr = String(bValue).toLowerCase()

            if (sortDirection === 'asc') {
                return aStr.localeCompare(bStr)
            } else {
                return bStr.localeCompare(aStr)
            }
        })
    }, [filteredData, sortColumn, sortDirection])

    // Paginate data
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize
        return sortedData.slice(startIndex, startIndex + pageSize)
    }, [sortedData, currentPage, pageSize])

    const totalPages = Math.ceil(sortedData.length / pageSize)
    const totalItems = sortedData.length

    // Handle sort click
    const handleSort = (columnKey: string) => {
        if (sortColumn === columnKey) {
            if (sortDirection === 'asc') {
                setSortDirection('desc')
            } else if (sortDirection === 'desc') {
                setSortColumn(null)
                setSortDirection(null)
            }
        } else {
            setSortColumn(columnKey)
            setSortDirection('asc')
        }
        setCurrentPage(1)
    }

    // Handle page size change
    const handlePageSizeChange = (newPageSize: string) => {
        setPageSize(parseInt(newPageSize, 10))
        setCurrentPage(1)
    }

    // Handle search change
    const handleSearchChange = (value: string) => {
        setSearchQuery(value)
        setCurrentPage(1)
    }

    // Handle keyboard navigation for clickable rows
    const handleRowKeyDown = (
        event: KeyboardEvent<HTMLTableRowElement>,
        item: T
    ) => {
        if (onRowClick && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault()
            onRowClick(item)
        }
    }

    return (
        <div className='space-y-4'>
            {/* Search and controls */}
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <div className='relative w-full sm:max-w-xs'>
                    <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                    <Input
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className='pl-9'
                    />
                </div>
                <div className='flex items-center gap-2'>
                    <span className='text-muted-foreground text-sm'>
                        Showing{' '}
                        {totalItems > 0
                            ? `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, totalItems)}`
                            : 0}{' '}
                        of {totalItems}
                    </span>
                </div>
            </div>

            {/* Table */}
            <Card>
                <CardContent className='p-0'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableHead
                                        key={String(column.key)}
                                        className={column.className}
                                    >
                                        {column.sortable !== false ? (
                                            <button
                                                onClick={() =>
                                                    handleSort(
                                                        column.key as string
                                                    )
                                                }
                                                className='flex items-center gap-1 hover:text-stone-900'
                                            >
                                                {column.header}
                                                <SortIcon
                                                    active={
                                                        sortColumn ===
                                                        column.key
                                                    }
                                                    direction={
                                                        sortColumn ===
                                                        column.key
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
                            {paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className='text-muted-foreground py-8 text-center'
                                    >
                                        {emptyIcon && (
                                            <div className='mb-2 flex justify-center'>
                                                {emptyIcon}
                                            </div>
                                        )}
                                        {emptyMessage}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((item) => (
                                    <TableRow
                                        key={getRowKey(item)}
                                        className={
                                            onRowClick
                                                ? 'cursor-pointer hover:bg-stone-50'
                                                : undefined
                                        }
                                        onClick={() => onRowClick?.(item)}
                                        onKeyDown={(e) =>
                                            handleRowKeyDown(e, item)
                                        }
                                        role={onRowClick ? 'button' : undefined}
                                        tabIndex={onRowClick ? 0 : undefined}
                                    >
                                        {columns.map((column) => (
                                            <TableCell
                                                key={String(column.key)}
                                                className={column.className}
                                            >
                                                {column.render
                                                    ? column.render(item)
                                                    : String(
                                                          getNestedValue(
                                                              item,
                                                              column.key as string
                                                          ) ?? ''
                                                      )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className='flex flex-col items-center justify-between gap-4 sm:flex-row'>
                    <div className='flex items-center gap-2'>
                        <span className='text-muted-foreground text-sm'>
                            Rows per page:
                        </span>
                        <Select
                            value={String(pageSize)}
                            onValueChange={handlePageSizeChange}
                        >
                            <SelectTrigger className='w-[70px]'>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {pageSizeOptions.map((size) => (
                                    <SelectItem key={size} value={String(size)}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='flex items-center gap-2'>
                        <span className='text-muted-foreground text-sm'>
                            Page {currentPage} of {totalPages}
                        </span>
                        <div className='flex items-center gap-1'>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronsLeft className='h-4 w-4' />
                            </Button>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={() =>
                                    setCurrentPage((p) => Math.max(1, p - 1))
                                }
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className='h-4 w-4' />
                            </Button>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={() =>
                                    setCurrentPage((p) =>
                                        Math.min(totalPages, p + 1)
                                    )
                                }
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className='h-4 w-4' />
                            </Button>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronsRight className='h-4 w-4' />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function SortIcon({
    active,
    direction,
}: {
    active: boolean
    direction: SortDirection
}) {
    if (!active || !direction) {
        return <ArrowUpDown className='h-3 w-3 opacity-50' />
    }

    if (direction === 'asc') {
        return <ArrowUp className='h-3 w-3' />
    }

    return <ArrowDown className='h-3 w-3' />
}

// Helper function to get nested values from objects
function getNestedValue<T>(obj: T, path: string): unknown {
    return path.split('.').reduce((acc: unknown, part) => {
        if (acc && typeof acc === 'object' && part in acc) {
            return (acc as Record<string, unknown>)[part]
        }
        return undefined
    }, obj)
}
