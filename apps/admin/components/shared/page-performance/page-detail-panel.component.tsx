'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    ExternalLink,
    TrendingUp,
    Search,
    Lightbulb,
    ChevronDown,
    ChevronUp,
    X,
    Edit,
    FileText,
    LayoutList,
    Stethoscope,
    Globe,
    Image,
    Tag,
    HelpCircle,
} from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Badge } from '@workspace/ui/components/badge'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@workspace/ui/components/collapsible'

import { usePageQueries } from '@/hooks/use-search-console.hook'
import type { PageType } from '@/lib/types/search-console/search-console.type'
import { PageTrendChart } from './page-trend-chart.component'
import { SeoRecommendations } from './seo-recommendations.component'

type PageDetailPanelProps = {
    /** The full URL of the page */
    pageUrl: string
    /** Page path for display */
    path: string
    /** Page type for contextual actions */
    pageType: PageType
    /** Page metrics for recommendations */
    clicks: number
    impressions: number
    ctr: number
    position: number
    /** Number of days for the analysis */
    days?: number
    /** Callback to close the panel */
    onClose?: () => void
}

/**
 * Detail panel for a selected page.
 * Shows historical trend, driving queries, SEO recommendations, and quick actions.
 * Shared component for page analysis views and blog post analytics.
 */
