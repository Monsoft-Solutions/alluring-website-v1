/**
 * Generate Draft Hook
 *
 * Custom hook for managing blog draft generation state and logic.
 * Handles SSE streaming, pipeline progress, and draft saving.
 *
 * @module @/hooks/use-generate-draft
 */

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

import type { BlogIdeaDetail } from '@/lib/queries/ideas.query'
import type {
    DialogStep,
    SSECompleteEvent,
    SSEResearchFindingData,
    SSEResearchQueryData,
    SSEReviewResultData,
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
    isProcessing: boolean
    isInReviewPhase: boolean
    isInResearchPhase: boolean
    researchFindings: SSEResearchFindingData[]
    currentQuery: SSEResearchQueryData | null
    reviewResults: SSEReviewResultData[]
    useAdvancedPipeline: boolean

    // Actions
    setUseAdvancedPipeline: (value: boolean) => void
    handleGenerate: () => Promise<void>
    handleViewPost: () => void
    handleClose: () => void
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
    const [postId, setPostId] = useState<string | null>(null)
    const [useAdvancedPipeline, setUseAdvancedPipeline] = useState(true)

    // Research findings state
    const [researchFindings, setResearchFindings] = useState<
        SSEResearchFindingData[]
    >([])
    const [currentQuery, setCurrentQuery] =
        useState<SSEResearchQueryData | null>(null)

    // Review results state
    const [reviewResults, setReviewResults] = useState<SSEReviewResultData[]>(
        []
    )

    // Derived state
    const isProcessing =
        step !== 'idle' && step !== 'complete' && step !== 'error'
    const isInReviewPhase = step.startsWith('review-')
    const isInResearchPhase = step === 'research'

    /**
     * Calculate overall progress from step and step progress
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
        toast.success('Draft created with AI pipeline!')
    }

    /**
     * Start the content generation pipeline
     */
    const handleGenerate = async () => {
        setStep('research')
        setProgress(5)
        setError(null)
        setResult(null)
        setStepMessage('Starting pipeline...')
        setResearchFindings([])
        setCurrentQuery(null)
        setReviewResults([])

        try {
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
                            } else if (
                                progressData.data.type === 'review-result'
                            ) {
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
                            throw new Error(
                                completeData.error || 'Pipeline failed'
                            )
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
            setPostId(null)
            setStepMessage('')
            setResearchFindings([])
            setCurrentQuery(null)
            setReviewResults([])
        }, 300)
    }

    return {
        // State
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

        // Actions
        setUseAdvancedPipeline,
        handleGenerate,
        handleViewPost,
        handleClose,
    }
}
