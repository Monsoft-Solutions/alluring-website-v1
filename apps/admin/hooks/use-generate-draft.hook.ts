/**
 * Generate Draft Hook
 *
 * Custom hook for managing blog draft generation state and logic.
 * Handles SSE streaming, pipeline progress, and draft saving.
 * Supports both Pipeline V2 (with review agents) and Agentic mode (with real-time research).
 *
 * @module @/hooks/use-generate-draft
 */

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

import type { BlogIdeaDetail } from '@/lib/queries/ideas.query'
import type {
    DialogStep,
    PipelineMode,
    SSECompleteEvent,
    SSEAgenticCompleteEvent,
    SSEUnifiedCompleteEvent,
    SSEResearchFindingData,
    SSEResearchQueryData,
    SSEReviewResultData,
    SSEToolCallData,
    AgenticSource,
} from '@/lib/types/blog/pipeline.type'
import { createBlogPost } from '@/lib/actions/blog.action'
import { linkIdeaToBlogPost } from '@/lib/actions/idea.action'
import {
    buildOutlineStructure,
    processSSEStream,
} from '@/components/blog/ideas/generate-draft.util'

type UseGenerateDraftOptions = {
    idea: BlogIdeaDetail
    onOpenChange: (open: boolean) => void
}

type UseGenerateDraftReturn = {
    // State
    step: DialogStep
    progress: number
    stepMessage: string
    error: string | null
    result: SSECompleteEvent | null
    agenticResult: SSEAgenticCompleteEvent | null
    unifiedResult: SSEUnifiedCompleteEvent | null
    isProcessing: boolean
    isInReviewPhase: boolean
    isInResearchPhase: boolean
    isInAgenticPhase: boolean
    isInGenerationPhase: boolean
    researchFindings: SSEResearchFindingData[]
    currentQuery: SSEResearchQueryData | null
    reviewResults: SSEReviewResultData[]
    useAdvancedPipeline: boolean
    pipelineMode: PipelineMode
    // Agentic mode state
    toolCalls: SSEToolCallData[]
    agenticSources: AgenticSource[]

    // Actions
    setUseAdvancedPipeline: (value: boolean) => void
    setPipelineMode: (mode: PipelineMode) => void
    handleGenerate: () => Promise<void>
    handleViewPost: () => void
    handleClose: () => void
}

/**
 * Result type for agentic SSE stream processing
 */
type AgenticStreamResult = {
    success: boolean
    result: SSEAgenticCompleteEvent | null
    error?: string
}

/**
 * Result type for unified SSE stream processing
 */
type UnifiedStreamResult = {
    success: boolean
    result: SSEUnifiedCompleteEvent | null
    error?: string
}

/**
 * Process SSE stream from the agentic pipeline API
 *
 * Returns a result object with success/error status instead of throwing,
 * allowing proper error propagation from async stream processing.
 */
async function processAgenticSSEStream(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    handlers: {
        onProgress: (data: {
            step: DialogStep
            progress: number
            message: string
            data?: SSEToolCallData
        }) => void
        onComplete: (data: SSEAgenticCompleteEvent) => void
        onError: (data: { error: string }) => void
    }
): Promise<AgenticStreamResult> {
    const decoder = new TextDecoder()
    let buffer = ''
    let agenticResult: SSEAgenticCompleteEvent | null = null
    let streamError: string | undefined

    try {
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
                        const data = JSON.parse(dataLine) as unknown

                        if (eventType === 'progress') {
                            handlers.onProgress(
                                data as {
                                    step: DialogStep
                                    progress: number
                                    message: string
                                    data?: SSEToolCallData
                                }
                            )
                        } else if (eventType === 'complete') {
                            const completeData = data as SSEAgenticCompleteEvent
                            agenticResult = completeData
                            handlers.onComplete(completeData)

                            // Check if completion was successful
                            if (!completeData.success) {
                                streamError =
                                    completeData.error ||
                                    'Agentic generation failed'
                            }
                        } else if (eventType === 'error') {
                            const errorData = data as { error: string }
                            streamError =
                                errorData.error || 'Agentic generation failed'
                            handlers.onError(errorData)
                        }
                    }
                }
            }
        }
    } catch (err) {
        streamError =
            err instanceof Error ? err.message : 'Stream processing failed'
    }

    // Return structured result with error status
    if (streamError) {
        return { success: false, result: agenticResult, error: streamError }
    }

    return { success: true, result: agenticResult }
}

/**
 * Process SSE stream from the unified agentic content pipeline API
 */
