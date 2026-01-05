/**
 * Progress data types for pipeline callbacks
 *
 * @module @workspace/ai/types/pipeline/agentic-progress-data
 */

/**
 * Progress data types
 */
export type AgenticProgressData =
    | {
          type: 'tool-call'
          toolName: string
          query: string
          toolCallIndex: number
      }
    | { type: 'text-generation'; charCount: number }
    | {
          type: 'review-result'
          agentName: string
          score: number
          summary: string
          issueCount: number
      }
    | {
          type: 'orchestration-result'
          changeCount: number
          overallScore: number
      }
    | { type: 'extraction-result'; faqCount: number }
    | Record<string, unknown>
