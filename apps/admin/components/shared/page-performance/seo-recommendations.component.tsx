'use client'

import {
    TrendingUp,
    Eye,
    MousePointer,
    Search,
    FileText,
    AlertTriangle,
    CheckCircle,
} from 'lucide-react'
import { Badge } from '@workspace/ui/components/badge'
import { cn } from '@workspace/ui/lib/utils'

import type {
    PageSeoRecommendation,
    RecommendationPriority,
} from '@/lib/types/search-console/search-console.type'

/**
 * Generate SEO recommendations based on page metrics
 */
export function generateSeoRecommendations(
    clicks: number,
    impressions: number,
    ctr: number,
    position: number
): PageSeoRecommendation[] {
    const recommendations: PageSeoRecommendation[] = []

    // Position 4-10: Close to page 1, can optimize for higher rankings
    if (position >= 4 && position <= 10) {
        recommendations.push({
            id: 'striking-distance',
            title: 'Within striking distance of top 3',
            description:
                'This page ranks 4-10. Optimize content, add internal links, and improve title/description to reach top 3 positions.',
            priority: 'high',
            icon: 'trending-up',
        })
    }

    // Position 11-20: On page 2, needs push to page 1
    if (position >= 11 && position <= 20) {
        recommendations.push({
            id: 'page-two',
            title: 'Push from page 2 to page 1',
            description:
                'This page is on the second page of search results. Consider content expansion, link building, or keyword optimization.',
            priority: 'medium',
            icon: 'search',
        })
    }

    // High impressions but low CTR (< 2%): Improve title/meta
    if (impressions > 500 && ctr < 0.02) {
        recommendations.push({
            id: 'low-ctr',
            title: 'Improve click-through rate',
            description:
                'High visibility but low clicks. Rewrite title tag and meta description to be more compelling and include power words.',
            priority: 'high',
            icon: 'mouse-pointer',
        })
    }

    // Low impressions: Content may need refresh
    if (impressions < 100 && position > 20) {
        recommendations.push({
            id: 'low-visibility',
            title: 'Increase content visibility',
            description:
                'Low impressions suggest poor indexing or weak content. Consider refreshing content, improving keyword targeting, or building backlinks.',
            priority: 'medium',
            icon: 'eye',
        })
    }

    // Good CTR (> 5%) but low position: Content resonates, needs ranking boost
    if (ctr > 0.05 && position > 10) {
        recommendations.push({
            id: 'good-ctr-low-rank',
            title: 'Content resonates - boost rankings',
            description:
                'Users click when they see this page. Focus on improving rankings through internal links and content depth to increase visibility.',
            priority: 'medium',
            icon: 'trending-up',
        })
    }

    // Position 1-3 with high CTR: Doing great
    if (position <= 3 && ctr > 0.03) {
        recommendations.push({
            id: 'performing-well',
            title: 'Strong performance',
            description:
                'This page is ranking well with good CTR. Maintain content freshness and monitor for ranking changes.',
            priority: 'low',
            icon: 'file-text',
        })
    }

    // Sort by priority
    const priorityOrder: Record<RecommendationPriority, number> = {
        high: 0,
        medium: 1,
        low: 2,
    }
    recommendations.sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    )

    return recommendations
}

const ICON_MAP = {
    'trending-up': TrendingUp,
    eye: Eye,
    'mouse-pointer': MousePointer,
    search: Search,
    'file-text': FileText,
}

const PRIORITY_STYLES: Record<RecommendationPriority, string> = {
    high: 'border-amber-200 bg-amber-50',
    medium: 'border-blue-200 bg-blue-50',
    low: 'border-green-200 bg-green-50',
}

const PRIORITY_BADGE_STYLES: Record<RecommendationPriority, string> = {
    high: 'bg-amber-100 text-amber-700 border-amber-200',
    medium: 'bg-blue-100 text-blue-700 border-blue-200',
    low: 'bg-green-100 text-green-700 border-green-200',
}

type SeoRecommendationsProps = {
    /** Page clicks */
    clicks: number
    /** Page impressions */
    impressions: number
    /** Page CTR (0-1) */
    ctr: number
    /** Page average position */
    position: number
    /** Maximum recommendations to show */
    maxRecommendations?: number
    /** Additional class names */
    className?: string
}

/**
 * Display SEO recommendations based on page performance metrics.
 * Shared component for page detail views and blog post analytics.
 */
export function SeoRecommendations({
    clicks,
    impressions,
    ctr,
    position,
    maxRecommendations = 3,
    className,
}: SeoRecommendationsProps) {
    const recommendations = generateSeoRecommendations(
        clicks,
        impressions,
        ctr,
        position
    ).slice(0, maxRecommendations)

    if (recommendations.length === 0) {
        return (
            <div
                className={cn(
                    'flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3',
                    className
                )}
            >
                <CheckCircle className='h-5 w-5 text-green-600' />
                <p className='text-sm text-green-700'>
                    No immediate optimization opportunities identified.
                </p>
            </div>
        )
    }

    return (
        <div className={cn('space-y-3', className)}>
            {recommendations.map((rec) => {
                const Icon = ICON_MAP[rec.icon]
                return (
                    <div
                        key={rec.id}
                        className={cn(
                            'flex gap-3 rounded-lg border p-3',
                            PRIORITY_STYLES[rec.priority]
                        )}
                    >
                        <div className='flex-shrink-0 pt-0.5'>
                            {rec.priority === 'high' ? (
                                <AlertTriangle className='h-5 w-5 text-amber-600' />
                            ) : (
                                <Icon className='text-muted-foreground h-5 w-5' />
                            )}
                        </div>
                        <div className='min-w-0 flex-1'>
                            <div className='mb-1 flex items-center gap-2'>
                                <span className='font-medium text-stone-900'>
                                    {rec.title}
                                </span>
                                <Badge
                                    variant='outline'
                                    className={cn(
                                        'text-xs capitalize',
                                        PRIORITY_BADGE_STYLES[rec.priority]
                                    )}
                                >
                                    {rec.priority}
                                </Badge>
                            </div>
                            <p className='text-muted-foreground text-sm'>
                                {rec.description}
                            </p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
