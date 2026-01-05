'use client'

import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog'
import { Button } from '@workspace/ui/components/button'
import { Progress } from '@workspace/ui/components/progress'
import { Badge } from '@workspace/ui/components/badge'
import { ScrollArea } from '@workspace/ui/components/scroll-area'
import {
    Loader2,
    Check,
    AlertTriangle,
    Sparkles,
    BookOpen,
    Link,
    Shield,
    Pencil,
    Wand2,
    Clock,
} from 'lucide-react'

import type { BlogIdeaDetail } from '@/lib/queries/ideas.query'
import { useGenerateDraft } from '@/hooks/use-generate-draft.hook'
import {
    ReviewAgentsDisplay,
    ReviewAgentsSummary,
} from './review-agents-display.component'
import {
    ToolCallsDisplay,
    SourcesSummary,
} from './tool-calls-display.component'
import {
    STEP_LABELS,
    getScoreBadgeVariant,
    formatTime,
} from './generate-draft.util'

type GenerateDraftV2DialogProps = {
    idea: BlogIdeaDetail
    open: boolean
    onOpenChange: (open: boolean) => void
}

/**
 * Step labels for unified mode (combines agentic + review)
 */
const UNIFIED_STEP_LABELS: Record<string, string> = {
    ...STEP_LABELS,
    generation: 'AI writing with research tools...',
    'generation-tool-call': 'Researching...',
    'review-internal-links': 'Reviewing internal links...',
    'review-external-links': 'Reviewing external links...',
    'review-writing-quality': 'Reviewing writing quality...',
    'review-ai-slop': 'Checking for AI clichés...',
    orchestration: 'Revising content...',
    extraction: 'Extracting metadata and FAQs...',
}

/**
 * Enhanced dialog for generating blog posts using the unified AI pipeline
 * with research, review agents, and orchestration.
 *
 * Features:
 * - Real-time tool calls display
 * - Real-time review agent results display
 * - Integrated completion summary
 */
