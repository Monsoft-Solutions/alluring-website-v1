/**
 * Analysis Panel Component
 *
 * Main panel for displaying blog post quality analysis.
 * Shows overall score, grade, category breakdowns, and top suggestions.
 *
 * @module apps/admin/components/blog/analysis-panel
 */
'use client'

import { useState } from 'react'
import {
    Loader2,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    Sparkles,
} from 'lucide-react'

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Alert, AlertDescription } from '@workspace/ui/components/alert'

import {
    useBlogAnalysis,
    useAnalyzeBlogPost,
} from '@/hooks/use-blog-analysis.hook'

import { AnalysisScoreCard } from './analysis-score-card.component'

type AnalysisPanelProps = {
    blogPostId: string
}

/**
 * Get grade color
 */
function getGradeColor(grade: string): string {
    switch (grade) {
        case 'A':
            return 'bg-green-600 hover:bg-green-700'
        case 'B':
            return 'bg-blue-600 hover:bg-blue-700'
        case 'C':
            return 'bg-yellow-600 hover:bg-yellow-700'
        case 'D':
            return 'bg-orange-600 hover:bg-orange-700'
        case 'F':
            return 'bg-red-600 hover:bg-red-700'
        default:
            return 'bg-gray-600 hover:bg-gray-700'
    }
}

/**
 * Get priority color
 */
function getPriorityColor(priority: 'high' | 'medium' | 'low'): string {
    switch (priority) {
        case 'high':
            return 'text-red-600'
        case 'medium':
            return 'text-yellow-600'
        case 'low':
            return 'text-blue-600'
    }
}

/**
 * Get priority icon
 */
function getPriorityIcon(priority: 'high' | 'medium' | 'low') {
    switch (priority) {
        case 'high':
            return <AlertTriangle className='h-4 w-4' />
        case 'medium':
            return <TrendingUp className='h-4 w-4' />
        case 'low':
            return <CheckCircle2 className='h-4 w-4' />
    }
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date)
}

/**
 * Category weights for display
 */
const CATEGORY_WEIGHTS = {
    title: 10,
    metaDescription: 10,
    contentLength: 10,
    readability: 15,
    headingStructure: 10,
    keywords: 15,
    linking: 10,
    visualContent: 10,
    structure: 10,
}

/**
 * Category display names
 */
const CATEGORY_NAMES = {
    title: 'Title Optimization',
    metaDescription: 'Meta Description',
    contentLength: 'Content Length',
    readability: 'Readability',
    headingStructure: 'Heading Structure',
    keywords: 'Keyword Optimization',
    linking: 'Linking Strategy',
    visualContent: 'Visual Content',
    structure: 'Content Structure',
}

export function AnalysisPanel({ blogPostId }: AnalysisPanelProps) {
    const [showDetails, setShowDetails] = useState(false)

    const { data: analysis, isLoading, error } = useBlogAnalysis(blogPostId)
    const { mutate: analyze, isPending: isAnalyzing } = useAnalyzeBlogPost()

    const handleAnalyze = () => {
        analyze(blogPostId)
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Quality Analysis</CardTitle>
                    <CardDescription>Loading analysis...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='space-y-4'>
                        <Skeleton className='h-24 w-full' />
                        <Skeleton className='h-16 w-full' />
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error || !analysis) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Sparkles className='h-5 w-5' />
                        Quality Analysis
                    </CardTitle>
                    <CardDescription>
                        Get AI-powered insights on your blog post quality and
                        SEO optimization
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='flex flex-col items-center justify-center gap-4 py-8'>
                        <p className='text-muted-foreground text-center text-sm'>
                            No analysis available yet. Run an analysis to get
                            detailed feedback.
                        </p>
                        <Button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            size='lg'
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className='mr-2 h-4 w-4' />
                                    Run Analysis
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const { analysisDetails } = analysis

    return (
        <div className='space-y-4'>
            {/* Overall Score Card */}
            <Card>
                <CardHeader>
                    <div className='flex items-center justify-between'>
                        <div>
                            <CardTitle className='flex items-center gap-2'>
                                <Sparkles className='h-5 w-5' />
                                Quality Analysis
                            </CardTitle>
                            <CardDescription>
                                Last analyzed: {formatDate(analysis.analyzedAt)}
                            </CardDescription>
                        </div>
                        <Button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            variant='outline'
                            size='sm'
                        >
                            {isAnalyzing ? (
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            ) : (
                                <RefreshCw className='mr-2 h-4 w-4' />
                            )}
                            Re-analyze
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                    {/* Overall Score Display */}
                    <div className='bg-muted/50 flex items-center justify-between rounded-lg border p-6'>
                        <div>
                            <p className='text-muted-foreground text-sm font-medium'>
                                Overall Score
                            </p>
                            <p className='text-4xl font-bold'>
                                {analysis.overallScore}
                                <span className='text-muted-foreground text-2xl'>
                                    /100
                                </span>
                            </p>
                        </div>
                        <Badge
                            className={`${getGradeColor(analysis.grade)} px-4 py-2 text-2xl`}
                        >
                            {analysis.grade}
                        </Badge>
                    </div>

                    {/* Summary */}
                    <Alert>
                        <AlertDescription>
                            {analysisDetails.summary}
                        </AlertDescription>
                    </Alert>

                    {/* Top Suggestions */}
                    <div className='space-y-2'>
                        <h4 className='text-sm font-medium'>
                            Top Priority Improvements
                        </h4>
                        <div className='space-y-2'>
                            {analysisDetails.topSuggestions.map(
                                (suggestion, index) => (
                                    <div
                                        key={index}
                                        className='flex items-start gap-3 rounded-lg border p-3'
                                    >
                                        <span
                                            className={getPriorityColor(
                                                suggestion.priority
                                            )}
                                        >
                                            {getPriorityIcon(
                                                suggestion.priority
                                            )}
                                        </span>
                                        <div className='flex-1 space-y-1'>
                                            <div className='flex items-center gap-2'>
                                                <Badge
                                                    variant='outline'
                                                    className='text-xs'
                                                >
                                                    {suggestion.category}
                                                </Badge>
                                                <Badge
                                                    variant={
                                                        suggestion.priority ===
                                                        'high'
                                                            ? 'destructive'
                                                            : 'secondary'
                                                    }
                                                    className='text-xs'
                                                >
                                                    {suggestion.priority}
                                                </Badge>
                                            </div>
                                            <p className='text-sm'>
                                                {suggestion.suggestion}
                                            </p>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    {/* Toggle Details Button */}
                    <Button
                        onClick={() => setShowDetails(!showDetails)}
                        variant='outline'
                        className='w-full'
                    >
                        {showDetails ? (
                            <>
                                <ChevronUp className='mr-2 h-4 w-4' />
                                Hide Detailed Breakdown
                            </>
                        ) : (
                            <>
                                <ChevronDown className='mr-2 h-4 w-4' />
                                Show Detailed Breakdown
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Detailed Category Breakdown */}
            {showDetails && (
                <div className='grid gap-4 md:grid-cols-2'>
                    {Object.entries(analysisDetails.categories).map(
                        ([key, category]) => (
                            <AnalysisScoreCard
                                key={key}
                                title={
                                    CATEGORY_NAMES[
                                        key as keyof typeof CATEGORY_NAMES
                                    ]
                                }
                                category={category}
                                weight={
                                    CATEGORY_WEIGHTS[
                                        key as keyof typeof CATEGORY_WEIGHTS
                                    ]
                                }
                            />
                        )
                    )}
                </div>
            )}
        </div>
    )
}