async function processUnifiedSSEStream(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    handlers: {
        onProgress: (data: {
            step: DialogStep
            progress: number
            message: string
            data?: SSEToolCallData | SSEReviewResultData
        }) => void
        onComplete: (data: SSEUnifiedCompleteEvent) => void
        onError: (data: { error: string }) => void
    }
): Promise<UnifiedStreamResult> {
    const decoder = new TextDecoder()
    let buffer = ''
    let unifiedResult: SSEUnifiedCompleteEvent | null = null
    let streamError: string | undefined

    try {
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
                        const data = JSON.parse(dataLine) as unknown

                        if (eventType === 'progress') {
                            handlers.onProgress(
                                data as {
                                    step: DialogStep
                                    progress: number
                                    message: string
                                    data?: SSEToolCallData | SSEReviewResultData
                                }
                            )
                        } else if (eventType === 'complete') {
                            const completeData = data as SSEUnifiedCompleteEvent
                            unifiedResult = completeData
                            handlers.onComplete(completeData)

                            if (!completeData.success) {
                                streamError =
                                    completeData.error ||
                                    'Content generation failed'
                            }
                        } else if (eventType === 'error') {
                            const errorData = data as { error: string }
                            streamError =
                                errorData.error || 'Content generation failed'
                            handlers.onError(errorData)
                        }
                    }
                }
            }
        }
    } catch (err) {
        streamError =
            err instanceof Error ? err.message : 'Stream processing failed'
    }

    if (streamError) {
        return { success: false, result: unifiedResult, error: streamError }
    }

    return { success: true, result: unifiedResult }
}

/**
 * Hook for managing blog draft generation with AI pipeline
 */
