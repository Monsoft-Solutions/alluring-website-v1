'use client'

import { useState } from 'react'
import {
    FileText,
    AlertCircle,
    RefreshCw,
    ExternalLink,
    Search,
} from 'lucide-react'
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
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Button } from '@workspace/ui/components/button'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip'

import { useSearchConsolePages } from '@/hooks/use-search-console.hook'
import { PageDeepDiveDialog } from './page-deep-dive-dialog.component'

/**
 * Search pages card displaying top pages from Google Search Console.
 */
export function SearchPagesCard() {
    const { data, isLoading, error, refetch } = useSearchConsolePages(28, 15)
    const [selectedPage, setSelectedPage] = useState<string | null>(null)

    /**
     * Format page URL to show only the path
     */
    const formatPagePath = (url: string) => {
        try {
            const urlObj = new URL(url)
            return urlObj.pathname || '/'
        } catch {
            return url
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                    <FileText className='h-5 w-5' />
                    Top Pages
                </CardTitle>
                <CardDescription>
                    Pages with the most search visibility
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <TableSkeleton />
                ) : error ? (
                    <div className='flex h-[300px] flex-col items-center justify-center gap-3'>
                        <AlertCircle className='h-5 w-5 text-red-500' />
                        <p className='text-muted-foreground text-sm'>
                            Failed to load pages
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
                    <>
                        <div className='max-h-[400px] overflow-auto'>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Page</TableHead>
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
                                        <TableHead className='w-[50px]'></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.data.map((page) => (
                                        <TableRow
                                            key={page.page}
                                            className='group'
                                        >
                                            <TableCell className='max-w-[200px]'>
                                                <a
                                                    href={page.page}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    className='flex items-center gap-1 truncate font-medium hover:text-stone-600 hover:underline'
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    {formatPagePath(page.page)}
                                                    <ExternalLink className='h-3 w-3 flex-shrink-0 opacity-50' />
                                                </a>
                                            </TableCell>
                                            <TableCell className='text-right'>
                                                {page.clicks.toLocaleString()}
                                            </TableCell>
                                            <TableCell className='text-right'>
                                                {page.impressions.toLocaleString()}
                                            </TableCell>
                                            <TableCell className='text-right'>
                                                {(page.ctr * 100).toFixed(1)}%
                                            </TableCell>
                                            <TableCell className='text-right'>
                                                {page.position.toFixed(1)}
                                            </TableCell>
                                            <TableCell>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant='ghost'
                                                                size='icon'
                                                                className='h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100'
                                                                onClick={() =>
                                                                    setSelectedPage(
                                                                        page.page
                                                                    )
                                                                }
                                                            >
                                                                <Search className='h-4 w-4' />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            View all queries for
                                                            this page
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Page Deep Dive Dialog */}
                        <PageDeepDiveDialog
                            open={!!selectedPage}
                            onOpenChange={(open) =>
                                !open && setSelectedPage(null)
                            }
                            pageUrl={selectedPage ?? ''}
                        />
                    </>
                ) : (
                    <div className='flex h-[300px] items-center justify-center'>
                        <p className='text-muted-foreground text-sm'>
                            No page data yet
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
