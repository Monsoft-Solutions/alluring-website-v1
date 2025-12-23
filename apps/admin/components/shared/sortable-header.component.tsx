'use client'

import type { Column } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'

type SortableHeaderProps<TData, TValue> = {
    /** The column from TanStack Table */
    column: Column<TData, TValue>
    /** Header title text */
    title: string
    /** Additional class names */
    className?: string
}

/**
 * Sortable column header for server-side sorted tables.
 *
 * Renders a button that toggles sort direction on click.
 * Shows appropriate sort icons based on current state.
 *
 * @example
 * ```tsx
 * {
 *   accessorKey: 'clicks',
 *   header: ({ column }) => (
 *     <SortableHeader column={column} title="Clicks" className="justify-end" />
 *   ),
 *   cell: ({ row }) => (
 *     <div className="text-right">{row.original.clicks.toLocaleString()}</div>
 *   ),
 * }
 * ```
 */
export function SortableHeader<TData, TValue>({
    column,
    title,
    className,
}: SortableHeaderProps<TData, TValue>) {
    const isSorted = column.getIsSorted()

    return (
        <Button
            variant='ghost'
            size='sm'
            className={cn(
                'data-[state=open]:bg-accent -ml-3 h-7 text-xs font-medium',
                className
            )}
            onClick={() => column.toggleSorting(isSorted === 'asc')}
        >
            {title}
            {isSorted === 'desc' ? (
                <ArrowDown className='ml-2 h-4 w-4' />
            ) : isSorted === 'asc' ? (
                <ArrowUp className='ml-2 h-4 w-4' />
            ) : (
                <ArrowUpDown className='ml-2 h-4 w-4 opacity-50' />
            )}
        </Button>
    )
}
