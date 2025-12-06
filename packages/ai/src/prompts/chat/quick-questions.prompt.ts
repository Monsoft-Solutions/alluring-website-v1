/**
 * Quick Questions Prompt
 *
 * Parameterized prompt template for AI-generated contextual quick questions.
 * Used with generateObject() for structured output.
 *
 * @module @workspace/ai/prompts/chat/quick-questions
 */
import type { QuickQuestionsMessage } from '../../schemas/quick-questions.schema'

/**
 * System prompt for quick questions generation
 *
 * Provides detailed instructions to the LLM for generating
 * contextual follow-up questions for plastic surgery consultations.
 */
export const QUICK_QUESTIONS_SYSTEM_PROMPT = `You are a helpful assistant for a plastic surgery clinic chat. Your task is to suggest 2-3 SHORT follow-up questions the user might want to ask next.

RULES:
- Keep questions under 50 characters (shorter is better)
- Make them conversational and natural
- Focus on the next logical step in the consultation journey
- Questions should feel like natural conversation continuations

QUESTION STRATEGY by context:
- If PRICING was discussed → suggest scheduling, financing, or comparison questions
- If a PROCEDURE was discussed → suggest detail, recovery, or pricing questions  
- If SCHEDULING was discussed → suggest preparation or what-to-expect questions
- If GENERAL INFO was given → suggest more specific procedure or pricing questions

GOOD EXAMPLES:
- "What's the recovery time?"
- "Do you offer financing?"
- "Can I see before/after photos?"
- "How do I schedule a consult?"
- "What's included in the price?"

BAD EXAMPLES (too long or formal):
- "Could you please provide more information about the recovery process?"
- "I would like to know about financing options available"

Respond with a JSON object containing an array of 2-3 question strings.`

/**
 * Format conversation messages for the prompt
 *
 * Converts an array of messages into a readable format for the LLM.
 *
 * @param messages - Array of conversation messages
 * @returns Formatted string representation
 */
export function formatMessagesForQuickQuestions(
    messages: QuickQuestionsMessage[]
): string {
    return messages
        .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join('\n\n')
}

/**
 * Generate the quick questions prompt
 *
 * Creates a complete prompt for generating contextual follow-up questions
 * based on the conversation context and last assistant response.
 *
 * @param params - Parameters for prompt generation
 * @returns The complete prompt string
 */
export function getQuickQuestionsPrompt(params: {
    messages: QuickQuestionsMessage[]
    lastResponse: string
    detectedProcedures?: string[]
}): string {
    const { messages, lastResponse, detectedProcedures } = params

    // Get last 4 messages for context (keeps prompt focused)
    const recentMessages = messages.slice(-4)
    const conversationContext = formatMessagesForQuickQuestions(recentMessages)

    const proceduresContext =
        detectedProcedures && detectedProcedures.length > 0
            ? `\nProcedures discussed: ${detectedProcedures.join(', ')}`
            : ''

    return `Based on this conversation, suggest 2-3 short follow-up questions the user might ask next.

LAST ASSISTANT RESPONSE:
${lastResponse}

RECENT CONVERSATION:
${conversationContext}
${proceduresContext}

Generate 2-3 contextual follow-up questions.`
}
