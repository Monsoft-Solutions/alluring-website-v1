'use client'

import {
    Activity,
    ExternalLink,
    FileText,
    Image as ImageIcon,
    Loader2,
    RefreshCw,
    RotateCcw,
    Shield,
    Sparkles,
    UserRound,
} from 'lucide-react'
import { Badge } from '@workspace/ui/components/badge'
import { ScrollArea } from '@workspace/ui/components/scroll-area'
import { TabsContent } from '@workspace/ui/components/tabs'

import type { PipelineState, PipelinePhaseKey } from '@workspace/db/types'
import { calculateDuration, formatDurationMs } from '@/lib/utils/time.util'

export type PipelineTabProps = {
    pipelineState: PipelineState | null | undefined
    /** Langfuse trace URL per phase; null/absent when not configured */
    phaseTraceUrls?: Partial<Record<PipelinePhaseKey, string | null>>
    isLoadingDetail: boolean
}

type PhaseTimestamps = {
    startedAt?: string
    completedAt?: string
    model?: string
}

const PHASE_ROWS: {
    key: PipelinePhaseKey
    label: string
    icon: React.ComponentType<{ className?: string }>
}[] = [
    { key: 'generation', label: 'Generation', icon: Sparkles },
    { key: 'review', label: 'AI Review', icon: Shield },
    { key: 'extraction', label: 'Metadata Extraction', icon: FileText },
    { key: 'imageGeneration', label: 'Image Generation', icon: ImageIcon },
]

function phaseSlice(
    state: PipelineState,
    key: PipelinePhaseKey
): PhaseTimestamps | undefined {
    switch (key) {
        case 'generation':
            return state.generationPhase
        case 'review':
            return state.reviewPhase
        case 'extraction':
            return state.extractionPhase
        case 'imageGeneration':
            return state.imageGenerationPhase
    }
}

/**
 * Pipeline tab for the post edit dialog
 *
 * Answers "which model wrote this post and how long did each phase take"
 * without opening the DB: per-phase timings, models, image QA outcomes,
 * auto-retries, and Langfuse trace links when deep-linking is configured.
 */
