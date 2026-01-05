/**
 * Think Tool for AI SDK
 *
 * Provides a reasoning scratchpad for Claude to analyze complex decisions
 * before taking action. Based on Anthropic's engineering guidance for
 * improving performance on policy-heavy tasks and sequential decision-making.
 *
 * @see https://www.anthropic.com/engineering/claude-think-tool
 * @module @workspace/ai/tools/think
 */
import { tool } from 'ai'
import { z } from 'zod'

/**
 * Input schema for think tool
 * Uses inputSchema as required by AI SDK
 */
const thinkInputSchema = z.object({
    thought: z
        .string()
        .describe('Your step-by-step reasoning and analysis process'),
})

/**
 * Create a think tool for structured reasoning
 *
 * The think tool provides Claude with a dedicated space for reasoning
 * through complex decisions before acting. It does not retrieve information
 * or make changes - it's purely a scratchpad for analysis.
 *
 * Per Anthropic's guidance, this tool improves performance by 54% on
 * policy-heavy tasks when combined with domain-specific examples in
 * the system prompt.
 *
 * @returns AI SDK tool for structured thinking
 *
 * @example
 * ```typescript
 * const tools = {
 *   perplexity_search: createPerplexitySearchTool(sourceContext),
 *   google_search: createGoogleSearchTool(sourceContext),
 *   think: createThinkTool(),
 * }
 *
 * const result = await generateText({
 *   model: anthropic('claude-opus-4-5'),
 *   tools,
 *   maxSteps: 20,
 *   prompt: 'Research and write about BBL recovery',
 * })
 * ```
 */
export function createThinkTool() {
    return tool({
        description:
            'Use this tool to reason through complex decisions before acting. Does not retrieve information or make changes - just provides a scratchpad for step-by-step analysis.',
        inputSchema: thinkInputSchema,
        execute: ({ thought }: { thought: string }) => {
            // Log reasoning for debugging/tracing (truncated for readability)
            const preview =
                thought.length > 200
                    ? thought.substring(0, 200) + '...'
                    : thought
            console.log('[Think Tool] Reasoning:', preview)

            // The think tool just acknowledges - it's a reasoning scratchpad
            return {
                acknowledged: true,
                message:
                    'Reasoning noted. Continue with your analysis or action.',
            }
        },
    })
}
