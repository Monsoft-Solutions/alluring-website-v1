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
    Zap,
} from 'lucide-react'

import type { BlogIdeaDetail } from '@/lib/queries/ideas.query'
import type { PipelineMode } from '@/lib/types/blog/pipeline.type'
import { useGenerateDraft } from '@/hooks/use-generate-draft.hook'
import { ResearchFindingsDisplay } from './research-findings-display.component'
import { PipelineStepper } from './pipeline-stepper.component'
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
 * Mode selector component for choosing generation mode
 * Unified mode is the recommended default
 */
function PipelineModeSelector({
    mode,
    onModeChange,
}: {
    mode: PipelineMode
    onModeChange: (mode: PipelineMode) => void
}) {
    return (
        <div className='space-y-2'>
            <p className='text-xs font-medium text-stone-600'>
                Generation Mode
            </p>
            <div className='grid grid-cols-1 gap-2'>
                {/* Unified Mode - Recommended */}
                <button
                    type='button'
                    onClick={() => onModeChange('unified')}
                    className={`flex flex-col items-start rounded-lg border p-3 text-left transition-all ${
                        mode === 'unified'
                            ? 'border-amber-400 bg-amber-50 ring-1 ring-amber-400'
                            : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
                    }`}
                >
                    <div className='flex items-center gap-2'>
                        <Sparkles
                            className={`h-4 w-4 ${mode === 'unified' ? 'text-amber-600' : 'text-stone-400'}`}
                        />
                        <span
                            className={`text-sm font-medium ${mode === 'unified' ? 'text-amber-800' : 'text-stone-700'}`}
                        >
                            Full AI Pipeline
                        </span>
                        <Badge
                            variant='default'
                            className='ml-auto bg-amber-500 text-[10px] hover:bg-amber-500'
                        >
                            Recommended
                        </Badge>
                    </div>
                    <p className='mt-1 text-xs text-stone-500'>
                        Agentic writing + 4 review agents + AI revision (~3-5
                        min)
                    </p>
                </button>

                {/* Legacy modes hidden by default but available */}
                <details className='group'>
                    <summary className='cursor-pointer text-xs text-stone-400 hover:text-stone-600'>
                        Show legacy modes
                    </summary>
                    <div className='mt-2 grid grid-cols-2 gap-2'>
                        <button
                            type='button'
                            onClick={() => onModeChange('agentic')}
                            className={`flex flex-col items-start rounded-lg border p-3 text-left transition-all ${
                                mode === 'agentic'
                                    ? 'border-amber-400 bg-amber-50 ring-1 ring-amber-400'
                                    : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
                            }`}
                        >
                            <div className='flex items-center gap-2'>
                                <Zap
                                    className={`h-4 w-4 ${mode === 'agentic' ? 'text-amber-600' : 'text-stone-400'}`}
                                />
                                <span
                                    className={`text-sm font-medium ${mode === 'agentic' ? 'text-amber-800' : 'text-stone-700'}`}
                                >
                                    Agentic Only
                                </span>
                            </div>
                            <p className='mt-1 text-xs text-stone-500'>
                                Fast, no review (~1-2 min)
                            </p>
                        </button>

                        <button
                            type='button'
                            onClick={() => onModeChange('pipeline-v2')}
                            className={`flex flex-col items-start rounded-lg border p-3 text-left transition-all ${
                                mode === 'pipeline-v2'
                                    ? 'border-amber-400 bg-amber-50 ring-1 ring-amber-400'
                                    : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
                            }`}
                        >
                            <div className='flex items-center gap-2'>
                                <Shield
                                    className={`h-4 w-4 ${mode === 'pipeline-v2' ? 'text-amber-600' : 'text-stone-400'}`}
                                />
                                <span
                                    className={`text-sm font-medium ${mode === 'pipeline-v2' ? 'text-amber-800' : 'text-stone-700'}`}
                                >
                                    Legacy Pipeline
                                </span>
                            </div>
                            <p className='mt-1 text-xs text-stone-500'>
                                Old pipeline (~3-5 min)
                            </p>
                        </button>
                    </div>
                </details>
            </div>
        </div>
    )
}

/**
 * Step labels for agentic mode
 */