export function PipelineTab({
    pipelineState,
    phaseTraceUrls,
    isLoadingDetail,
}: PipelineTabProps) {
    const state = pipelineState ?? {}
    const hasAnyPhase = PHASE_ROWS.some((row) => phaseSlice(state, row.key))

    return (
        <TabsContent value='pipeline' className='m-0 h-full'>
            <ScrollArea className='h-full'>
                <div className='space-y-4 p-6'>
                    {isLoadingDetail && !hasAnyPhase ? (
                        <div className='flex items-center gap-2 text-sm text-stone-500'>
                            <Loader2 className='h-4 w-4 animate-spin' />
                            Loading pipeline telemetry...
                        </div>
                    ) : !hasAnyPhase ? (
                        <div className='rounded-lg border border-dashed border-stone-200 p-8 text-center'>
                            <Activity className='mx-auto h-8 w-8 text-stone-300' />
                            <p className='mt-2 text-sm text-stone-500'>
                                No pipeline runs recorded for this post yet
                            </p>
                        </div>
                    ) : (
                        <div className='space-y-3'>
                            {PHASE_ROWS.map(({ key, label, icon: Icon }) => {
                                const phase = phaseSlice(state, key)
                                const autoRetry = state.autoRetries?.[key]
                                if (!phase && !autoRetry) return null

                                const durationMs = calculateDuration(
                                    phase?.startedAt,
                                    phase?.completedAt
                                )
                                const traceUrl = phaseTraceUrls?.[key]

                                return (
                                    <div
                                        key={key}
                                        className='rounded-lg border border-stone-200 p-4'
                                    >
                                        <div className='flex flex-wrap items-center justify-between gap-2'>
                                            <div className='flex items-center gap-2'>
                                                <Icon className='h-4 w-4 text-stone-500' />
                                                <span className='text-sm font-medium'>
                                                    {label}
                                                </span>
                                                {phase?.completedAt ? (
                                                    <Badge className='bg-emerald-100 px-1.5 py-0 text-[10px] text-emerald-800 hover:bg-emerald-100'>
                                                        {durationMs > 0
                                                            ? formatDurationMs(
                                                                  durationMs
                                                              )
                                                            : // Rows written before phase
                                                              // durations were recorded
                                                              'Done'}
                                                    </Badge>
                                                ) : phase ? (
                                                    <Badge className='bg-stone-100 px-1.5 py-0 text-[10px] text-stone-600 hover:bg-stone-100'>
                                                        Incomplete
                                                    </Badge>
                                                ) : null}
                                            </div>
                                            <div className='flex items-center gap-2'>
                                                {phase?.model && (
                                                    <Badge
                                                        variant='outline'
                                                        className='px-1.5 py-0 font-mono text-[10px] text-stone-600'
                                                    >
                                                        {phase.model}
                                                    </Badge>
                                                )}
                                                {traceUrl && (
                                                    <a
                                                        href={traceUrl}
                                                        target='_blank'
                                                        rel='noreferrer'
                                                        className='flex items-center gap-1 text-xs text-blue-600 hover:underline'
                                                    >
                                                        <ExternalLink className='h-3 w-3' />
                                                        Trace
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        {/* Phase-specific details */}
                                        {key === 'generation' &&
                                            state.generationPhase
                                                ?.initialWordCount != null && (
                                                <p className='mt-2 text-xs text-stone-500'>
                                                    {
                                                        state.generationPhase
                                                            .initialWordCount
                                                    }{' '}
                                                    words ·{' '}
                                                    {state.generationPhase
                                                        .sources?.length ??
                                                        0}{' '}
                                                    sources ·{' '}
                                                    {state.generationPhase
                                                        .toolCallCount ??
                                                        0}{' '}
                                                    tool calls
                                                </p>
                                            )}

                                        {key === 'review' &&
                                            (state.reviewPhase?.reviews
                                                ?.length ?? 0) > 0 && (
                                                <p className='mt-2 text-xs text-stone-500'>
                                                    {
                                                        state.reviewPhase!
                                                            .reviews!.length
                                                    }{' '}
                                                    agents · avg score{' '}
                                                    {Math.round(
                                                        state.reviewPhase!.reviews!.reduce(
                                                            (sum, review) =>
                                                                sum +
                                                                review.score,
                                                            0
                                                        ) /
                                                            state.reviewPhase!
                                                                .reviews!.length
                                                    )}
                                                    {state.orchestrationPhase
                                                        ?.result &&
                                                        ' · orchestrated revision applied'}
                                                </p>
                                            )}

                                        {key === 'imageGeneration' &&
                                            state.imageGenerationPhase && (
                                                <div className='mt-2 flex flex-wrap items-center gap-1.5'>
                                                    {state.imageGenerationPhase
                                                        .artisticStyleId && (
                                                        <span className='text-xs text-stone-500'>
                                                            Style:{' '}
                                                            {
                                                                state
                                                                    .imageGenerationPhase
                                                                    .artisticStyleId
                                                            }
                                                        </span>
                                                    )}
                                                    {state.imageGenerationPhase
                                                        .peopleDetected && (
                                                        <Badge className='flex items-center gap-1 bg-red-100 px-1.5 py-0 text-[10px] text-red-800 hover:bg-red-100'>
                                                            <UserRound className='h-2.5 w-2.5' />
                                                            People detected
                                                        </Badge>
                                                    )}
                                                    {state.imageGenerationPhase
                                                        .qaRegenerated && (
                                                        <Badge className='flex items-center gap-1 bg-blue-100 px-1.5 py-0 text-[10px] text-blue-800 hover:bg-blue-100'>
                                                            <RefreshCw className='h-2.5 w-2.5' />
                                                            QA regenerated
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}

                                        {autoRetry && (
                                            <div className='mt-2 flex items-start gap-1.5 rounded-md bg-amber-50 p-2 text-xs text-amber-800'>
                                                <RotateCcw className='mt-0.5 h-3 w-3 shrink-0' />
                                                <span>
                                                    Auto-retried once at{' '}
                                                    {new Date(
                                                        autoRetry.attemptedAt
                                                    ).toLocaleString()}{' '}
                                                    after a transient error:{' '}
                                                    {autoRetry.reason}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </ScrollArea>
        </TabsContent>
    )
}
