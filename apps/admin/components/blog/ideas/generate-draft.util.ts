/**
 * Generate Draft Utilities
 *
 * Pure functions and constants for the blog draft generation pipeline.
 *
 * @module @/components/blog/ideas/generate-draft
 */

import type { BlogIdeaDetail } from '@/lib/queries/ideas.query'
import type {
    SSECompleteEvent,
    SSEErrorEvent,
    SSEEventData,
    SSEProgressEvent,
} from '@/lib/types/blog/pipeline.type'

/**
 * Step labels for display during pipeline execution
 */
export const STEP_LABELS: Record<string, string> = {
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

/**
 * Get badge variant based on score threshold
 */
export function getScoreBadgeVariant(
    score: number
): 'default' | 'secondary' | 'destructive' | 'outline' {
    if (score >= 75) return 'default'
    if (score >= 60) return 'secondary'
    if (score >= 40) return 'outline'
    return 'destructive'
}

/**
 * Format milliseconds to human-readable time
 */
export function formatTime(ms: number): string {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
}

/**
 * Outline structure for content generation
 */
export type OutlineForContent = {
    tldr: string[]
    introduction: {
        hook: string
        preview: string
    }
    sections: Array<{
        id: string
        title: string
        description: string
        keyPoints: string[]
        subsections: Array<{
            title: string
            description?: string
        }>
    }>
    conclusion: {
        summaryPoints: string[]
        nextSteps: string
    }
}

/**
 * Build outline structure from blog idea for content generation
 */
export function buildOutlineStructure(idea: BlogIdeaDetail): OutlineForContent {
    const outlineForContent: OutlineForContent = {
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

    return outlineForContent
}

/**
 * SSE event handler callbacks
 */
export type SSEEventHandlers = {
    onProgress: (data: SSEProgressEvent) => void
    onComplete: (data: SSECompleteEvent) => void
    onError: (data: SSEErrorEvent) => void
}

/**
 * Process SSE stream from the pipeline API
 */
export async function processSSEStream(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    handlers: SSEEventHandlers
): Promise<SSECompleteEvent | null> {
    const decoder = new TextDecoder()
    let buffer = ''
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
                    const data = JSON.parse(dataLine) as SSEEventData

                    if (eventType === 'progress') {
                        handlers.onProgress(data as SSEProgressEvent)
                    } else if (eventType === 'complete') {
                        const completeData = data as SSECompleteEvent
                        pipelineResult = completeData
                        handlers.onComplete(completeData)
                    } else if (eventType === 'error') {
                        handlers.onError(data as SSEErrorEvent)
                    }
                }
            }
        }
    }

    return pipelineResult
}
