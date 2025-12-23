'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { Search, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'

import { useSearchConsoleQueries } from '@/hooks/use-search-console.hook'
import type {
    SearchQuery,
    SortField,
    SortDirection,
} from '@/lib/types/search-console/search-console.type'
import { ServerDataTable } from '@/components/shared/server-data-table.component'
import { SortableHeader } from '@/components/shared/sortable-header.component'

type SearchQueriesCardProps = {
    days?: number
}

/**
 * Search queries card displaying top search terms from Google Search Console.
 * Uses TanStack Table with server-side sorting via clickable column headers.
 */
export function SearchQueriesCard({ days = 28 }: SearchQueriesCardProps) {
    // Default sort: clicks descending
    const [sorting, setSorting] = useState<SortingState>([
        { id: 'clicks', desc: true },
    ])

    // Convert TanStack sorting state to API parameters
    const orderBy = (sorting[0]?.id ?? 'clicks') as SortField
    const orderDirection: SortDirection = sorting[0]?.desc ? 'desc' : 'asc'

    const { data, isLoading, error, refetch } = useSearchConsoleQueries(
        days,
        20,
        orderBy,
        orderDirection
    )

    // Define columns with TanStack Table format
    const columns = useMemo<ColumnDef<SearchQuery>[]>(
        () => [
            {
                accessorKey: 'query',
                header: 'Query',
                enableSorting: false, // Query column not sortable
                cell: ({ row }) => (
                    <div className='max-w-[250px] truncate font-medium'>
                        {row.original.query}
                    </div>
                ),
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
                    <div className='text-center'>
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
        []
    )

    return (
        <Card>
            <CardHeader className='flex flex-row items-start justify-between'>
                <div>
                    <CardTitle className='flex items-center gap-2 text-lg'>
                        <Search className='h-5 w-5' />
                        Top Search Queries
                    </CardTitle>
                    <CardDescription>
                        Search terms bringing visitors to your site. Click
                        column headers to sort.
                    </CardDescription>
                </div>
                <Button variant='ghost' size='sm' asChild>
                    <Link href='/seo/queries'>
                        View All
                        <ArrowRight className='ml-2 h-4 w-4' />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                {error ? (
                    <div className='flex h-[300px] flex-col items-center justify-center gap-3'>
                        <AlertCircle className='h-5 w-5 text-red-500' />
                        <p className='text-muted-foreground text-sm'>
                            Failed to load queries
                        </p>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={() => refetch()}
                        >
                            <RefreshCw className='mr-2 h-4 w-4' />
                            Retry
                        </Button>
                    </div>
                ) : (
                    <ServerDataTable
                        data={data?.data ?? []}
                        columns={columns}
                        sorting={sorting}
                        onSortingChange={setSorting}
                        isLoading={isLoading}
                        emptyMessage='No search queries yet'
                        getRowId={(row) => row.query}
                    />
                )}
            </CardContent>
        </Card>
    )
}
