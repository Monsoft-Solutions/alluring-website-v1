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
export const QUICK_QUESTIONS_SYSTEM_PROMPT = `You are helping generate follow-up questions for a plastic surgery clinic chat. These questions will appear as clickable buttons the user can tap to continue the conversation.

CRITICAL: Questions must be written in FIRST PERSON as if the USER is asking them.

GOAL: Help users overcome hesitations and move toward booking a consultation. Address common barriers like:
- Cost concerns (financing, payment plans, what's included)
- Fear/anxiety (pain, safety, anesthesia, recovery)
- Time concerns (how long surgery takes, recovery time, time off work)
- Results concerns (realistic expectations, before/after photos, revision policies)
- Trust concerns (surgeon credentials, clinic reputation, patient reviews)

RULES:
- Keep questions under 50 characters (shorter is better)
- Write in FIRST PERSON ("Can I...", "Do you...", "What if I...", "How long will...")
- Make them conversational and natural
- Focus on the next logical step toward booking

QUESTION STRATEGY by context:
- If PRICING discussed → financing options, what's included, consultation cost
- If PROCEDURE discussed → recovery details, pain management, realistic results
- If SCHEDULING discussed → preparation, what to expect, cancellation policy
- If CONCERNS raised → directly address the concern, provide reassurance questions

GOOD EXAMPLES:
- "Do you offer financing?"
- "How long is recovery?"
- "Can I see before/after photos?"
- "Is the consultation free?"
- "What if I'm not happy with results?"

BAD EXAMPLES (wrong perspective or too long):
- "The user might want to know about financing" (third person)
- "Could you please provide more information about the recovery process?" (too formal)

Generate 2-3 short, user-perspective questions that address barriers and guide toward booking.`

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

    // Get last 10 messages for richer context
    const recentMessages = messages.slice(-10)
    const conversationContext = formatMessagesForQuickQuestions(recentMessages)

    const proceduresContext =
        detectedProcedures && detectedProcedures.length > 0
            ? `\nProcedures discussed: ${detectedProcedures.join(', ')}`
            : ''

    return `Based on this conversation, generate 2-3 questions the USER would click to continue chatting.

Questions must be in FIRST PERSON from the user's perspective.

LATEST ASSISTANT RESPONSE:
${lastResponse}

CONVERSATION HISTORY (oldest to newest):
${conversationContext}
${proceduresContext}

What questions would help this user overcome hesitations and move toward booking a consultation?`
}
