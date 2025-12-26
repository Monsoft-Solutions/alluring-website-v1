'use client'

import { useState } from 'react'
import {
    FileSearch,
    AlertCircle,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Clock,
    Smartphone,
    ExternalLink,
    Plus,
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
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip'

import { useUrlInspection } from '@/hooks/use-search-console.hook'
import type { UrlInspectionResult } from '@/lib/types/search-console/search-console.type'
import { cn } from '@workspace/ui/lib/utils'
import { getAllMainPages, type SitePage } from '@workspace/shared'
import { TableSkeleton } from '@/components/shared/skeletons/table-skeleton.component'

const SITE_URL = 'https://www.alluringplasticsurgery.com'

// Default URLs to check - key pages for the website derived from shared config
const DEFAULT_URLS = getAllMainPages().map((page: SitePage) =>
    page.url.startsWith('http') ? page.url : `${SITE_URL}${page.url}`
)

/**
 * Get status badge for coverage state
 */
function getCoverageStatus(state: string): {
    label: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
    icon: typeof CheckCircle2
    className: string
} {
    switch (state) {
        case 'SUBMITTED_AND_INDEXED':
            return {
                label: 'Indexed',
                variant: 'outline',
                icon: CheckCircle2,
                className: 'bg-green-50 text-green-700 border-green-200',
            }
        case 'DISCOVERED_NOT_INDEXED':
            return {
                label: 'Discovered',
                variant: 'secondary',
                icon: Clock,
                className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            }
        case 'CRAWLED_NOT_INDEXED':
            return {
                label: 'Crawled',
                variant: 'secondary',
                icon: Clock,
                className: 'bg-orange-50 text-orange-700 border-orange-200',
            }
        case 'URL_IS_UNKNOWN':
            return {
                label: 'Unknown',
                variant: 'outline',
                icon: AlertCircle,
                className: '',
            }
        case 'ERROR':
            return {
                label: 'Error',
                variant: 'destructive',
                icon: XCircle,
                className: '',
            }
        default:
            return {
                label: state,
                variant: 'outline',
                icon: AlertCircle,
                className: '',
            }
    }
}

/**
 * Get mobile usability badge
 */
function getMobileStatus(state: string): {
    label: string
    className: string
} {
    switch (state) {
        case 'MOBILE_FRIENDLY':
            return {
                label: 'Mobile Friendly',
                className: 'text-green-600',
            }
        case 'NOT_MOBILE_FRIENDLY':
            return {
                label: 'Not Mobile Friendly',
                className: 'text-red-600',
            }
        default:
            return {
                label: 'Unknown',
                className: 'text-muted-foreground',
            }
    }
}

/**
 * Format date for display
 */
function formatDate(date: string | null): string {
    if (!date) return 'Never'
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

/**
 * Extract path from URL
 */
function getUrlPath(url: string): string {
    try {
        const urlObj = new URL(url)
        return urlObj.pathname || '/'
    } catch {
        return url
    }
}

/**
 * Index Coverage Card
 *
 * Shows indexing status for key pages using URL Inspection API.
 */
export function IndexCoverageCard() {
    const inspectionMutation = useUrlInspection()
    const [results, setResults] = useState<UrlInspectionResult[]>([])
    const [customUrl, setCustomUrl] = useState('')
    const [hasInspected, setHasInspected] = useState(false)

    const handleInspect = async (urls: string[], append = false) => {
        try {
            const response = await inspectionMutation.mutateAsync(urls)
            if (response.data) {
                if (append) {
                    setResults((prev) => [...prev, ...response.data])
                } else {
                    setResults(response.data)
                }
                setHasInspected(true)
            }
        } catch (error) {
            console.error('Failed to inspect URLs:', error)
        }
    }

    const handleInspectDefault = () => {
        void handleInspect(DEFAULT_URLS)
    }

    const handleAddUrl = () => {
        if (customUrl && !results.find((r) => r.url === customUrl)) {
            void handleInspect([customUrl], true)
            setCustomUrl('')
        }
    }

    // Calculate summary stats
    const indexed = results.filter(
        (r) => r.coverageState === 'SUBMITTED_AND_INDEXED'
    ).length
    const notIndexed = results.filter(
        (r) =>
            r.coverageState !== 'SUBMITTED_AND_INDEXED' &&
            r.coverageState !== 'ERROR'
    ).length
    const errors = results.filter((r) => r.coverageState === 'ERROR').length

    return (
        <Card>
            <CardHeader>
                <div className='flex items-center justify-between'>
                    <div>
                        <CardTitle className='flex items-center gap-2 text-lg'>
                            <FileSearch className='h-5 w-5' />
                            Index Coverage
                        </CardTitle>
                        <CardDescription>
                            URL indexing status from Google
                        </CardDescription>
                    </div>
                    {!hasInspected && (
                        <Button
                            onClick={handleInspectDefault}
                            disabled={inspectionMutation.isPending}
                        >
                            {inspectionMutation.isPending ? (
                                <>
                                    <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                                    Inspecting...
                                </>
                            ) : (
                                <>
                                    <FileSearch className='mr-2 h-4 w-4' />
                                    Check Key Pages
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {inspectionMutation.isPending && results.length === 0 ? (
                    <TableSkeleton />
                ) : inspectionMutation.error ? (
                    <div className='flex h-[200px] flex-col items-center justify-center gap-3'>
                        <AlertCircle className='h-5 w-5 text-red-500' />
                        <p className='text-muted-foreground text-sm'>
                            Failed to inspect URLs
                        </p>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={handleInspectDefault}
                        >
                            <RefreshCw className='mr-2 h-4 w-4' />
                            Retry
                        </Button>
                    </div>
                ) : results.length > 0 ? (
                    <>
                        {/* Summary Stats */}
                        <div className='mb-4 flex flex-wrap gap-3'>
                            <Badge
                                variant='outline'
                                className='border-green-200 bg-green-50 text-green-700'
                            >
                                <CheckCircle2 className='mr-1 h-3 w-3' />
                                {indexed} Indexed
                            </Badge>
                            {notIndexed > 0 && (
                                <Badge
                                    variant='outline'
                                    className='border-yellow-200 bg-yellow-50 text-yellow-700'
                                >
                                    <Clock className='mr-1 h-3 w-3' />
                                    {notIndexed} Pending
                                </Badge>
                            )}
                            {errors > 0 && (
                                <Badge variant='destructive'>
                                    <XCircle className='mr-1 h-3 w-3' />
                                    {errors} Errors
                                </Badge>
                            )}
                            <Button
                                variant='ghost'
                                size='sm'
                                className='h-6'
                                onClick={handleInspectDefault}
                                disabled={inspectionMutation.isPending}
                            >
                                <RefreshCw
                                    className={cn(
                                        'h-3 w-3',
                                        inspectionMutation.isPending &&
                                            'animate-spin'
                                    )}
                                />
                            </Button>
                        </div>

                        {/* Add Custom URL */}
                        <div className='mb-4 flex gap-2'>
                            <Input
                                placeholder='Add custom URL to check...'
                                value={customUrl}
                                onChange={(e) => setCustomUrl(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === 'Enter' && handleAddUrl()
                                }
                                className='flex-1'
                            />
                            <Button
                                variant='outline'
                                size='icon'
                                onClick={handleAddUrl}
                                disabled={
                                    !customUrl || inspectionMutation.isPending
                                }
                            >
                                <Plus className='h-4 w-4' />
                            </Button>
                        </div>

                        {/* Results Table */}
                        <div className='max-h-[350px] overflow-auto'>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>URL</TableHead>
                                        <TableHead className='w-[100px]'>
                                            Status
                                        </TableHead>
                                        <TableHead className='w-[100px]'>
                                            Mobile
                                        </TableHead>
                                        <TableHead className='w-[100px]'>
                                            Last Crawl
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {results.map((result) => {
                                        const status = getCoverageStatus(
                                            result.coverageState
                                        )
                                        const mobile = getMobileStatus(
                                            result.mobileUsability
                                        )
                                        const StatusIcon = status.icon

                                        return (
                                            <TableRow key={result.url}>
                                                <TableCell>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <a
                                                                    href={
                                                                        result.url
                                                                    }
                                                                    target='_blank'
                                                                    rel='noopener noreferrer'
                                                                    className='flex items-center gap-1.5 hover:underline'
                                                                >
                                                                    <span className='max-w-[180px] truncate font-medium'>
                                                                        {getUrlPath(
                                                                            result.url
                                                                        )}
                                                                    </span>
                                                                    <ExternalLink className='h-3 w-3 opacity-50' />
                                                                </a>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p className='max-w-[300px] break-all'>
                                                                    {result.url}
                                                                </p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={status.variant}
                                                        className={cn(
                                                            'text-xs',
                                                            status.className
                                                        )}
                                                    >
                                                        <StatusIcon className='mr-1 h-3 w-3' />
                                                        {status.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={cn(
                                                            'flex items-center gap-1 text-xs',
                                                            mobile.className
                                                        )}
                                                    >
                                                        <Smartphone className='h-3 w-3' />
                                                        {result.mobileUsability ===
                                                        'MOBILE_FRIENDLY'
                                                            ? 'OK'
                                                            : 'Issues'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className='text-muted-foreground text-xs'>
                                                    {formatDate(
                                                        result.lastCrawlTime
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </>
                ) : (
                    <div className='flex h-[200px] flex-col items-center justify-center gap-3'>
                        <FileSearch className='text-muted-foreground h-8 w-8' />
                        <p className='text-muted-foreground text-sm'>
                            Check indexing status for key pages
                        </p>
                        <p className='text-muted-foreground text-xs'>
                            Uses Google&apos;s URL Inspection API (limited to
                            2,000 checks/day)
                        </p>
                        <Button
                            onClick={handleInspectDefault}
                            disabled={inspectionMutation.isPending}
                        >
                            {inspectionMutation.isPending ? (
                                <>
                                    <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                                    Inspecting...
                                </>
                            ) : (
                                <>
                                    <FileSearch className='mr-2 h-4 w-4' />
                                    Check Key Pages
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
