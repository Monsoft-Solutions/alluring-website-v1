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
    ExternalLink,
    FileText,
    AlertCircle,
    RefreshCw,
    Stethoscope,
    Globe,
    LayoutList,
    Image,
    Tag,
    HelpCircle,
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
import type {
    SearchPageWithType,
    PageType,
} from '@/lib/types/search-console/search-console.type'
import { TableSkeleton } from '@/components/shared/skeletons/table-skeleton.component'
import { SortableHeader } from '@/components/shared/sortable-header.component'
import { PageDetailPanel } from './page-detail-panel.component'

type PagePerformanceTableProps = {
    /** Page data to display */
    data: SearchPageWithType[]
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
    /** Empty state message */
    emptyMessage?: string
}

const PAGE_TYPE_ICONS: Record<PageType, React.ReactNode> = {
    blog: <FileText className='h-3 w-3' />,
    'blog-listing': <LayoutList className='h-3 w-3' />,
    procedure: <Stethoscope className='h-3 w-3' />,
    pages: <Globe className='h-3 w-3' />,
    gallery: <Image className='h-3 w-3' />,
    promotion: <Tag className='h-3 w-3' />,
    other: <HelpCircle className='h-3 w-3' />,
}

const PAGE_TYPE_STYLES: Record<PageType, string> = {
    blog: 'bg-blue-100 text-blue-700 border-blue-200',
    'blog-listing': 'bg-sky-100 text-sky-700 border-sky-200',
    procedure: 'bg-purple-100 text-purple-700 border-purple-200',
    pages: 'bg-green-100 text-green-700 border-green-200',
    gallery: 'bg-amber-100 text-amber-700 border-amber-200',
    promotion: 'bg-rose-100 text-rose-700 border-rose-200',
    other: 'bg-stone-100 text-stone-700 border-stone-200',
}

const PAGE_TYPE_LABELS: Record<PageType, string> = {
    blog: 'Blog Post',
    'blog-listing': 'Blog Listing',
    procedure: 'Procedure',
    pages: 'Page',
    gallery: 'Gallery',
    promotion: 'Promotion',
    other: 'Other',
}

/**
 * Page performance table with expandable rows.
 * Each row can be expanded to show page details including trend and queries.
 * Shared component for page analysis pages.
 */
export function PagePerformanceTable({
    data,
    isLoading = false,
    error = null,
    onRetry,
    sorting,
    onSortingChange,
    days = 28,
    emptyMessage = 'No pages found',
}: PagePerformanceTableProps) {
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

    const columns = useMemo<ColumnDef<SearchPageWithType>[]>(
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
                accessorKey: 'path',
                header: 'Page',
                enableSorting: false,
                cell: ({ row }) => (
                    <div className='flex items-center gap-2'>
                        <Badge
                            variant='outline'
                            className={PAGE_TYPE_STYLES[row.original.pageType]}
                        >
                            {PAGE_TYPE_ICONS[row.original.pageType]}
                            <span className='ml-1 hidden sm:inline'>
                                {PAGE_TYPE_LABELS[row.original.pageType]}
                            </span>
                        </Badge>
                        <a
                            href={row.original.page}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex max-w-[250px] items-center gap-1 truncate font-medium hover:text-stone-600 hover:underline'
                            onClick={(e) => e.stopPropagation()}
                            title={row.original.path}
                        >
                            {row.original.path}
                            <ExternalLink className='h-3 w-3 flex-shrink-0 opacity-50' />
                        </a>
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
        []
    )

    // eslint-disable-next-line react-hooks/incompatible-library
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
        getRowId: (row) => row.page,
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
                    Failed to load pages
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
                <FileText className='text-muted-foreground h-8 w-8' />
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
                                        <PageDetailPanel
                                            pageUrl={row.original.page}
                                            path={row.original.path}
                                            pageType={row.original.pageType}
                                            clicks={row.original.clicks}
                                            impressions={
                                                row.original.impressions
                                            }
                                            ctr={row.original.ctr}
                                            position={row.original.position}
                                            days={days}
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
