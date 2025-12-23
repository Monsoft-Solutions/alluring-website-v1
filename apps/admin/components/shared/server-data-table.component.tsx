'use client'

import type { ReactNode } from 'react'
import {
    type ColumnDef,
    type SortingState,
    type OnChangeFn,
    flexRender,
    getCoreRowModel,
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

export type ServerDataTableProps<TData> = {
    /** Table data */
    data: TData[]
    /** Column definitions with TanStack Table format */
    columns: ColumnDef<TData>[]
    /** Current sorting state */
    sorting: SortingState
    /** Callback when sorting changes */
    onSortingChange: OnChangeFn<SortingState>
    /** Whether data is loading */
    isLoading?: boolean
    /** Number of skeleton rows to show while loading */
    skeletonRows?: number
    /** Message when no data */
    emptyMessage?: string
    /** Icon for empty state */
    emptyIcon?: ReactNode
    /** Get unique key for each row */
    getRowId?: (row: TData) => string
}

/**
 * Server-side data table using TanStack Table.
 *
 * This table uses manual sorting - it exposes sorting state that the parent
 * component uses to fetch sorted data from the server.
 *
 * @example
 * ```tsx
 * const [sorting, setSorting] = useState<SortingState>([
 *   { id: 'clicks', desc: true }
 * ])
 *
 * // Convert TanStack sorting to API params
 * const orderBy = sorting[0]?.id ?? 'clicks'
 * const orderDirection = sorting[0]?.desc ? 'desc' : 'asc'
 *
 * const { data } = useSearchConsoleQueries(days, limit, orderBy, orderDirection)
 *
 * return (
 *   <ServerDataTable
 *     data={data ?? []}
 *     columns={columns}
 *     sorting={sorting}
 *     onSortingChange={setSorting}
 *     isLoading={isLoading}
 *   />
 * )
 * ```
 */
export function ServerDataTable<TData>({
    data,
    columns,
    sorting,
    onSortingChange,
    isLoading = false,
    skeletonRows = 8,
    emptyMessage = 'No data found',
    emptyIcon,
    getRowId,
}: ServerDataTableProps<TData>) {
    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
        },
        onSortingChange,
        getCoreRowModel: getCoreRowModel(),
        manualSorting: true, // Server handles sorting
        getRowId,
    })

    if (isLoading) {
        return <TableSkeleton columns={columns.length} rows={skeletonRows} />
    }

    return (
        <div className='max-h-[400px] overflow-auto'>
            <Table>
                <TableHeader>
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
                    {table.getRowModel().rows.length === 0 ? (
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
                        table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

function TableSkeleton({ columns, rows }: { columns: number; rows: number }) {
    return (
        <div className='space-y-3'>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className='flex items-center gap-4'>
                    {Array.from({ length: columns }).map((_, j) => (
                        <Skeleton
                            key={j}
                            className={j === 0 ? 'h-4 flex-1' : 'h-4 w-16'}
                        />
                    ))}
                </div>
            ))}
        </div>
    )
}
