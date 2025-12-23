'use client'

import { useState } from 'react'
import { Search, AlertCircle, RefreshCw } from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
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
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Button } from '@workspace/ui/components/button'

import { useSearchConsoleQueries } from '@/hooks/use-search-console.hook'

type SortField = 'clicks' | 'impressions' | 'ctr' | 'position'
type SortDirection = 'asc' | 'desc'

/** Combined sort options for the dropdown */
const SORT_OPTIONS = [
    {
        value: 'clicks_desc',
        label: 'Clicks ↓',
        field: 'clicks',
        direction: 'desc',
    },
    {
        value: 'clicks_asc',
        label: 'Clicks ↑',
        field: 'clicks',
        direction: 'asc',
    },
    {
        value: 'impressions_desc',
        label: 'Impressions ↓',
        field: 'impressions',
        direction: 'desc',
    },
    {
        value: 'impressions_asc',
        label: 'Impressions ↑',
        field: 'impressions',
        direction: 'asc',
    },
    { value: 'ctr_desc', label: 'CTR ↓', field: 'ctr', direction: 'desc' },
    { value: 'ctr_asc', label: 'CTR ↑', field: 'ctr', direction: 'asc' },
    {
        value: 'position_desc',
        label: 'Position (best)',
        field: 'position',
        direction: 'desc',
    },
    {
        value: 'position_asc',
        label: 'Position (worst)',
        field: 'position',
        direction: 'asc',
    },
] as const

type SearchQueriesCardProps = {
    days?: number
}

/**
 * Search queries card displaying top search terms from Google Search Console.
 */
export function SearchQueriesCard({ days = 28 }: SearchQueriesCardProps) {
    const [sortValue, setSortValue] = useState('clicks_desc')

    // Parse the combined sort value
    const sortOption =
        SORT_OPTIONS.find((opt) => opt.value === sortValue) ?? SORT_OPTIONS[0]
    const orderBy = sortOption.field as SortField
    const orderDirection = sortOption.direction as SortDirection

    const { data, isLoading, error, refetch } = useSearchConsoleQueries(
        days,
        20,
        orderBy,
        orderDirection
    )

    return (
        <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
                <div>
                    <CardTitle className='flex items-center gap-2 text-lg'>
                        <Search className='h-5 w-5' />
                        Top Search Queries
                    </CardTitle>
                    <CardDescription>
                        Search terms bringing visitors to your site
                    </CardDescription>
                </div>
                <Select value={sortValue} onValueChange={setSortValue}>
                    <SelectTrigger className='w-[160px]'>
                        <SelectValue placeholder='Sort by' />
                    </SelectTrigger>
                    <SelectContent>
                        {SORT_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <TableSkeleton />
                ) : error ? (
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
                ) : data?.data && data.data.length > 0 ? (
                    <div className='max-h-[400px] overflow-auto'>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Query</TableHead>
                                    <TableHead className='text-right'>
                                        Clicks
                                    </TableHead>
                                    <TableHead className='text-right'>
                                        Impressions
                                    </TableHead>
                                    <TableHead className='text-right'>
                                        CTR
                                    </TableHead>
                                    <TableHead className='text-right'>
                                        Position
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.data.map((query) => (
                                    <TableRow key={query.query}>
                                        <TableCell className='max-w-[250px] truncate font-medium'>
                                            {query.query}
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            {query.clicks.toLocaleString()}
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            {query.impressions.toLocaleString()}
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            {(query.ctr * 100).toFixed(1)}%
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            {query.position.toFixed(1)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className='flex h-[300px] items-center justify-center'>
                        <p className='text-muted-foreground text-sm'>
                            No search queries yet
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function TableSkeleton() {
    return (
        <div className='space-y-3'>
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className='flex items-center gap-4'>
                    <Skeleton className='h-4 flex-1' />
                    <Skeleton className='h-4 w-16' />
                    <Skeleton className='h-4 w-16' />
                    <Skeleton className='h-4 w-12' />
                    <Skeleton className='h-4 w-12' />
                </div>
            ))}
        </div>
    )
}
