/**
 * Blog outline input for the pipeline
 *
 * @module @workspace/ai/types/pipeline/blog-outline-input
 */
import type { OutlineSection } from './outline-section.type'

/**
 * Blog outline input for the pipeline
 */
export type BlogOutlineInput = {
    tldr: string[]
    introduction: {
        hook: string
        preview: string
    }
    sections: OutlineSection[]
    conclusion: {
        summaryPoints: string[]
        nextSteps: string
    }
    seoNotes?: {
        internalLinks?: string[]
        externalSources?: string[]
        imageIdeas?: string[]
    }
}