export function GenerateDraftV2Dialog({
    idea,
    open,
    onOpenChange,
}: GenerateDraftV2DialogProps) {
    const {
        step,
        progress,
        stepMessage,
        error,
        unifiedResult,
        isProcessing,
        isInReviewPhase,
        isInGenerationPhase,
        reviewResults,
        toolCalls,
        agenticSources,
        handleGenerate,
        handleViewPost,
        handleClose,
    } = useGenerateDraft({ idea, onOpenChange })

    // Get appropriate step label
    const currentStepLabel =
        typeof step === 'string' &&
        step in UNIFIED_STEP_LABELS &&
        UNIFIED_STEP_LABELS[step as string]
            ? UNIFIED_STEP_LABELS[step as string]
            : stepMessage

    // Determine word count from result
    const wordCount = unifiedResult?.wordCount

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent size='lg' className='max-h-[85vh] overflow-hidden'>
                {/* Compact Header */}
                <DialogHeader className='space-y-1 pb-2'>
                    <div className='flex items-center justify-between'>
                        <DialogTitle className='flex items-center gap-2 text-base'>
                            <Sparkles className='h-4 w-4 text-amber-500' />
                            AI Content Pipeline
                        </DialogTitle>
                        {isProcessing && (
                            <div className='flex items-center gap-2 text-xs text-stone-500'>
                                <span>{Math.round(progress)}%</span>
                                {wordCount && <span>~{wordCount} words</span>}
                            </div>
                        )}
                    </div>

                    {/* Status bar during processing */}
                    {isProcessing && (
                        <div className='space-y-1.5'>
                            <p className='text-xs text-stone-500'>
                                {stepMessage || currentStepLabel}
                            </p>
                            <Progress value={progress} className='h-1' />
                        </div>
                    )}
                </DialogHeader>

                {/* Main Content Area */}
                <div className='flex flex-col gap-4'>
                    {/* Idle State - Setup */}
                    {step === 'idle' && (
                        <div className='space-y-4'>
                            {/* Idea Preview */}
                            <div className='rounded-lg border bg-stone-50 p-3'>
                                <h4
                                    className='mb-1 text-sm font-medium'
                                    title={idea.title}
                                >
                                    {idea.title.length > 80
                                        ? `${idea.title.substring(0, 80)}...`
                                        : idea.title}
                                </h4>
                                <p className='text-xs text-stone-500'>
                                    {idea.topic || 'No topic set'}
                                </p>
                            </div>

                            {/* Unified mode: Full pipeline step visualization */}
                            <div className='grid grid-cols-5 gap-2 text-center text-xs'>
                                {[
                                    { icon: Sparkles, label: 'Generate' },
                                    { icon: Shield, label: 'Review' },
                                    { icon: Wand2, label: 'Revise' },
                                    { icon: BookOpen, label: 'Extract' },
                                    { icon: Link, label: 'Save' },
                                ].map(({ icon: Icon, label }) => (
                                    <div
                                        key={label}
                                        className='flex flex-col items-center gap-1'
                                    >
                                        <div className='flex h-8 w-8 items-center justify-center rounded-full border bg-amber-50'>
                                            <Icon className='h-3.5 w-3.5 text-amber-500' />
                                        </div>
                                        <span className='text-stone-500'>
                                            {label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Processing State */}
                    {isProcessing && (
                        <div className='space-y-4'>
                            {/* Dynamic Content Area */}
                            <ScrollArea className='h-[280px]'>
                                {/* Show tool calls during generation */}
                                {(isInGenerationPhase ||
                                    toolCalls.length > 0) && (
                                    <ToolCallsDisplay
                                        toolCalls={toolCalls}
                                        sources={agenticSources}
                                        isWriting={isInGenerationPhase}
                                    />
                                )}
                                {/* Show reviews after generation */}
                                {isInReviewPhase &&
                                    reviewResults.length > 0 && (
                                        <div className='mt-4'>
                                            <ReviewAgentsDisplay
                                                results={reviewResults}
                                                isReviewing={isInReviewPhase}
                                            />
                                        </div>
                                    )}
                            </ScrollArea>
                        </div>
                    )}

                    {/* Completion State - Unified Mode */}
                    {step === 'complete' && unifiedResult && (
                        <div className='space-y-4'>
                            {/* Success Header */}
                            <div className='flex items-center gap-4 rounded-lg border border-green-200 bg-green-50 p-4'>
                                <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100'>
                                    <Check className='h-6 w-6 text-green-600' />
                                </div>
                                <div className='min-w-0 flex-1'>
                                    <div className='flex items-center gap-2'>
                                        <h3 className='text-base font-medium text-green-800'>
                                            Draft Created!
                                        </h3>
                                        {unifiedResult.orchestratorResult
                                            ?.overallScore && (
                                            <Badge
                                                variant={getScoreBadgeVariant(
                                                    unifiedResult
                                                        .orchestratorResult
                                                        .overallScore
                                                )}
                                                className='text-xs'
                                            >
                                                {
                                                    unifiedResult
                                                        .orchestratorResult
                                                        .overallScore
                                                }
                                                /100
                                            </Badge>
                                        )}
                                    </div>
                                    <p className='mt-0.5 text-sm text-green-700'>
                                        {unifiedResult.orchestratorResult
                                            ?.changesSummary ||
                                            'Your blog post is ready for review.'}
                                    </p>
                                    <div className='mt-1 flex items-center gap-3 text-xs text-green-600'>
                                        {unifiedResult.wordCount && (
                                            <span>
                                                ~{unifiedResult.wordCount} words
                                            </span>
                                        )}
                                        {unifiedResult.metrics?.totalTimeMs && (
                                            <span className='flex items-center gap-1'>
                                                <Clock className='h-3 w-3' />
                                                {formatTime(
                                                    unifiedResult.metrics
                                                        .totalTimeMs
                                                )}
                                            </span>
                                        )}
                                        {unifiedResult.sources && (
                                            <span>
                                                {unifiedResult.sources.length ||
                                                    0}{' '}
                                                sources
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Review Summary Grid */}
                            {reviewResults.length > 0 && (
                                <ReviewAgentsSummary results={reviewResults} />
                            )}

                            {/* Sources Summary */}
                            {unifiedResult.sources &&
                                unifiedResult.sources.length > 0 &&
                                unifiedResult.metrics && (
                                    <SourcesSummary
                                        sources={unifiedResult.sources}
                                        toolCallCount={
                                            unifiedResult.metrics.toolCallCount
                                        }
                                        totalTimeMs={
                                            unifiedResult.metrics.totalTimeMs
                                        }
                                    />
                                )}
                        </div>
                    )}

                    {/* Error State */}
                    {step === 'error' && (
                        <div className='flex flex-col items-center py-6 text-center'>
                            <div className='mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100'>
                                <AlertTriangle className='h-6 w-6 text-red-600' />
                            </div>
                            <h3 className='mb-1 text-base font-medium'>
                                Generation Failed
                            </h3>
                            <p className='text-sm text-stone-500'>
                                {error || 'An unexpected error occurred'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <DialogFooter className='pt-2'>
                    {step === 'idle' && (
                        <>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={handleClose}
                            >
                                Cancel
                            </Button>
                            <Button size='sm' onClick={handleGenerate}>
                                <Sparkles className='mr-1.5 h-3.5 w-3.5' />
                                Generate Draft
                            </Button>
                        </>
                    )}

                    {isProcessing && (
                        <Button size='sm' disabled>
                            <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
                            Generating...
                        </Button>
                    )}

                    {step === 'complete' && (
                        <>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={handleClose}
                            >
                                Close
                            </Button>
                            <Button size='sm' onClick={handleViewPost}>
                                <Pencil className='mr-1.5 h-3.5 w-3.5' />
                                Edit Draft
                            </Button>
                        </>
                    )}

                    {step === 'error' && (
                        <>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={handleClose}
                            >
                                Close
                            </Button>
                            <Button size='sm' onClick={handleGenerate}>
                                Try Again
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
