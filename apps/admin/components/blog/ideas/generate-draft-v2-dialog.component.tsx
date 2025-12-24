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
    Search,
    Link,
    Shield,
    Pencil,
    Wand2,
    Clock,
} from 'lucide-react'

import type { BlogIdeaDetail } from '@/lib/queries/ideas.query'
import { useGenerateDraft } from '@/hooks/use-generate-draft.hook'
import { ResearchFindingsDisplay } from './research-findings-display.component'
import { PipelineStepper } from './pipeline-stepper.component'
import {
    ReviewAgentsDisplay,
    ReviewAgentsSummary,
} from './review-agents-display.component'
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
 * Enhanced dialog for generating blog posts using the AI pipeline
 * with research, review agents, and orchestration.
 *
 * Features:
 * - Compact horizontal pipeline stepper
 * - Real-time research findings display
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
        result,
        isProcessing,
        isInReviewPhase,
        isInResearchPhase,
        researchFindings,
        currentQuery,
        reviewResults,
        useAdvancedPipeline,
        setUseAdvancedPipeline,
        handleGenerate,
        handleViewPost,
        handleClose,
    } = useGenerateDraft({ idea, onOpenChange })

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
                                {result?.initialContent?.wordCount && (
                                    <span>
                                        ~{result.initialContent.wordCount} words
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Status bar during processing */}
                    {isProcessing && (
                        <div className='space-y-1.5'>
                            <p className='text-xs text-stone-500'>
                                {stepMessage || STEP_LABELS[step]}
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
                            <div className='rounded-lg border bg-stone-50 p-3'>
                                <h4 className='mb-1 text-sm font-medium'>
                                    {idea.title}
                                </h4>
                                <p className='text-xs text-stone-500'>
                                    {idea.topic || 'No topic set'}
                                </p>
                            </div>

                            <div className='grid grid-cols-5 gap-2 text-center text-xs'>
                                {[
                                    { icon: Search, label: 'Research' },
                                    { icon: BookOpen, label: 'Generate' },
                                    { icon: Shield, label: 'Review' },
                                    { icon: Wand2, label: 'Revise' },
                                    { icon: Link, label: 'Save' },
                                ].map(({ icon: Icon, label }) => (
                                    <div
                                        key={label}
                                        className='flex flex-col items-center gap-1'
                                    >
                                        <div className='flex h-8 w-8 items-center justify-center rounded-full border bg-stone-50'>
                                            <Icon className='h-3.5 w-3.5 text-stone-400' />
                                        </div>
                                        <span className='text-stone-500'>
                                            {label}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <label className='flex cursor-pointer items-center gap-2 text-xs'>
                                <input
                                    type='checkbox'
                                    checked={useAdvancedPipeline}
                                    onChange={(e) =>
                                        setUseAdvancedPipeline(e.target.checked)
                                    }
                                    className='rounded'
                                />
                                <span className='text-stone-600'>
                                    Stream progress in real-time (recommended)
                                </span>
                            </label>
                        </div>
                    )}

                    {/* Processing State */}
                    {isProcessing && (
                        <div className='space-y-4'>
                            {/* Horizontal Pipeline Stepper */}
                            <PipelineStepper
                                currentStep={step}
                                progress={progress}
                            />

                            {/* Dynamic Content Area */}
                            <ScrollArea className='h-[280px]'>
                                {/* Research findings during research phase */}
                                {(researchFindings.length > 0 ||
                                    currentQuery !== null) && (
                                    <ResearchFindingsDisplay
                                        findings={researchFindings}
                                        currentQuery={currentQuery}
                                        isSearching={isInResearchPhase}
                                    />
                                )}

                                {/* Review results during review phase */}
                                {(isInReviewPhase ||
                                    step === 'orchestration' ||
                                    step === 'saving') &&
                                    (reviewResults.length > 0 ||
                                        isInReviewPhase) && (
                                        <ReviewAgentsDisplay
                                            results={reviewResults}
                                            isReviewing={isInReviewPhase}
                                        />
                                    )}

                                {/* Show placeholder during content generation */}
                                {(step === 'content-generation' ||
                                    step === 'link-integration') &&
                                    researchFindings.length === 0 && (
                                        <div className='flex h-full flex-col items-center justify-center gap-3 py-8 text-center'>
                                            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-amber-100'>
                                                <BookOpen className='h-6 w-6 text-amber-600' />
                                            </div>
                                            <div>
                                                <p className='text-sm font-medium text-stone-700'>
                                                    Generating Content
                                                </p>
                                                <p className='text-xs text-stone-500'>
                                                    AI is writing your blog
                                                    post...
                                                </p>
                                            </div>
                                        </div>
                                    )}
                            </ScrollArea>
                        </div>
                    )}

                    {/* Completion State */}
                    {step === 'complete' && result && (
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
                                        {result.overallScore && (
                                            <Badge
                                                variant={getScoreBadgeVariant(
                                                    result.overallScore
                                                )}
                                                className='text-xs'
                                            >
                                                {result.overallScore}/100
                                            </Badge>
                                        )}
                                    </div>
                                    <p className='mt-0.5 text-sm text-green-700'>
                                        {result.changesSummary ||
                                            'Your blog post is ready for review.'}
                                    </p>
                                    <div className='mt-1 flex items-center gap-3 text-xs text-green-600'>
                                        {result.initialContent && (
                                            <span>
                                                ~
                                                {
                                                    result.initialContent
                                                        .wordCount
                                                }{' '}
                                                words
                                            </span>
                                        )}
                                        {result.totalProcessingTimeMs && (
                                            <span className='flex items-center gap-1'>
                                                <Clock className='h-3 w-3' />
                                                {formatTime(
                                                    result.totalProcessingTimeMs
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Review Summary Grid */}
                            {reviewResults.length > 0 && (
                                <ReviewAgentsSummary results={reviewResults} />
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
                            Processing...
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
