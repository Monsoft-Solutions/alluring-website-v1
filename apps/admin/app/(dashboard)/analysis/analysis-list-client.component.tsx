/**
 * Analysis List Client Component
 *
 * Client-side component for the analysis list page with filtering and pagination.
 *
 * @module app/(dashboard)/analysis/analysis-list-client
 */
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    type LucideIcon,
} from 'lucide-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'

import type { AnalysisListResult } from '@/lib/queries/media-analysis.query'

type AnalysisListClientProps = {
    initialData: AnalysisListResult
    initialFilters: {
        status?: string
        source?: string
    }
}

export function AnalysisListClient({
    initialData,
    initialFilters,
}: AnalysisListClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleFilterChange = (key: string, value: string) => {
        const filterParams = new URLSearchParams(searchParams.toString())
        if (value === 'all') {
            filterParams.delete(key)
        } else {
            filterParams.set(key, value)
        }
        filterParams.delete('page') // Reset to page 1 on filter change
        router.push(`/analysis?${filterParams.toString()}`)
    }

    const handlePageChange = (page: number) => {
        const pageParams = new URLSearchParams(searchParams.toString())
        pageParams.set('page', String(page))
        router.push(`/analysis?${pageParams.toString()}`)
    }

    return (
        <div className='space-y-6'>
            {/* Filters */}
            <Card>
                <CardContent className='pt-6'>
                    <div className='flex flex-wrap gap-4'>
                        <div className='w-48'>
                            <Select
                                value={initialFilters.status || 'all'}
                                onValueChange={(value) =>
                                    handleFilterChange('status', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder='All statuses' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='all'>
                                        All Statuses
                                    </SelectItem>
                                    <SelectItem value='pending'>
                                        Pending
                                    </SelectItem>
                                    <SelectItem value='analyzing'>
                                        Analyzing
                                    </SelectItem>
                                    <SelectItem value='completed'>
                                        Completed
                                    </SelectItem>
                                    <SelectItem value='applied'>
                                        Applied
                                    </SelectItem>
                                    <SelectItem value='failed'>
                                        Failed
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='w-48'>
                            <Select
                                value={initialFilters.source || 'all'}
                                onValueChange={(value) =>
                                    handleFilterChange('source', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder='All sources' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='all'>
                                        All Sources
                                    </SelectItem>
                                    <SelectItem value='instagram'>
                                        Instagram
                                    </SelectItem>
                                    <SelectItem value='gallery'>
                                        Gallery
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Analysis List */}
            {initialData.analyses.length === 0 ? (
                <Card>
                    <CardContent className='py-12 text-center'>
                        <p className='text-muted-foreground'>
                            No analysis sessions found. Create your first
                            analysis from the Instagram page.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className='space-y-4'>
                    {initialData.analyses.map((analysis) => (
                        <Card
                            key={analysis.id}
                            className='hover:border-primary transition-colors'
                        >
                            <CardHeader>
                                <div className='flex items-start justify-between'>
                                    <div className='space-y-1'>
                                        <div className='flex items-center gap-2'>
                                            <CardTitle className='text-lg'>
                                                {analysis.name}
                                            </CardTitle>
                                            <StatusBadge
                                                status={analysis.status}
                                            />
                                            <SourceBadge
                                                source={analysis.source}
                                            />
                                            <TypeBadge type={analysis.type} />
                                        </div>
                                        <CardDescription>
                                            {formatDate(analysis.startedAt)}
                                            {analysis.completedAt &&
                                                ` • Completed ${formatDate(analysis.completedAt)}`}
                                        </CardDescription>
                                    </div>
                                    <Button asChild size='sm'>
                                        <Link href={`/analysis/${analysis.id}`}>
                                            View Results
                                        </Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className='grid gap-4 sm:grid-cols-5'>
                                    <StatItem
                                        label='Total Media'
                                        value={analysis.totalMedia}
                                    />
                                    <StatItem
                                        label='Analyzed'
                                        value={analysis.analyzedMedia}
                                    />
                                    <StatItem
                                        label='Pairs'
                                        value={analysis.detectedPairs}
                                    />
                                    <StatItem
                                        label='Unpaired'
                                        value={analysis.unpairedMedia}
                                    />
                                    <StatItem
                                        label='Non-B&A'
                                        value={analysis.nonBAMedia}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {initialData.totalPages > 1 && (
                <div className='flex items-center justify-center gap-2'>
                    <Button
                        variant='outline'
                        onClick={() => handlePageChange(initialData.page - 1)}
                        disabled={initialData.page === 1}
                    >
                        Previous
                    </Button>
                    <span className='text-muted-foreground text-sm'>
                        Page {initialData.page} of {initialData.totalPages}
                    </span>
                    <Button
                        variant='outline'
                        onClick={() => handlePageChange(initialData.page + 1)}
                        disabled={initialData.page >= initialData.totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    )
}

// Helper components
function StatusBadge({
    status,
}: {
    status: 'pending' | 'analyzing' | 'completed' | 'applied' | 'failed'
}) {
    const variants: Record<
        typeof status,
        { variant: 'secondary' | 'default' | 'destructive'; icon: LucideIcon }
    > = {
        pending: { variant: 'secondary', icon: Clock },
        analyzing: { variant: 'default', icon: Loader2 },
        completed: { variant: 'default', icon: CheckCircle2 },
        applied: { variant: 'default', icon: CheckCircle2 },
        failed: { variant: 'destructive', icon: AlertCircle },
    }

    const { variant, icon: Icon } = variants[status]

    return (
        <Badge variant={variant}>
            <Icon className='mr-1 h-3 w-3' />
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    )
}

function SourceBadge({ source }: { source: 'instagram' | 'gallery' }) {
    return (
        <Badge variant='outline'>
            {source === 'instagram' ? 'Instagram' : 'Gallery'}
        </Badge>
    )
}

function TypeBadge({ type }: { type: 'bulk' | 'single' }) {
    return (
        <Badge variant='outline'>{type === 'bulk' ? 'Bulk' : 'Single'}</Badge>
    )
}

function StatItem({ label, value }: { label: string; value: number }) {
    return (
        <div className='text-center'>
            <div className='text-2xl font-bold'>{value}</div>
            <div className='text-muted-foreground text-xs'>{label}</div>
        </div>
    )
}

function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    })
}