export function PageDetailPanel({
    pageUrl,
    path,
    pageType,
    clicks,
    impressions,
    ctr,
    position,
    days = 28,
    onClose,
}: PageDetailPanelProps) {
    const [isTrendOpen, setIsTrendOpen] = useState(true)
    const [isQueriesOpen, setIsQueriesOpen] = useState(true)
    const [isRecommendationsOpen, setIsRecommendationsOpen] = useState(true)

    const { data: queriesData, isLoading: isQueriesLoading } = usePageQueries(
        pageUrl,
        days
    )

    // Extract slug for blog post edit link
    // Blog posts are at root level (e.g., /best-plastic-surgeon-miami)
    const blogSlug = pageType === 'blog' ? extractBlogSlug(path) : null

    return (
        <div className='bg-muted/30 space-y-4 rounded-lg border p-4'>
            {/* Header */}
            <div className='flex items-start justify-between gap-4'>
                <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-2'>
                        <h3 className='truncate font-medium' title={path}>
                            {path}
                        </h3>
                        <PageTypeBadge pageType={pageType} />
                    </div>
                    <div className='mt-1 flex flex-wrap gap-2'>
                        <Badge variant='secondary'>
                            {clicks.toLocaleString()} clicks
                        </Badge>
                        <Badge variant='outline'>
                            {impressions.toLocaleString()} impr
                        </Badge>
                        <Badge variant='outline'>
                            CTR: {(ctr * 100).toFixed(1)}%
                        </Badge>
                        <Badge variant='outline'>
                            Pos: {position.toFixed(1)}
                        </Badge>
                    </div>
                </div>
                {onClose && (
                    <Button
                        variant='ghost'
                        size='sm'
                        onClick={onClose}
                        className='h-8 w-8 p-0'
                    >
                        <X className='h-4 w-4' />
                        <span className='sr-only'>Close</span>
                    </Button>
                )}
            </div>

            {/* Quick Actions */}
            <div className='flex flex-wrap gap-2'>
                <Button variant='outline' size='sm' asChild>
                    <a href={pageUrl} target='_blank' rel='noopener noreferrer'>
                        <ExternalLink className='mr-2 h-4 w-4' />
                        View Page
                    </a>
                </Button>
                {blogSlug && (
                    <Button variant='outline' size='sm' asChild>
                        <Link href={`/blog/posts/${blogSlug}/edit`}>
                            <Edit className='mr-2 h-4 w-4' />
                            Edit Post
                        </Link>
                    </Button>
                )}
            </div>

            {/* Trend Section */}
            <Collapsible open={isTrendOpen} onOpenChange={setIsTrendOpen}>
                <CollapsibleTrigger asChild>
                    <Button
                        variant='ghost'
                        size='sm'
                        className='flex w-full items-center justify-between p-2'
                    >
                        <span className='flex items-center gap-2 text-sm font-medium'>
                            <TrendingUp className='h-4 w-4' />
                            Performance Trend
                        </span>
                        {isTrendOpen ? (
                            <ChevronUp className='h-4 w-4' />
                        ) : (
                            <ChevronDown className='h-4 w-4' />
                        )}
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className='pt-2'>
                    <PageTrendChart
                        pageUrl={pageUrl}
                        days={days}
                        height={180}
                    />
                </CollapsibleContent>
            </Collapsible>

            {/* Recommendations Section */}
            <Collapsible
                open={isRecommendationsOpen}
                onOpenChange={setIsRecommendationsOpen}
            >
                <CollapsibleTrigger asChild>
                    <Button
                        variant='ghost'
                        size='sm'
                        className='flex w-full items-center justify-between p-2'
                    >
                        <span className='flex items-center gap-2 text-sm font-medium'>
                            <Lightbulb className='h-4 w-4 text-amber-500' />
                            SEO Recommendations
                        </span>
                        {isRecommendationsOpen ? (
                            <ChevronUp className='h-4 w-4' />
                        ) : (
                            <ChevronDown className='h-4 w-4' />
                        )}
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className='pt-2'>
                    <SeoRecommendations
                        clicks={clicks}
                        impressions={impressions}
                        ctr={ctr}
                        position={position}
                    />
                </CollapsibleContent>
            </Collapsible>

            {/* Queries Section */}
            <Collapsible open={isQueriesOpen} onOpenChange={setIsQueriesOpen}>
                <CollapsibleTrigger asChild>
                    <Button
                        variant='ghost'
                        size='sm'
                        className='flex w-full items-center justify-between p-2'
                    >
                        <span className='flex items-center gap-2 text-sm font-medium'>
                            <Search className='h-4 w-4' />
                            Driving Queries
                            {queriesData?.data && (
                                <Badge variant='secondary' className='ml-1'>
                                    {queriesData.data.length}
                                </Badge>
                            )}
                        </span>
                        {isQueriesOpen ? (
                            <ChevronUp className='h-4 w-4' />
                        ) : (
                            <ChevronDown className='h-4 w-4' />
                        )}
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className='pt-2'>
                    {isQueriesLoading ? (
                        <div className='space-y-2'>
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className='h-12 w-full' />
                            ))}
                        </div>
                    ) : queriesData?.data && queriesData.data.length > 0 ? (
                        <div className='max-h-[300px] space-y-2 overflow-auto'>
                            {queriesData.data
                                .slice(0, 15)
                                .map((query, index) => (
                                    <div
                                        key={query.query}
                                        className='flex items-center gap-3 rounded-md border bg-white p-3'
                                    >
                                        <span className='text-muted-foreground flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-medium'>
                                            {index + 1}
                                        </span>
                                        <div className='min-w-0 flex-1'>
                                            <p
                                                className='truncate text-sm font-medium text-stone-900'
                                                title={query.query}
                                            >
                                                {query.query}
                                            </p>
                                            <div className='text-muted-foreground mt-0.5 flex gap-3 text-xs'>
                                                <span>
                                                    {query.clicks.toLocaleString()}{' '}
                                                    clicks
                                                </span>
                                                <span>
                                                    {query.impressions.toLocaleString()}{' '}
                                                    impr
                                                </span>
                                                <span>
                                                    Pos:{' '}
                                                    {query.position.toFixed(1)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            {queriesData.data.length > 15 && (
                                <p className='text-muted-foreground py-2 text-center text-xs'>
                                    Showing top 15 of {queriesData.data.length}{' '}
                                    queries
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className='text-muted-foreground py-4 text-center text-sm'>
                            No queries found for this page
                        </p>
                    )}
                </CollapsibleContent>
            </Collapsible>
        </div>
    )
}

/**
 * Extract blog post slug from path.
 * Blog posts are at root level (e.g., /best-plastic-surgeon-miami)
 * not under /blog/ prefix.
 */
function extractBlogSlug(path: string): string | null {
    // Remove leading slash and any trailing slash
    const slug = path.replace(/^\//, '').replace(/\/$/, '')
    // Return null if empty or contains additional path segments
    if (!slug || slug.includes('/')) {
        return null
    }
    return slug
}

/**
 * Page type configuration for badge display
 */
const PAGE_TYPE_CONFIG: Record<
    PageType,
    { label: string; className: string; icon: React.ReactNode }
> = {
    blog: {
        label: 'Blog Post',
        className: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: <FileText className='mr-1 h-3 w-3' />,
    },
    'blog-listing': {
        label: 'Blog Listing',
        className: 'bg-sky-100 text-sky-700 border-sky-200',
        icon: <LayoutList className='mr-1 h-3 w-3' />,
    },
    procedure: {
        label: 'Procedure',
        className: 'bg-purple-100 text-purple-700 border-purple-200',
        icon: <Stethoscope className='mr-1 h-3 w-3' />,
    },
    pages: {
        label: 'Page',
        className: 'bg-green-100 text-green-700 border-green-200',
        icon: <Globe className='mr-1 h-3 w-3' />,
    },
    gallery: {
        label: 'Gallery',
        className: 'bg-amber-100 text-amber-700 border-amber-200',
        icon: <Image className='mr-1 h-3 w-3' />,
    },
    promotion: {
        label: 'Promotion',
        className: 'bg-rose-100 text-rose-700 border-rose-200',
        icon: <Tag className='mr-1 h-3 w-3' />,
    },
    other: {
        label: 'Other',
        className: 'bg-stone-100 text-stone-700 border-stone-200',
        icon: <HelpCircle className='mr-1 h-3 w-3' />,
    },
}

/**
 * Badge component for page type display
 */
function PageTypeBadge({ pageType }: { pageType: PageType }) {
    const { label, className, icon } = PAGE_TYPE_CONFIG[pageType]

    return (
        <Badge variant='outline' className={className}>
            {icon}
            {label}
        </Badge>
    )
}
