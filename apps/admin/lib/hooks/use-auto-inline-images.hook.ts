/**
 * useAutoInlineImages Hook
 *
 * Client-side hook for managing the auto inline image generation process.
 * Handles SSE connection, progress tracking, and abort functionality.
 *
 * @module @/lib/hooks/use-auto-inline-images
 */
import { useState, useCallback, useRef } from 'react'
import type { InlineImageAnalysis } from '@workspace/ai'

import type {
    AutoInlineImageProgress,
    GeneratedImageWithUIState,
    AutoInlineImageResult,
    GenerateAutoInlineImagesOptions,
    UseAutoInlineImagesReturn,
    AutoInlineImagesSseEvent,
} from './auto-inline-images.type'

// Re-export types for convenience
export type {
    AutoInlineImageProgress,
    GeneratedImageWithUIState,
    AutoInlineImageResult,
    GenerateAutoInlineImagesOptions,
    UseAutoInlineImagesReturn,
}

/**
 * Hook for managing auto inline image generation with SSE streaming
 *
 * @returns Hook state and controls
 *
 * @example
 * ```tsx
 * const {
 *   isGenerating,
 *   progress,
 *   analysis,
 *   generatedImages,
 *   result,
 *   error,
 *   generate,
 *   cancel,
 *   reset,
 * } = useAutoInlineImages()
 *
 * const handleGenerate = () => {
 *   generate({
 *     content: editorContent,
 *     title: blogPostTitle,
 *     blogPostId: postId,
 *     maxImages: 5,
 *   })
 * }
 * ```
 */
export function useAutoInlineImages(): UseAutoInlineImagesReturn {
    const [isGenerating, setIsGenerating] = useState(false)
    const [progress, setProgress] = useState<AutoInlineImageProgress | null>(
        null
    )
    const [analysis, setAnalysis] = useState<InlineImageAnalysis | null>(null)
    const [generatedImages, setGeneratedImages] = useState<
        GeneratedImageWithUIState[]
    >([])
    const [result, setResult] = useState<AutoInlineImageResult | null>(null)
    const [error, setError] = useState<string | null>(null)

    const abortControllerRef = useRef<AbortController | null>(null)

    /**
     * Reset all state
     */
    const reset = useCallback(() => {
        setIsGenerating(false)
        setProgress(null)
        setAnalysis(null)
        setGeneratedImages([])
        setResult(null)
        setError(null)
    }, [])

    /**
     * Cancel the current generation
     */
    const cancel = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            abortControllerRef.current = null
        }
        setIsGenerating(false)
        setProgress(null)
        setError('Inline image generation cancelled by user')
    }, [])

    /**
     * Start auto inline image generation
     */
    const generate = useCallback(
        async (options: GenerateAutoInlineImagesOptions) => {
            // Reset state
            reset()
            setIsGenerating(true)

            // Create abort controller
            abortControllerRef.current = new AbortController()

            try {
                // Make POST request
                const response = await fetch(
                    '/api/blog/generate-inline-images',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            content: options.content,
                            title: options.title,
                            blogPostId: options.blogPostId,
                            maxImages: options.maxImages ?? 5,
                            imageModel: options.imageModel ?? 'gpt-image-1.5',
                        }),
                        signal: abortControllerRef.current.signal,
                    }
                )

                if (!response.ok) {
                    const errorData = (await response.json()) as {
                        error?: string
                    }
                    throw new Error(
                        errorData.error ||
                            `Failed to generate inline images (HTTP ${response.status})`
                    )
                }

                if (!response.body) {
                    throw new Error(
                        'No response body received from inline image generation endpoint'
                    )
                }

                // Read SSE stream
                const reader = response.body.getReader()
                const decoder = new TextDecoder()
                let buffer = ''

                while (true) {
                    const { done, value } = await reader.read()

                    if (done) {
                        break
                    }

                    buffer += decoder.decode(value, { stream: true })

                    // Process complete events from buffer
                    const events = buffer.split('\n\n')
                    buffer = events.pop() || '' // Keep incomplete event in buffer

                    for (const event of events) {
                        if (!event.trim()) continue

                        const parsedEvent = parseSseChunk(event)
                        if (parsedEvent) {
                            handleSSEEvent(parsedEvent)
                        }
                    }
                }
            } catch (err) {
                if (err instanceof Error) {
                    if (err.name === 'AbortError') {
                        setError('Inline image generation cancelled by user')
                    } else {
                        setError(err.message)
                    }
                } else {
                    setError(
                        'Unexpected error occurred during inline image generation'
                    )
                }
            } finally {
                setIsGenerating(false)
                abortControllerRef.current = null
            }
        },
        [reset]
    )

    /**
     * Parse a single SSE chunk into a typed event
     */
    const parseSseChunk = (chunk: string): AutoInlineImagesSseEvent | null => {
        const lines = chunk.split('\n')
        let eventType = ''
        let eventData = ''

        for (const line of lines) {
            if (line.startsWith('event: ')) {
                eventType = line.slice(7).trim()
            } else if (line.startsWith('data: ')) {
                eventData = line.slice(6).trim()
            }
        }

        if (!eventType || !eventData) return null

        try {
            const data = JSON.parse(eventData) as unknown
            return { type: eventType, data } as AutoInlineImagesSseEvent
        } catch (parseError) {
            console.error(
                '[useAutoInlineImages] Failed to parse SSE event:',
                parseError
            )
            return null
        }
    }

    /**
     * Handle SSE events
     */
    const handleSSEEvent = (event: AutoInlineImagesSseEvent) => {
        switch (event.type) {
            case 'progress':
                setProgress({
                    step: event.data.step,
                    progress: event.data.progress,
                    message: event.data.message,
                })
                break

            case 'analysis': {
                setAnalysis(event.data.analysis)

                // Initialize generated images with UI state
                const initialImages: GeneratedImageWithUIState[] =
                    event.data.analysis.opportunities.map((opp) => ({
                        opportunityId: opp.id,
                        imageType: opp.recommendedImageType,
                        insertAfterText: opp.insertAfterText,
                        altText: opp.suggestedSubject,
                        status: 'pending',
                        isGenerating: false,
                    }))
                setGeneratedImages(initialImages)
                break
            }

            case 'image':
                setGeneratedImages((prev) =>
                    prev.map((img) => {
                        if (img.opportunityId === event.data.opportunityId) {
                            return {
                                ...img,
                                isGenerating:
                                    event.data.status === 'generating',
                                status:
                                    event.data.status === 'generating'
                                        ? 'generating'
                                        : event.data.status,
                                imageUrl: event.data.imageUrl ?? img.imageUrl,
                                altText: event.data.altText ?? img.altText,
                                error: event.data.error,
                            }
                        }
                        return img
                    })
                )
                break

            case 'complete': {
                // Update final images state
                setGeneratedImages(
                    event.data.generatedImages.map((img) => ({
                        ...img,
                        isGenerating: false,
                    }))
                )

                setResult({
                    success: event.data.success,
                    analysis: event.data.analysis,
                    generatedImages: event.data.generatedImages,
                    metrics: event.data.metrics,
                })
                break
            }

            case 'error':
                setError(event.data.error)
                setResult({
                    success: false,
                    generatedImages: [],
                    error: event.data.error,
                })
                break
        }
    }

    return {
        isGenerating,
        progress,
        analysis,
        generatedImages,
        result,
        error,
        generate,
        cancel,
        reset,
    }
}