const AGENTIC_STEP_LABELS: Record<string, string> = {
    ...STEP_LABELS,
    'agentic-writing': 'AI writing with research tools...',
    'extracting-metadata': 'Extracting metadata and FAQs...',
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
 * Enhanced dialog for generating blog posts using the AI pipeline
 * with research, review agents, and orchestration.
 *
 * Features:
 * - Pipeline mode selector (Agentic vs Pipeline V2)
 * - Compact horizontal pipeline stepper
 * - Real-time research findings display (Pipeline V2)
 * - Real-time tool calls display (Agentic)
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
        agenticResult,
        unifiedResult,
        isProcessing,
        isInReviewPhase,
        isInResearchPhase,
        isInAgenticPhase,
        isInGenerationPhase,
        researchFindings,
        currentQuery,
        reviewResults,
        useAdvancedPipeline,
        pipelineMode,
        toolCalls,
        agenticSources,
        setUseAdvancedPipeline,
        setPipelineMode,
        handleGenerate,
        handleViewPost,
        handleClose,
    } = useGenerateDraft({ idea, onOpenChange })

    // Get appropriate step label based on mode
    const currentStepLabel =
        pipelineMode === 'unified'
            ? UNIFIED_STEP_LABELS[step] || stepMessage
            : pipelineMode === 'agentic'
              ? AGENTIC_STEP_LABELS[step] || stepMessage
              : STEP_LABELS[step] || stepMessage

    // Determine word count from the appropriate result
    const wordCount =
        pipelineMode === 'unified'
            ? unifiedResult?.wordCount
            : pipelineMode === 'agentic'
              ? agenticResult?.wordCount
              : result?.initialContent?.wordCount

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent size='lg' className='max-h-[85vh] overflow-hidden'>
                {/* Compact Header */}
                <DialogHeader className='space-y-1 pb-2'>
                    <div className='flex items-center justify-between'>
                        <DialogTitle className='flex items-center gap-2 text-base'>
                            <Sparkles className='h-4 w-4 text-amber-500' />
                            {pipelineMode === 'unified'
                                ? 'AI Content Pipeline'
                                : pipelineMode === 'agentic'
                                  ? 'AI Agentic Writer (Legacy)'
                                  : 'AI Pipeline V2 (Legacy)'}
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

                            {/* Pipeline Mode Selector */}
                            <PipelineModeSelector
                                mode={pipelineMode}
                                onModeChange={setPipelineMode}
                            />

                            {/* Pipeline V2 specific: Step visualization */}
                            {pipelineMode === 'pipeline-v2' && (
                                <>
                                    <div className='grid grid-cols-5 gap-2 text-center text-xs'>
                                        {[
                                            { icon: Search, label: 'Research' },
                                            {
                                                icon: BookOpen,
                                                label: 'Generate',
                                            },
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
                                                setUseAdvancedPipeline(
                                                    e.target.checked
                                                )
                                            }
                                            className='rounded'
                                        />
                                        <span className='text-stone-600'>
                                            Stream progress in real-time
                                            (recommended)
                                        </span>
                                    </label>
                                </>
                            )}

                            {/* Unified mode: Full pipeline step visualization */}
                            {pipelineMode === 'unified' && (
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
                            )}

                            {/* Agentic mode: Simple step visualization */}
                            {pipelineMode === 'agentic' && (
                                <div className='grid grid-cols-3 gap-2 text-center text-xs'>
                                    {[
                                        {
                                            icon: Sparkles,
                                            label: 'Write + Research',
                                        },
                                        { icon: Wand2, label: 'Extract Meta' },
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
                            )}
                        </div>
                    )}

                    {/* Processing State */}
                    {isProcessing && (
                        <div className='space-y-4'>
                            {/* Pipeline V2: Horizontal Pipeline Stepper */}
                            {pipelineMode === 'pipeline-v2' && (
                                <PipelineStepper
                                    currentStep={step}
                                    progress={progress}
                                />
                            )}

                            {/* Dynamic Content Area */}
                            <ScrollArea className='h-[280px]'>
                                {/* Unified mode: Tool calls + review display */}
                                {pipelineMode === 'unified' && (
                                    <>
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
                                                        isReviewing={
                                                            isInReviewPhase
                                                        }
                                                    />
                                                </div>
                                            )}
                                    </>
                                )}

                                {/* Agentic mode: Tool calls display */}
                                {pipelineMode === 'agentic' && (
                                    <ToolCallsDisplay
                                        toolCalls={toolCalls}
                                        sources={agenticSources}
                                        isWriting={isInAgenticPhase}
                                    />
                                )}

                                {/* Pipeline V2: Research findings during research phase */}
                                {pipelineMode === 'pipeline-v2' &&
                                    (researchFindings.length > 0 ||
                                        currentQuery !== null) && (
                                        <ResearchFindingsDisplay
                                            findings={researchFindings}
                                            currentQuery={currentQuery}
                                            isSearching={isInResearchPhase}
                                        />
                                    )}

                                {/* Pipeline V2: Review results during review phase */}
                                {pipelineMode === 'pipeline-v2' &&
                                    (isInReviewPhase ||
                                        step === 'orchestration' ||
                                        step === 'saving') &&
                                    (reviewResults.length > 0 ||
                                        isInReviewPhase) && (
                                        <ReviewAgentsDisplay
                                            results={reviewResults}
                                            isReviewing={isInReviewPhase}
                                        />
                                    )}

                                {/* Pipeline V2: Show placeholder during content generation */}
                                {pipelineMode === 'pipeline-v2' &&
                                    (step === 'content-generation' ||
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

                    {/* Completion State - Pipeline V2 */}
                    {step === 'complete' &&
                        pipelineMode === 'pipeline-v2' &&
                        result && (
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
                                    <ReviewAgentsSummary
                                        results={reviewResults}
                                    />
                                )}
                            </div>
                        )}

                    {/* Completion State - Agentic Mode */}
                    {step === 'complete' &&
                        pipelineMode === 'agentic' &&
                        agenticResult && (
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
                                            <Badge
                                                variant='secondary'
                                                className='text-xs'
                                            >
                                                <Zap className='mr-1 h-3 w-3' />
                                                Agentic
                                            </Badge>
                                        </div>
                                        <p className='mt-0.5 text-sm text-green-700'>
                                            Your blog post is ready for review.
                                        </p>
                                        <div className='mt-1 flex items-center gap-3 text-xs text-green-600'>
                                            {agenticResult.wordCount && (
                                                <span>
                                                    ~{agenticResult.wordCount}{' '}
                                                    words
                                                </span>
                                            )}
                                            {agenticResult.pipelineMetadata
                                                ?.totalTimeMs && (
                                                <span className='flex items-center gap-1'>
                                                    <Clock className='h-3 w-3' />
                                                    {formatTime(
                                                        agenticResult
                                                            .pipelineMetadata
                                                            .totalTimeMs
                                                    )}
                                                </span>
                                            )}
                                            {agenticResult.sources && (
                                                <span>
                                                    {agenticResult.sources
                                                        .length || 0}{' '}
                                                    sources
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Sources Summary */}
                                {agenticResult.sources &&
                                    agenticResult.sources.length > 0 &&
                                    agenticResult.pipelineMetadata && (
                                        <SourcesSummary
                                            sources={agenticResult.sources}
                                            toolCallCount={
                                                agenticResult.pipelineMetadata
                                                    .toolCallCount
                                            }
                                            totalTimeMs={
                                                agenticResult.pipelineMetadata
                                                    .totalTimeMs
                                            }
                                        />
                                    )}
                            </div>
                        )}

                    {/* Completion State - Unified Mode */}
                    {step === 'complete' &&
                        pipelineMode === 'unified' &&
                        unifiedResult && (
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
                                                    ~{unifiedResult.wordCount}{' '}
                                                    words
                                                </span>
                                            )}
                                            {unifiedResult.metrics
                                                ?.totalTimeMs && (
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
                                                    {unifiedResult.sources
                                                        .length || 0}{' '}
                                                    sources
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Review Summary Grid */}
                                {reviewResults.length > 0 && (
                                    <ReviewAgentsSummary
                                        results={reviewResults}
                                    />
                                )}

                                {/* Sources Summary */}
                                {unifiedResult.sources &&
                                    unifiedResult.sources.length > 0 &&
                                    unifiedResult.metrics && (
                                        <SourcesSummary
                                            sources={unifiedResult.sources}
                                            toolCallCount={
                                                unifiedResult.metrics
                                                    .toolCallCount
                                            }
                                            totalTimeMs={
                                                unifiedResult.metrics
                                                    .totalTimeMs
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
                            {pipelineMode === 'unified'
                                ? 'Generating...'
                                : pipelineMode === 'agentic'
                                  ? 'Writing...'
                                  : 'Processing...'}
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
