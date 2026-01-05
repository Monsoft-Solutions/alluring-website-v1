/**
 * @workspace/ai/agents
 *
 * AI agents for content review and orchestration.
 *
 * @module @workspace/ai/agents
 */
import type { ReviewAgentOptions, AgentReview } from './types.agent'

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
export { runFactSourceVerifier } from './fact-source-verifier.agent'

// Orchestrator
export { runOrchestrator, type OrchestratorOptions } from './orchestrator.agent'

/**
 * Run all review agents in parallel
 *
 * Runs all 5 review agents:
 * 1. Internal Links Reviewer
 * 2. External Links Reviewer
 * 3. Writing Quality Reviewer
 * 4. AI Slop Detector
 * 5. Fact & Source Verifier
 */
export async function runAllReviewAgents(
    options: ReviewAgentOptions
): Promise<AgentReview[]> {
    const [
        { runInternalLinksReviewer },
        { runExternalLinksReviewer },
        { runWritingQualityReviewer },
        { runAISlopDetector },
        { runFactSourceVerifier },
    ] = await Promise.all([
        import('./internal-links-reviewer.agent'),
        import('./external-links-reviewer.agent'),
        import('./writing-quality-reviewer.agent'),
        import('./ai-slop-detector.agent'),
        import('./fact-source-verifier.agent'),
    ])

    const results = await Promise.all([
        runInternalLinksReviewer(options),
        runExternalLinksReviewer(options),
        runWritingQualityReviewer(options),
        runAISlopDetector(options),
        runFactSourceVerifier(options),
    ])

    return results
}
