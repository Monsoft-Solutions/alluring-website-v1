/**
 * Agent Types
 *
 * Shared types for all review agents in the content pipeline.
 *
 * @module @workspace/ai/agents/types
 */
import { z } from 'zod'

/**
 * Issue severity levels
 */
export type IssueSeverity = 'critical' | 'warning' | 'suggestion'

/**
 * Review issue found by an agent
 */
export type ReviewIssue = {
    /** Severity of the issue */
    severity: IssueSeverity
    /** Location in the content (line number, section, or character position) */
    location: string
    /** Description of the issue */
    description: string
    /** Suggested fix */
    suggestedFix: string
    /** Original text that has the issue */
    originalText?: string
}

/**
 * Result from a review agent
 */
export type AgentReview = {
    /** Name of the agent that produced this review */
    agentName: string
    /** Overall score (0-100, higher is better) */
    score: number
    /** List of issues found */
    issues: ReviewIssue[]
    /** Brief summary of the review */
    summary: string
    /** Processing time in milliseconds */
    processingTimeMs: number
    /** Model used for the review */
    modelId: string
}

/**
 * Zod schema for review issues
 */
export const reviewIssueSchema = z.object({
    severity: z.enum(['critical', 'warning', 'suggestion']),
    location: z
        .string()
        .describe('Line number, section name, or position in content'),
    description: z.string().describe('Clear description of the issue'),
    suggestedFix: z.string().describe('Specific suggestion to fix the issue'),
    originalText: z
        .string()
        .optional()
        .describe('The problematic text if applicable'),
})

/**
 * Zod schema for agent review results
 */
export const agentReviewSchema = z.object({
    score: z
        .number()
        .min(0)
        .max(100)
        .describe('Overall score from 0-100, higher is better'),
    issues: z.array(reviewIssueSchema).describe('List of issues found'),
    summary: z
        .string()
        .max(500)
        .describe('Brief summary of findings in 1-3 sentences'),
})

/**
 * Type inferred from the agent review schema
 */
export type AgentReviewOutput = z.infer<typeof agentReviewSchema>

/**
 * Options for running a review agent
 */
export type ReviewAgentOptions = {
    /** The content to review (markdown) */
    content: string
    /** Title of the blog post */
    title: string
    /** Primary keyword being targeted */
    primaryKeyword?: string
    /** Secondary keywords */
    secondaryKeywords?: string[]
    /** Model ID to use */
    modelId?: string
    /** Temperature for generation */
    temperature?: number
}

/**
 * Result from the orchestrator
 */
export type OrchestratorResult = {
    /** The revised content */
    revisedContent: string
    /** Summary of changes made */
    changesSummary: string
    /** List of changes with before/after */
    changes: Array<{
        type: 'fix' | 'improvement' | 'addition' | 'removal'
        description: string
        before?: string
        after?: string
    }>
    /** Combined score from all agents */
    overallScore: number
    /** Individual agent reviews */
    agentReviews: AgentReview[]
    /** Processing time for orchestration */
    processingTimeMs: number
}

/**
 * Pipeline step information
 */
export type PipelineStep =
    | 'research'
    | 'content-generation'
    | 'link-integration'
    | 'review-internal-links'
    | 'review-external-links'
    | 'review-writing-quality'
    | 'review-ai-slop'
    | 'orchestration'
    | 'complete'

/**
 * Pipeline progress update
 */
export type PipelineProgress = {
    step: PipelineStep
    progress: number // 0-100
    message: string
    data?: unknown
}
