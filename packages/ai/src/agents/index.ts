/**
 * @workspace/ai/agents
 *
 * AI agents for content review and orchestration.
 *
 * @module @workspace/ai/agents
 */

// Types
export {
    type IssueSeverity,
    type ReviewIssue,
    type AgentReview,
    type ReviewAgentOptions,
    type OrchestratorResult,
    type PipelineStep,
    type PipelineProgress,
    reviewIssueSchema,
    agentReviewSchema,
    type AgentReviewOutput,
} from './types.agent'

// Review Agents
export { runInternalLinksReviewer } from './internal-links-reviewer.agent'
export { runExternalLinksReviewer } from './external-links-reviewer.agent'
export { runWritingQualityReviewer } from './writing-quality-reviewer.agent'
export { runAISlopDetector } from './ai-slop-detector.agent'

// Orchestrator
export { runOrchestrator, type OrchestratorOptions } from './orchestrator.agent'

/**
 * Run all review agents in parallel
 */
export async function runAllReviewAgents(
    options: import('./types.agent').ReviewAgentOptions
): Promise<import('./types.agent').AgentReview[]> {
    const [
        { runInternalLinksReviewer },
        { runExternalLinksReviewer },
        { runWritingQualityReviewer },
        { runAISlopDetector },
    ] = await Promise.all([
        import('./internal-links-reviewer.agent'),
        import('./external-links-reviewer.agent'),
        import('./writing-quality-reviewer.agent'),
        import('./ai-slop-detector.agent'),
    ])

    const results = await Promise.all([
        runInternalLinksReviewer(options),
        runExternalLinksReviewer(options),
        runWritingQualityReviewer(options),
        runAISlopDetector(options),
    ])

    return results
}