export function useGenerateDraft({
    idea,
    onOpenChange,
}: UseGenerateDraftOptions): UseGenerateDraftReturn {
    const router = useRouter()

    // Core state
    const [step, setStep] = useState<DialogStep>('idle')
    const [progress, setProgress] = useState(0)
    const [stepMessage, setStepMessage] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [result, setResult] = useState<SSECompleteEvent | null>(null)
    const [agenticResult, setAgenticResult] =
        useState<SSEAgenticCompleteEvent | null>(null)
    const [unifiedResult, setUnifiedResult] =
        useState<SSEUnifiedCompleteEvent | null>(null)
    const [postId, setPostId] = useState<string | null>(null)
    const [useAdvancedPipeline, setUseAdvancedPipeline] = useState(true)
    // Default to unified mode (new recommended approach)
    const [pipelineMode, setPipelineMode] = useState<PipelineMode>('unified')

    // Research findings state (Pipeline V2)
    const [researchFindings, setResearchFindings] = useState<
        SSEResearchFindingData[]
    >([])
    const [currentQuery, setCurrentQuery] =
        useState<SSEResearchQueryData | null>(null)

    // Review results state (Pipeline V2)
    const [reviewResults, setReviewResults] = useState<SSEReviewResultData[]>(
        []
    )

    // Agentic mode state
    const [toolCalls, setToolCalls] = useState<SSEToolCallData[]>([])
    const [agenticSources, setAgenticSources] = useState<AgenticSource[]>([])

    // Derived state
    const isProcessing =
        step !== 'idle' && step !== 'complete' && step !== 'error'
    const isInReviewPhase =
        typeof step === 'string' && step.startsWith('review-')
    const isInResearchPhase = step === 'research'
    const isInAgenticPhase = step === 'agentic-writing'
    const isInGenerationPhase =
        step === 'generation' || step === 'generation-tool-call'

    /**
     * Calculate overall progress from step and step progress (Pipeline V2)
     */
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
                // Agentic mode steps
                'agentic-writing': { start: 5, weight: 80 },
                'extracting-metadata': { start: 85, weight: 10 },
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

    /**
     * Save draft to database and link to idea
     */
    const saveDraft = async (
        content: string,
        metadata?: {
            metaDescription?: string
            excerpt?: string
            faqs?: Array<{ question: string; answer: string }>
        }
    ) => {
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
            faqs: metadata?.faqs || null,
        })

        if (!createResult.success) {
            throw new Error(createResult.error || 'Failed to create blog post')
        }

        setProgress(95)

        if (createResult.id) {
            await linkIdeaToBlogPost(idea.id, createResult.id)
            setPostId(createResult.id)
        }

        setProgress(100)
        setStep('complete')
        toast.success(
            pipelineMode === 'agentic'
                ? 'Draft created with agentic AI!'
                : 'Draft created with AI pipeline!'
        )
    }

    /**
     * Run Agentic content generation
     */
    const handleAgenticGenerate = async () => {
        setStep('agentic-writing')
        setProgress(5)
        setStepMessage('Starting AI writing with research tools...')
        setToolCalls([])
        setAgenticSources([])
        setAgenticResult(null)

        const outlineForContent = buildOutlineStructure(idea)
        const requestBody = {
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
            },
        }

        const response = await fetch('/api/blog/generate-content-agentic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        })

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`)
        }

        const reader = response.body?.getReader()
        if (!reader) {
            throw new Error('No response body')
        }

        const streamResult = await processAgenticSSEStream(reader, {
            onProgress: (progressData) => {
                setStep(progressData.step)
                setStepMessage(progressData.message)
                setProgress(progressData.progress)

                // Track tool calls
                if (progressData.data?.type === 'tool-call') {
                    setToolCalls((prev) => [...prev, progressData.data!])
                }
            },
            onComplete: (completeData) => {
                setAgenticResult(completeData)
                if (completeData.sources) {
                    setAgenticSources(completeData.sources)
                }
                if (completeData.success) {
                    setStep('saving')
                    setProgress(90)
                }
                // Note: Error handling moved to after stream processing
            },
            onError: (errorData) => {
                // Note: Error is tracked in streamResult, handled below
                console.error('SSE error event:', errorData.error)
            },
        })

        // Check for stream processing errors
        if (!streamResult.success) {
            throw new Error(streamResult.error || 'Agentic generation failed')
        }

        const agenticPipelineResult = streamResult.result
        if (agenticPipelineResult?.success && agenticPipelineResult.content) {
            await saveDraft(agenticPipelineResult.content, {
                metaDescription: agenticPipelineResult.metaDescription,
                excerpt: agenticPipelineResult.excerpt,
                faqs: agenticPipelineResult.faqs,
            })
        } else if (!agenticPipelineResult?.success) {
            // Handle case where stream completed but result indicates failure
            throw new Error(
                agenticPipelineResult?.error || 'Agentic generation failed'
            )
        }
    }

    /**
     * Run Pipeline V2 content generation
     */
    const handlePipelineV2Generate = async () => {
        setStep('research')
        setProgress(5)
        setStepMessage('Starting pipeline...')
        setResearchFindings([])
        setCurrentQuery(null)
        setReviewResults([])

        const outlineForContent = buildOutlineStructure(idea)
        const requestBody = {
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
                stream: useAdvancedPipeline,
                skipResearch: false,
                skipReview: false,
            },
        }

        const response = await fetch('/api/blog/generate-content-v2', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        })

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`)
        }

        if (useAdvancedPipeline) {
            const reader = response.body?.getReader()
            if (!reader) {
                throw new Error('No response body')
            }

            const pipelineResult = await processSSEStream(reader, {
                onProgress: (progressData) => {
                    setStep(progressData.step)
                    setStepMessage(progressData.message)
                    setProgress(
                        calculateOverallProgress(
                            progressData.step,
                            progressData.progress
                        )
                    )

                    if (progressData.data) {
                        if (progressData.data.type === 'research-query') {
                            setCurrentQuery(progressData.data)
                        } else if (
                            progressData.data.type === 'research-finding'
                        ) {
                            setCurrentQuery(null)
                            setResearchFindings((prev) => [
                                ...prev,
                                progressData.data as SSEResearchFindingData,
                            ])
                        } else if (progressData.data.type === 'review-result') {
                            setReviewResults((prev) => [
                                ...prev,
                                progressData.data as SSEReviewResultData,
                            ])
                        }
                    }
                },
                onComplete: (completeData) => {
                    setResult(completeData)
                    if (completeData.success) {
                        setStep('saving')
                        setProgress(90)
                    } else {
                        throw new Error(completeData.error || 'Pipeline failed')
                    }
                },
                onError: (errorData) => {
                    throw new Error(errorData.error || 'Pipeline failed')
                },
            })

            if (pipelineResult?.success && pipelineResult.finalContent) {
                await saveDraft(
                    pipelineResult.finalContent,
                    pipelineResult.initialContent
                )
            }
        } else {
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

            if (data.reviews) {
                setReviewResults(
                    data.reviews.map((r) => ({
                        type: 'review-result' as const,
                        agentName: r.agentName,
                        score: r.score,
                        summary: r.summary,
                        issueCount: r.issueCount,
                    }))
                )
            }

            setStep('saving')
            setProgress(90)

            if (data.finalContent) {
                await saveDraft(data.finalContent, data.initialContent)
            }
        }
    }

    /**
     * Run Unified content generation (new recommended approach)
     * Uses the unified agentic content pipeline with all 4 phases:
     * 1. Agentic Generation (with on-demand research)
     * 2. Review (4 parallel agents)
     * 3. Orchestration (revise based on reviews)
     * 4. Extraction (FAQ + Metadata)
     */
    const handleUnifiedGenerate = async () => {
        setStep('generation')
        setProgress(5)
        setStepMessage('Starting AI content generation pipeline...')
        setToolCalls([])
        setAgenticSources([])
        setUnifiedResult(null)
        setReviewResults([])

        const outlineForContent = buildOutlineStructure(idea)
        const requestBody = {
            idea: {
                title: idea.title,
                topic: idea.topic || idea.title,
                primaryKeyword: idea.primaryKeyword || '',
                secondaryKeywords: idea.secondaryKeywords || [],
                targetAudience: idea.targetAudience,
                uniqueAngle: idea.uniqueAngle,
                estimatedWordCount: idea.estimatedWordCount || 1500,
            },
            outline: outlineForContent,
            options: {
                stream: true,
                skipReview: false,
                skipOrchestration: false,
            },
        }

        const response = await fetch('/api/blog/generate-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        })

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`)
        }

        const reader = response.body?.getReader()
        if (!reader) {
            throw new Error('No response body')
        }

        const streamResult = await processUnifiedSSEStream(reader, {
            onProgress: (progressData) => {
                setStep(progressData.step)
                setStepMessage(progressData.message)
                setProgress(progressData.progress)

                // Track tool calls during generation phase
                if (progressData.data && 'type' in progressData.data) {
                    if (progressData.data.type === 'tool-call') {
                        setToolCalls((prev) => [
                            ...prev,
                            progressData.data as SSEToolCallData,
                        ])
                    } else if (progressData.data.type === 'review-result') {
                        setReviewResults((prev) => [
                            ...prev,
                            progressData.data as SSEReviewResultData,
                        ])
                    }
                }
            },
            onComplete: (completeData) => {
                setUnifiedResult(completeData)
                if (completeData.sources) {
                    setAgenticSources(completeData.sources)
                }
                if (completeData.reviews) {
                    setReviewResults(
                        completeData.reviews.map((r) => ({
                            type: 'review-result' as const,
                            agentName: r.agentName,
                            score: r.score,
                            summary: r.summary,
                            issueCount: r.issueCount,
                        }))
                    )
                }
                if (completeData.success) {
                    setStep('saving')
                    setProgress(95)
                }
            },
            onError: (errorData) => {
                console.error('SSE error event:', errorData.error)
            },
        })

        // Check for stream processing errors
        if (!streamResult.success) {
            throw new Error(streamResult.error || 'Content generation failed')
        }

        const pipelineResult = streamResult.result
        if (pipelineResult?.success && pipelineResult.content) {
            await saveDraft(pipelineResult.content, {
                metaDescription: pipelineResult.metaDescription,
                excerpt: pipelineResult.excerpt,
                faqs: pipelineResult.faqs,
            })
        } else if (!pipelineResult?.success) {
            throw new Error(
                pipelineResult?.error || 'Content generation failed'
            )
        }
    }

    /**
     * Start the content generation (routes to correct pipeline based on mode)
     */
    const handleGenerate = async () => {
        setError(null)
        setResult(null)
        setAgenticResult(null)
        setUnifiedResult(null)

        try {
            if (pipelineMode === 'unified') {
                await handleUnifiedGenerate()
            } else if (pipelineMode === 'agentic') {
                // Deprecated: redirects to deprecated endpoint
                await handleAgenticGenerate()
            } else {
                // Deprecated: redirects to deprecated endpoint
                await handlePipelineV2Generate()
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to generate blog content'
            )
            setStep('error')
        }
    }

    /**
     * Navigate to edit the created post
     */
    const handleViewPost = () => {
        if (postId) {
            router.push(`/blog/posts/${postId}/edit`)
        }
    }

    /**
     * Close and reset dialog state
     */
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
            setAgenticResult(null)
            setUnifiedResult(null)
            setPostId(null)
            setStepMessage('')
            setResearchFindings([])
            setCurrentQuery(null)
            setReviewResults([])
            setToolCalls([])
            setAgenticSources([])
        }, 300)
    }

    return {
        // State
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

        // Actions
        setUseAdvancedPipeline,
        setPipelineMode,
        handleGenerate,
        handleViewPost,
        handleClose,
    }
}
