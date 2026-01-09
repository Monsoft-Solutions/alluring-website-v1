/**
 * Result from the unified agentic content pipeline
 *
 * @module @workspace/ai/types/pipeline/agentic-content-pipeline-result
 */
import type { FaqItem } from '@workspace/shared/schemas/blog'
import type { CollectedSource } from '../../tools/research-tools.tool'
import type { AgentReview, OrchestratorResult } from '../../agents/types.agent'

/**
 * Result from the unified agentic content pipeline
 */
export type AgenticContentPipelineResult = {
    /** Whether pipeline succeeded */
    success: boolean
    /** Error message if failed */
    error?: string
    /** Final revised content (or initial if review skipped) */
    content: string
    /** Word count */
    wordCount: number
    /** SEO meta description */
    metaDescription: string
    /** Short excerpt */
    excerpt: string
    /** Suggested tags */
    suggestedTags: string[]
    /** Reading time in minutes */
    readingTimeMinutes: number
    /** Suggested category */
    suggestedCategory: string
    /** Extracted FAQ items */
    faqs: FaqItem[]
    /** FAQ Schema JSON-LD (null if no FAQs) */
    faqSchema: object | null
    /** All sources used during generation */
    sources: CollectedSource[]
    /** Reviews from all agents (empty if skipped) */
    reviews: AgentReview[]
    /** Orchestrator result (null if skipped) */
    orchestratorResult: OrchestratorResult | null
    /** Initial content before revisions */
    initialContent: string
    /** Initial word count before revisions */
    initialWordCount: number
    /** Pipeline timing metrics */
    metrics: {
        totalTimeMs: number
        generationTimeMs: number
        reviewTimeMs: number
        orchestrationTimeMs: number
        extractionTimeMs: number
        toolCallCount: number
        stepCount: number
    }
}
