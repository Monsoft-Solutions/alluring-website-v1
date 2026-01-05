/**
 * Generate Draft Hook
 *
 * Custom hook for managing blog draft generation state and logic.
 * Handles SSE streaming, pipeline progress, and draft saving.
 * Uses the unified agentic content pipeline.
 *
 * @module @/hooks/use-generate-draft
 */

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

import type { BlogIdeaDetail } from '@/lib/queries/ideas.query'
import type {
    DialogStep,
    SSEUnifiedCompleteEvent,
    SSEReviewResultData,
    SSEToolCallData,
    AgenticSource,
} from '@/lib/types/blog/pipeline.type'
import { createBlogPost } from '@/lib/actions/blog.action'
import { linkIdeaToBlogPost } from '@/lib/actions/idea.action'
import { buildOutlineStructure } from '@/components/blog/ideas/generate-draft.util'

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
    unifiedResult: SSEUnifiedCompleteEvent | null
    isProcessing: boolean
    isInReviewPhase: boolean
    isInGenerationPhase: boolean
    reviewResults: SSEReviewResultData[]
    toolCalls: SSEToolCallData[]
    agenticSources: AgenticSource[]

    // Actions
    handleGenerate: () => Promise<void>
    handleViewPost: () => void
    handleClose: () => void
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
 * Hook for managing blog draft generation with unified AI pipeline
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
    const [unifiedResult, setUnifiedResult] =
        useState<SSEUnifiedCompleteEvent | null>(null)
    const [postId, setPostId] = useState<string | null>(null)

    // Review results state
    const [reviewResults, setReviewResults] = useState<SSEReviewResultData[]>(
        []
    )

    // Tool calls and sources state
    const [toolCalls, setToolCalls] = useState<SSEToolCallData[]>([])
    const [agenticSources, setAgenticSources] = useState<AgenticSource[]>([])

    // Derived state
    const isProcessing =
        step !== 'idle' && step !== 'complete' && step !== 'error'
    const isInReviewPhase =
        typeof step === 'string' && step.startsWith('review-')
    const isInGenerationPhase =
        step === 'generation' || step === 'generation-tool-call'

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
        toast.success('Draft created with AI pipeline!')
    }

    /**
     * Run Unified content generation
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
     * Start the content generation
     */
    const handleGenerate = async () => {
        setError(null)
        setUnifiedResult(null)

        try {
            await handleUnifiedGenerate()
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
            setUnifiedResult(null)
            setPostId(null)
            setStepMessage('')
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
        unifiedResult,
        isProcessing,
        isInReviewPhase,
        isInGenerationPhase,
        reviewResults,
        toolCalls,
        agenticSources,

        // Actions
        handleGenerate,
        handleViewPost,
        handleClose,
    }
}
