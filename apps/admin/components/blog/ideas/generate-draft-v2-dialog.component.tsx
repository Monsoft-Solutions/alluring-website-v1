'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog'
import { Button } from '@workspace/ui/components/button'
import { Progress } from '@workspace/ui/components/progress'
import { Badge } from '@workspace/ui/components/badge'
import { ScrollArea } from '@workspace/ui/components/scroll-area'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@workspace/ui/components/collapsible'
import {
    Loader2,
    FileText,
    Check,
    AlertTriangle,
    Sparkles,
    BookOpen,
    Search,
    Link,
    Shield,
    Pencil,
    Bot,
    Wand2,
    ChevronDown,
    Clock,
} from 'lucide-react'

import type { BlogIdeaDetail } from '@/lib/queries/ideas.query'
import type {
    DialogStep,
    SSECompleteEvent,
    SSEErrorEvent,
    SSEEventData,
    SSEProgressEvent,
    SSEResearchFindingData,
    SSEResearchQueryData,
} from '@/lib/types/blog/pipeline.type'
import { createBlogPost } from '@/lib/actions/blog.action'
import { linkIdeaToBlogPost } from '@/lib/actions/idea.action'
import { ResearchFindingsDisplay } from './research-findings-display.component'
import { StepIndicator } from './step-indicator.component'

type GenerateDraftV2DialogProps = {
    idea: BlogIdeaDetail
    open: boolean
    onOpenChange: (open: boolean) => void
}

const STEP_LABELS: Record<string, string> = {
    research: 'Researching topic...',
    'content-generation': 'Generating content...',
    'link-integration': 'Adding links...',
    'review-internal-links': 'Reviewing internal links...',
    'review-external-links': 'Reviewing external links...',
    'review-writing-quality': 'Checking writing quality...',
    'review-ai-slop': 'Detecting AI patterns...',
    orchestration: 'Creating final revisions...',
    saving: 'Saving draft...',
    complete: 'Complete!',
}

function getScoreColor(score: number): string {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-emerald-600'
    if (score >= 60) return 'text-amber-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
}

function getScoreBadgeVariant(
    score: number
): 'default' | 'secondary' | 'destructive' | 'outline' {
    if (score >= 75) return 'default'
    if (score >= 60) return 'secondary'
    if (score >= 40) return 'outline'
    return 'destructive'
}

function formatTime(ms: number): string {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
}

/**
 * Enhanced dialog for generating blog posts using the AI pipeline
 * with research, review agents, and orchestration.
 */
