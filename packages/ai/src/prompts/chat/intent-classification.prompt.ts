/**
 * Intent Classification Prompt
 *
 * Parameterized prompt template for AI intent classification.
 * Used with generateObject() for structured output.
 *
 * @module @workspace/ai/prompts/chat/intent-classification
 */
import type { ClassificationMessage } from '@workspace/shared/schemas/chat'

/**
 * System prompt for intent classification
 *
 * Provides detailed instructions to the LLM for analyzing
 * plastic surgery clinic chat conversations.
 */
export const INTENT_CLASSIFICATION_SYSTEM_PROMPT = `You are an intent classifier for a plastic surgery clinic chat. Analyze the conversation and extract:

1. PRIMARY INTENT - One of:
   - consultation_request: User wants to schedule a consultation
   - pricing_inquiry: User asking about costs, prices, financing
   - procedure_info: User seeking information about procedures
   - post_op_question: User with post-operative questions
   - financing_inquiry: User specifically asking about payment plans
   - general_inquiry: General questions about the clinic
   - complaint: User expressing dissatisfaction
   - unknown: Cannot determine intent

2. CONFIDENCE - How confident you are (0.0 to 1.0)

3. PROCEDURES - Any procedures mentioned (use exact slugs):
   bbl, breast_augmentation, breast_lift, breast_reduction, tummy_tuck, liposuction, mommy_makeover, facelift, rhinoplasty, blepharoplasty, brow_lift, chin_augmentation, lip_augmentation, botox, fillers

4. TAGS - Relevant tags:
   - hot_lead: High interest, likely to convert
   - price_sensitive: Very focused on cost
   - ready_to_book: Explicitly wants to schedule
   - returning_visitor: Mentions previous consultation/visit
   - multiple_procedures: Interested in more than one procedure
   - financing_needed: Needs payment plan
   - urgent: Time-sensitive request
   - research_phase: Just gathering information
   - post_op_concern: Has concerns about recovery`

/**
 * Format messages for classification prompt
 *
 * Converts an array of conversation messages into a readable
 * format for the LLM to analyze.
 *
 * @param messages - Array of conversation messages
 * @returns Formatted string representation of the conversation
 */
export function formatMessagesForClassification(
    messages: ClassificationMessage[]
): string {
    return messages
        .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join('\n\n')
}

/**
 * Generate the intent classification prompt
 *
 * Creates a complete prompt for intent analysis by combining
 * the formatted conversation with analysis instructions.
 *
 * @param messages - The conversation messages to analyze
 * @returns The complete prompt string
 */
export function getIntentClassificationPrompt(
    messages: ClassificationMessage[]
): string {
    const conversationText = formatMessagesForClassification(messages)
    return `Analyze this conversation:\n\n${conversationText}`
}
