'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
    FileText,
    AlertCircle,
    RefreshCw,
    Sparkles,
    Clock,
    CheckCircle2,
    XCircle,
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip'

import {
    useBlogSeoAudit,
    useAnalyzeBlogPost,
} from '@/hooks/use-blog-seo-audit.hook'
import { cn } from '@workspace/ui/lib/utils'
import { TableSkeleton } from '@/components/shared/skeletons/table-skeleton.component'

/**
 * Get badge variant and color based on grade
 */
function getGradeStyles(grade: string): {
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
    className: string
} {
    switch (grade) {
        case 'A':
            return {
                variant: 'default',
                className: 'bg-green-500 hover:bg-green-600',
            }
        case 'B':
            return {
                variant: 'default',
                className: 'bg-blue-500 hover:bg-blue-600',
            }
        case 'C':
            return {
                variant: 'secondary',
                className: 'bg-yellow-500 text-black hover:bg-yellow-600',
            }
        case 'D':
            return {
                variant: 'secondary',
                className: 'bg-orange-500 hover:bg-orange-600',
            }
        case 'F':
            return {
                variant: 'destructive',
                className: '',
            }
        default:
            return {
                variant: 'outline',
                className: '',
            }
    }
}

/**
 * Format date for display
 */
function formatDate(date: Date | string | null): string {
    if (!date) return '-'
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

/**
 * Blog SEO Audit Card
 *
 * Shows all blog posts with their SEO analysis scores,
 * allowing users to analyze or re-analyze posts.
 */
export function BlogSeoAuditCard() {
    const { data, isLoading, error, refetch } = useBlogSeoAudit()
    const analyzeMutation = useAnalyzeBlogPost()
    const [analyzingId, setAnalyzingId] = useState<string | null>(null)

    const handleAnalyze = async (postId: string) => {
        setAnalyzingId(postId)
        try {
            await analyzeMutation.mutateAsync(postId)
            toast.success('SEO analysis complete')
        } catch (error) {
            console.error('Error analyzing blog post:', error)
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to analyze blog post'
            )
        } finally {
            setAnalyzingId(null)
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className='flex items-center justify-between'>
                    <div>
                        <CardTitle className='flex items-center gap-2 text-lg'>
                            <FileText className='h-5 w-5' />
                            Blog Post SEO Audit
                        </CardTitle>
                        <CardDescription>
                            AI-powered SEO analysis for all blog posts
                        </CardDescription>
                    </div>
                    {data && (
                        <div className='flex items-center gap-4 text-sm'>
                            <div className='text-muted-foreground'>
                                <span className='text-foreground font-medium'>
                                    {data.summary.analyzedPosts}
                                </span>
                                /{data.summary.totalPosts} analyzed
                            </div>
                            {data.summary.averageScore > 0 && (
                                <Badge variant='outline'>
                                    Avg: {data.summary.averageScore}
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <TableSkeleton />
                ) : error ? (
                    <div className='flex h-[300px] flex-col items-center justify-center gap-3'>
                        <AlertCircle className='h-5 w-5 text-red-500' />
                        <p className='text-muted-foreground text-sm'>
                            Failed to load blog audit data
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
                ) : data && data.posts.length > 0 ? (
                    <>
                        {/* Grade Distribution Summary */}
                        <div className='mb-4 flex flex-wrap gap-2'>
                            {Object.entries(data.summary.gradeDistribution).map(
                                ([grade, count]) => (
                                    <div
                                        key={grade}
                                        className='flex items-center gap-1.5'
                                    >
                                        <Badge
                                            {...getGradeStyles(grade)}
                                            className={cn(
                                                'h-6 w-6 justify-center p-0 text-xs',
                                                getGradeStyles(grade).className
                                            )}
                                        >
                                            {grade}
                                        </Badge>
                                        <span className='text-muted-foreground text-sm'>
                                            {count}
                                        </span>
                                    </div>
                                )
                            )}
                            <div className='flex items-center gap-1.5'>
                                <Badge
                                    variant='outline'
                                    className='h-6 w-6 justify-center p-0 text-xs'
                                >
                                    ?
                                </Badge>
                                <span className='text-muted-foreground text-sm'>
                                    {data.summary.totalPosts -
                                        data.summary.analyzedPosts}
                                </span>
                            </div>
                        </div>

                        {/* Posts Table */}
                        <div className='max-h-[450px] overflow-auto'>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Post</TableHead>
                                        <TableHead className='w-[80px] text-center'>
                                            Grade
                                        </TableHead>
                                        <TableHead className='w-[80px] text-right'>
                                            Score
                                        </TableHead>
                                        <TableHead className='w-[100px]'>
                                            Status
                                        </TableHead>
                                        <TableHead className='w-[110px]'>
                                            Analyzed
                                        </TableHead>
                                        <TableHead className='w-[100px]'>
                                            Action
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.posts.map((post) => (
                                        <TableRow key={post.id}>
                                            <TableCell className='max-w-[250px]'>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span className='block truncate font-medium'>
                                                                {post.title}
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className='max-w-[300px]'>
                                                                {post.title}
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableCell>
                                            <TableCell className='text-center'>
                                                {post.analysis ? (
                                                    <Badge
                                                        {...getGradeStyles(
                                                            post.analysis.grade
                                                        )}
                                                        className={cn(
                                                            'h-7 w-7 justify-center p-0 text-sm font-bold',
                                                            getGradeStyles(
                                                                post.analysis
                                                                    .grade
                                                            ).className
                                                        )}
                                                    >
                                                        {post.analysis.grade}
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant='outline'
                                                        className='h-7 w-7 justify-center p-0 text-sm'
                                                    >
                                                        ?
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className='text-right'>
                                                {post.analysis ? (
                                                    <span
                                                        className={cn(
                                                            'font-medium',
                                                            post.analysis
                                                                .overallScore >=
                                                                75 &&
                                                                'text-green-600',
                                                            post.analysis
                                                                .overallScore >=
                                                                60 &&
                                                                post.analysis
                                                                    .overallScore <
                                                                    75 &&
                                                                'text-yellow-600',
                                                            post.analysis
                                                                .overallScore <
                                                                60 &&
                                                                'text-red-600'
                                                        )}
                                                    >
                                                        {
                                                            post.analysis
                                                                .overallScore
                                                        }
                                                    </span>
                                                ) : (
                                                    <span className='text-muted-foreground'>
                                                        -
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge
                                                    status={post.status}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {post.analysis ? (
                                                    <div className='text-muted-foreground flex items-center gap-1 text-xs'>
                                                        {post.analysis
                                                            .isOutdated ? (
                                                            <Clock className='h-3 w-3 text-yellow-500' />
                                                        ) : (
                                                            <CheckCircle2 className='h-3 w-3 text-green-500' />
                                                        )}
                                                        {formatDate(
                                                            post.analysis
                                                                .analyzedAt
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className='text-muted-foreground text-xs'>
                                                        Never
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    className='h-8 px-2'
                                                    onClick={() =>
                                                        handleAnalyze(post.id)
                                                    }
                                                    disabled={
                                                        analyzingId === post.id
                                                    }
                                                >
                                                    {analyzingId === post.id ? (
                                                        <>
                                                            <RefreshCw className='mr-1 h-3 w-3 animate-spin' />
                                                            <span className='text-xs'>
                                                                Analyzing
                                                            </span>
                                                        </>
                                                    ) : post.analysis ? (
                                                        <>
                                                            <RefreshCw className='mr-1 h-3 w-3' />
                                                            <span className='text-xs'>
                                                                Re-analyze
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Sparkles className='mr-1 h-3 w-3' />
                                                            <span className='text-xs'>
                                                                Analyze
                                                            </span>
                                                        </>
                                                    )}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </>
                ) : (
                    <div className='flex h-[300px] flex-col items-center justify-center gap-2'>
                        <FileText className='text-muted-foreground h-8 w-8' />
                        <p className='text-muted-foreground text-sm'>
                            No blog posts found
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

/**
 * Status badge component
 */
function StatusBadge({
    status,
}: {
    status: 'draft' | 'readyToPublish' | 'published' | null
}) {
    switch (status) {
        case 'published':
            return (
                <Badge
                    variant='outline'
                    className='border-green-200 bg-green-50 text-xs text-green-700'
                >
                    <CheckCircle2 className='mr-1 h-3 w-3' />
                    Published
                </Badge>
            )
        case 'readyToPublish':
            return (
                <Badge
                    variant='outline'
                    className='border-blue-200 bg-blue-50 text-xs text-blue-700'
                >
                    <Clock className='mr-1 h-3 w-3' />
                    Ready
                </Badge>
            )
        case 'draft':
            return (
                <Badge
                    variant='outline'
                    className='border-gray-200 bg-gray-50 text-xs text-gray-700'
                >
                    <XCircle className='mr-1 h-3 w-3' />
                    Draft
                </Badge>
            )
        default:
            return (
                <Badge variant='outline' className='text-xs'>
                    Unknown
                </Badge>
            )
    }
}