export function GenerateDraftV2Dialog({
    idea,
    open,
    onOpenChange,
}: GenerateDraftV2DialogProps) {
    const router = useRouter()
    const [step, setStep] = useState<DialogStep>('idle')
    const [progress, setProgress] = useState(0)
    const [stepMessage, setStepMessage] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [result, setResult] = useState<SSECompleteEvent | null>(null)
    const [postId, setPostId] = useState<string | null>(null)
    const [showReviews, setShowReviews] = useState(false)
    const [useAdvancedPipeline, setUseAdvancedPipeline] = useState(true)

    // Research findings state
    const [researchFindings, setResearchFindings] = useState<
        SSEResearchFindingData[]
    >([])
    const [currentQuery, setCurrentQuery] =
        useState<SSEResearchQueryData | null>(null)

    const calculateOverallProgress = useCallback(
        (currentStep: DialogStep, stepProgress: number): number => {
            const stepWeights: Record<
                string,
                { start: number; weight: number }
            > = {
                research: { start: 0, weight: 10 },
                'content-generation': { start: 10, weight: 25 },
                'link-integration': { start: 35, weight: 5 },
                'review-internal-links': { start: 40, weight: 10 },
                'review-external-links': { start: 40, weight: 10 },
                'review-writing-quality': { start: 40, weight: 10 },
                'review-ai-slop': { start: 40, weight: 10 },
                orchestration: { start: 60, weight: 25 },
                saving: { start: 85, weight: 15 },
                complete: { start: 100, weight: 0 },
            }

            const stepInfo = stepWeights[currentStep]
            if (!stepInfo) return 0

            return Math.min(
                100,
                stepInfo.start + (stepProgress / 100) * stepInfo.weight
            )
        },
        []
    )

    const handleGenerate = async () => {
        setStep('research')
        setProgress(5)
        setError(null)
        setResult(null)
        setStepMessage('Starting pipeline...')
        setResearchFindings([])
        setCurrentQuery(null)

        try {
            // Build outline structure
            const outlineForContent = {
                tldr: idea.outline?.slice(0, 3).map((s) => s.title) || [
                    'Key takeaway 1',
                    'Key takeaway 2',
                ],
                introduction: {
                    hook: `Learn everything you need to know about ${idea.topic || idea.title}`,
                    preview: `This guide covers ${idea.title}`,
                },
                sections: (idea.outline || []).map((s, i) => ({
                    id: `section-${i}`,
                    title: s.title,
                    description: s.description || s.title,
                    keyPoints: [],
                    subsections:
                        s.subsections?.map((sub) => ({
                            title: sub.title,
                            description: sub.description,
                        })) || [],
                })),
                conclusion: {
                    summaryPoints: ['Summary point 1', 'Summary point 2'],
                    nextSteps: 'Contact us to learn more',
                },
            }

            // If outline is empty, create a basic structure
            if (outlineForContent.sections.length === 0) {
                outlineForContent.sections = [
                    {
                        id: 'section-0',
                        title: 'Introduction',
                        description: 'Overview of the topic',
                        keyPoints: [],
                        subsections: [],
                    },
                    {
                        id: 'section-1',
                        title: 'Key Information',
                        description: 'Main content',
                        keyPoints: [],
                        subsections: [],
                    },
                    {
                        id: 'section-2',
                        title: 'What to Expect',
                        description: 'Expectations and outcomes',
                        keyPoints: [],
                        subsections: [],
                    },
                ]
            }

            if (useAdvancedPipeline) {
                // Use streaming SSE endpoint
                const response = await fetch('/api/blog/generate-content-v2', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        idea: {
                            title: idea.title,
                            topic: idea.topic || idea.title,
                            primaryKeyword: idea.primaryKeyword || '',
                            secondaryKeywords: idea.secondaryKeywords || [],
                            targetAudience: idea.targetAudience,
                            uniqueAngle: idea.uniqueAngle,
                            estimatedWordCount: idea.estimatedWordCount || 1500,
                            contentType: idea.contentType || 'guide',
                        },
                        outline: outlineForContent,
                        options: {
                            stream: true,
                            skipResearch: false,
                            skipReview: false,
                        },
                    }),
                })

                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`)
                }

                const reader = response.body?.getReader()
                if (!reader) {
                    throw new Error('No response body')
                }

                const decoder = new TextDecoder()
                let buffer = ''
                // Local variable to capture pipeline result (avoids React state closure issue)
                let pipelineResult: SSECompleteEvent | null = null

                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break

                    buffer += decoder.decode(value, { stream: true })
                    const lines = buffer.split('\n\n')
                    buffer = lines.pop() || ''

                    for (const line of lines) {
                        if (line.startsWith('event: ')) {
                            const eventType = line.slice(7).split('\n')[0]
                            const dataLine = line.split('\ndata: ')[1]
                            if (dataLine) {
                                const data = JSON.parse(
                                    dataLine
                                ) as SSEEventData

                                if (eventType === 'progress') {
                                    const progressData =
                                        data as SSEProgressEvent
                                    setStep(progressData.step)
                                    setStepMessage(progressData.message)
                                    setProgress(
                                        calculateOverallProgress(
                                            progressData.step,
                                            progressData.progress
                                        )
                                    )

                                    // Capture research data
                                    if (progressData.data) {
                                        if (
                                            progressData.data.type ===
                                            'research-query'
                                        ) {
                                            setCurrentQuery(progressData.data)
                                        } else if (
                                            progressData.data.type ===
                                            'research-finding'
                                        ) {
                                            setCurrentQuery(null)
                                            setResearchFindings((prev) => [
                                                ...prev,
                                                progressData.data as SSEResearchFindingData,
                                            ])
                                        }
                                    }
                                } else if (eventType === 'complete') {
                                    const completeData =
                                        data as SSECompleteEvent
                                    pipelineResult = completeData
                                    setResult(completeData)
                                    if (completeData.success) {
                                        setStep('saving')
                                        setProgress(90)
                                    } else {
                                        throw new Error(
                                            completeData.error ||
                                                'Pipeline failed'
                                        )
                                    }
                                } else if (eventType === 'error') {
                                    const errorData = data as SSEErrorEvent
                                    throw new Error(
                                        errorData.error || 'Pipeline failed'
                                    )
                                }
                            }
                        }
                    }
                }

                // Save the post using the local variable (not stale state)
                if (pipelineResult?.success && pipelineResult.finalContent) {
                    await saveDraft(
                        pipelineResult.finalContent,
                        pipelineResult.initialContent
                    )
                }
            } else {
                // Use non-streaming endpoint
                const response = await fetch('/api/blog/generate-content-v2', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        idea: {
                            title: idea.title,
                            topic: idea.topic || idea.title,
                            primaryKeyword: idea.primaryKeyword || '',
                            secondaryKeywords: idea.secondaryKeywords || [],
                            targetAudience: idea.targetAudience,
                            uniqueAngle: idea.uniqueAngle,
                            estimatedWordCount: idea.estimatedWordCount || 1500,
                            contentType: idea.contentType || 'guide',
                        },
                        outline: outlineForContent,
                        options: {
                            stream: false,
                        },
                    }),
                })

                const data = (await response.json()) as SSECompleteEvent
                if (!data.success) {
                    throw new Error(data.error || 'Failed to generate content')
                }

                setResult({
                    success: true,
                    initialContent: data.initialContent,
                    reviews: data.reviews,
                    finalContent: data.finalContent,
                    changesSummary: data.changesSummary,
                    overallScore: data.overallScore,
                    totalProcessingTimeMs: data.totalProcessingTimeMs,
                    timeBreakdown: data.timeBreakdown,
                })

                setStep('saving')
                setProgress(90)

                if (data.finalContent) {
                    await saveDraft(data.finalContent, data.initialContent)
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
            setStep('error')
        }
    }

    const saveDraft = async (
        content: string,
        metadata?: { metaDescription?: string; excerpt?: string }
    ) => {
        // Generate slug from title
        const slug = idea.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')

        const createResult = await createBlogPost({
            title: idea.title,
            slug,
            content,
            metaDescription: metadata?.metaDescription || '',
            excerpt: metadata?.excerpt || '',
            primaryKeyword: idea.primaryKeyword,
            secondaryKeywords: idea.secondaryKeywords,
            authorId: idea.assignedAuthorId,
            status: 'draft',
        })

        if (!createResult.success) {
            throw new Error(createResult.error || 'Failed to create blog post')
        }

        setProgress(95)

        // Link idea to blog post
        if (createResult.id) {
            await linkIdeaToBlogPost(idea.id, createResult.id)
            setPostId(createResult.id)
        }

        setProgress(100)
        setStep('complete')
        toast.success('Draft created with AI pipeline!')
    }

    const handleViewPost = () => {
        if (postId) {
            router.push(`/blog/posts/${postId}/edit`)
        }
    }

    const handleClose = () => {
        if (step === 'complete') {
            router.refresh()
        }
        onOpenChange(false)
        setTimeout(() => {
            setStep('idle')
            setProgress(0)
            setError(null)
            setResult(null)
            setPostId(null)
            setStepMessage('')
            setShowReviews(false)
            setResearchFindings([])
            setCurrentQuery(null)
        }, 300)
    }

    const isProcessing =
        step !== 'idle' && step !== 'complete' && step !== 'error'

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent size='xl'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2'>
                        <Sparkles className='h-5 w-5 text-amber-500' />
                        AI Content Pipeline
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'idle' &&
                            'Generate content with research, review, and optimization'}
                        {isProcessing && (STEP_LABELS[step] || 'Processing...')}
                        {step === 'complete' && 'Draft created successfully!'}
                        {step === 'error' && 'An error occurred'}
                    </DialogDescription>
                </DialogHeader>

                <div className='py-4'>
                    {step === 'idle' && (
                        <div className='space-y-4'>
                            <div className='rounded-lg border bg-stone-50 p-4'>
                                <h4 className='mb-2 font-medium'>
                                    {idea.title}
                                </h4>
                                <p className='text-muted-foreground text-sm'>
                                    {idea.topic || 'No topic set'}
                                </p>
                            </div>

                            <div className='space-y-3'>
                                <h5 className='text-sm font-medium'>
                                    Pipeline Steps:
                                </h5>
                                <div className='grid gap-2 text-sm'>
                                    <div className='text-muted-foreground flex items-center gap-2'>
                                        <Search className='h-4 w-4' />
                                        <span>
                                            Research: Web search for latest info
                                        </span>
                                    </div>
                                    <div className='text-muted-foreground flex items-center gap-2'>
                                        <BookOpen className='h-4 w-4' />
                                        <span>
                                            Generate: AI-powered content
                                            creation
                                        </span>
                                    </div>
                                    <div className='text-muted-foreground flex items-center gap-2'>
                                        <Link className='h-4 w-4' />
                                        <span>
                                            Links: Internal & external link
                                            integration
                                        </span>
                                    </div>
                                    <div className='text-muted-foreground flex items-center gap-2'>
                                        <Shield className='h-4 w-4' />
                                        <span>
                                            Review: 4 specialized AI review
                                            agents
                                        </span>
                                    </div>
                                    <div className='text-muted-foreground flex items-center gap-2'>
                                        <Wand2 className='h-4 w-4' />
                                        <span>
                                            Orchestrate: Final revisions &
                                            polish
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <label className='flex cursor-pointer items-center gap-2'>
                                <input
                                    type='checkbox'
                                    checked={useAdvancedPipeline}
                                    onChange={(e) =>
                                        setUseAdvancedPipeline(e.target.checked)
                                    }
                                    className='rounded'
                                />
                                <span className='text-sm'>
                                    Use streaming progress (recommended)
                                </span>
                            </label>
                        </div>
                    )}

                    {isProcessing && (
                        <div className='space-y-4'>
                            <div className='space-y-2'>
                                <div className='flex items-center justify-between text-sm'>
                                    <span>
                                        {stepMessage || STEP_LABELS[step]}
                                    </span>
                                    <span className='text-muted-foreground'>
                                        {Math.round(progress)}%
                                    </span>
                                </div>
                                <Progress value={progress} className='h-2' />
                            </div>

                            <div className='space-y-2'>
                                <StepIndicator
                                    icon={Search}
                                    label='Research'
                                    status={
                                        step === 'research'
                                            ? 'loading'
                                            : progress >= 10
                                              ? 'complete'
                                              : 'pending'
                                    }
                                />
                                <StepIndicator
                                    icon={BookOpen}
                                    label='Generate Content'
                                    status={
                                        step === 'content-generation' ||
                                        step === 'link-integration'
                                            ? 'loading'
                                            : progress >= 40
                                              ? 'complete'
                                              : 'pending'
                                    }
                                />
                                <StepIndicator
                                    icon={Shield}
                                    label='Review (4 agents)'
                                    status={
                                        step.startsWith('review-')
                                            ? 'loading'
                                            : progress >= 60
                                              ? 'complete'
                                              : 'pending'
                                    }
                                />
                                <StepIndicator
                                    icon={Wand2}
                                    label='Orchestrate Revisions'
                                    status={
                                        step === 'orchestration'
                                            ? 'loading'
                                            : progress >= 85
                                              ? 'complete'
                                              : 'pending'
                                    }
                                />
                                <StepIndicator
                                    icon={FileText}
                                    label='Save Draft'
                                    status={
                                        step === 'saving'
                                            ? 'loading'
                                            : progress >= 100
                                              ? 'complete'
                                              : 'pending'
                                    }
                                />
                            </div>

                            {/* Research findings display */}
                            {(researchFindings.length > 0 ||
                                currentQuery !== null) && (
                                <ResearchFindingsDisplay
                                    findings={researchFindings}
                                    currentQuery={currentQuery}
                                    isSearching={step === 'research'}
                                />
                            )}
                        </div>
                    )}

                    {step === 'complete' && result && (
                        <div className='space-y-4'>
                            <div className='flex flex-col items-center py-4 text-center'>
                                <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
                                    <Check className='h-8 w-8 text-green-600' />
                                </div>
                                <h3 className='mb-2 text-lg font-medium'>
                                    Draft Created!
                                </h3>
                                {result.overallScore && (
                                    <div className='mb-2'>
                                        <Badge
                                            variant={getScoreBadgeVariant(
                                                result.overallScore
                                            )}
                                        >
                                            Quality Score: {result.overallScore}
                                            /100
                                        </Badge>
                                    </div>
                                )}
                                <p className='text-muted-foreground text-sm'>
                                    {result.changesSummary ||
                                        'Your blog post draft is ready for review.'}
                                </p>
                                {result.initialContent && (
                                    <p className='text-muted-foreground mt-2 text-xs'>
                                        ~{result.initialContent.wordCount} words
                                        generated
                                    </p>
                                )}
                                {result.totalProcessingTimeMs && (
                                    <p className='text-muted-foreground mt-1 flex items-center gap-1 text-xs'>
                                        <Clock className='h-3 w-3' />
                                        {formatTime(
                                            result.totalProcessingTimeMs
                                        )}{' '}
                                        total
                                    </p>
                                )}
                            </div>

                            {result.reviews && result.reviews.length > 0 && (
                                <Collapsible
                                    open={showReviews}
                                    onOpenChange={setShowReviews}
                                >
                                    <CollapsibleTrigger className='flex w-full items-center justify-between rounded-lg border bg-stone-50 p-3 text-sm font-medium hover:bg-stone-100'>
                                        <span className='flex items-center gap-2'>
                                            <Bot className='h-4 w-4' />
                                            Review Agent Results
                                        </span>
                                        <ChevronDown
                                            className={`h-4 w-4 transition-transform ${showReviews ? 'rotate-180' : ''}`}
                                        />
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <ScrollArea className='mt-2 h-48 rounded-lg border p-3'>
                                            <div className='space-y-3'>
                                                {result.reviews.map(
                                                    (review) => (
                                                        <div
                                                            key={
                                                                review.agentName
                                                            }
                                                            className='rounded border bg-white p-2'
                                                        >
                                                            <div className='mb-1 flex items-center justify-between'>
                                                                <span className='text-sm font-medium capitalize'>
                                                                    {review.agentName.replace(
                                                                        /-/g,
                                                                        ' '
                                                                    )}
                                                                </span>
                                                                <span
                                                                    className={`text-sm font-bold ${getScoreColor(review.score)}`}
                                                                >
                                                                    {
                                                                        review.score
                                                                    }
                                                                    /100
                                                                </span>
                                                            </div>
                                                            <p className='text-muted-foreground text-xs'>
                                                                {review.summary}
                                                            </p>
                                                            {review.issueCount >
                                                                0 && (
                                                                <p className='mt-1 text-xs text-amber-600'>
                                                                    {
                                                                        review.issueCount
                                                                    }{' '}
                                                                    issues found
                                                                </p>
                                                            )}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </CollapsibleContent>
                                </Collapsible>
                            )}
                        </div>
                    )}

                    {step === 'error' && (
                        <div className='flex flex-col items-center py-4 text-center'>
                            <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100'>
                                <AlertTriangle className='h-8 w-8 text-red-600' />
                            </div>
                            <h3 className='mb-2 text-lg font-medium'>
                                Generation Failed
                            </h3>
                            <p className='text-muted-foreground text-sm'>
                                {error || 'An unexpected error occurred'}
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {step === 'idle' && (
                        <>
                            <Button variant='outline' onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button onClick={handleGenerate}>
                                <Sparkles className='mr-2 h-4 w-4' />
                                Start Pipeline
                            </Button>
                        </>
                    )}

                    {isProcessing && (
                        <Button disabled>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Processing...
                        </Button>
                    )}

                    {step === 'complete' && (
                        <>
                            <Button variant='outline' onClick={handleClose}>
                                Close
                            </Button>
                            <Button onClick={handleViewPost}>
                                <Pencil className='mr-2 h-4 w-4' />
                                Edit Draft
                            </Button>
                        </>
                    )}

                    {step === 'error' && (
                        <>
                            <Button variant='outline' onClick={handleClose}>
                                Close
                            </Button>
                            <Button onClick={handleGenerate}>Try Again</Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
