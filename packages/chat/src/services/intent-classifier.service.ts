/**
 * Intent Classifier Service
 *
 * Keyword-based intent detection for chat conversations.
 * For AI-powered classification, use @workspace/ai/functions/classifyIntent.
 *
 * @module @workspace/chat/services/intent-classifier
 */

// Re-export types from @workspace/shared for backward compatibility
export type {
    IntentType,
    DetectableProcedure,
    SessionTag,
    IntentClassification,
    ClassificationMessage,
} from '@workspace/shared/schemas/chat'

export {
    INTENT_TYPES,
    DETECTABLE_PROCEDURES,
    SESSION_TAGS,
} from '@workspace/shared/schemas/chat'

/**
 * Quick keyword-based intent detection for real-time use
 * (Faster than AI but less accurate)
 *
 * Note: For full AI-powered classification, use:
 * ```typescript
 * import { classifyIntent } from '@workspace/ai'
 * ```
 */
export function detectIntentKeywords(message: string): Partial<{
    primaryIntent: string
    detectedProcedures: string[]
    tags: string[]
}> {
    const lowerMessage = message.toLowerCase()
    const result: {
        primaryIntent?: string
        detectedProcedures: string[]
        tags: string[]
    } = {
        detectedProcedures: [],
        tags: [],
    }

    // Detect intent from keywords
    if (
        lowerMessage.includes('consultation') ||
        lowerMessage.includes('appointment') ||
        lowerMessage.includes('schedule') ||
        lowerMessage.includes('book')
    ) {
        result.primaryIntent = 'consultation_request'
        result.tags.push('ready_to_book')
    } else if (
        lowerMessage.includes('price') ||
        lowerMessage.includes('cost') ||
        lowerMessage.includes('how much') ||
        lowerMessage.includes('afford')
    ) {
        result.primaryIntent = 'pricing_inquiry'
        result.tags.push('price_sensitive')
    } else if (
        lowerMessage.includes('financing') ||
        lowerMessage.includes('payment plan') ||
        lowerMessage.includes('monthly')
    ) {
        result.primaryIntent = 'financing_inquiry'
        result.tags.push('financing_needed')
    } else if (
        lowerMessage.includes('recovery') ||
        lowerMessage.includes('healing') ||
        lowerMessage.includes('after surgery')
    ) {
        result.primaryIntent = 'post_op_question'
    }

    // Detect procedures
    const procedureKeywords: Record<string, string> = {
        bbl: 'bbl',
        'brazilian butt': 'bbl',
        'butt lift': 'bbl',
        'breast augmentation': 'breast_augmentation',
        'breast implant': 'breast_augmentation',
        'boob job': 'breast_augmentation',
        'breast lift': 'breast_lift',
        'breast reduction': 'breast_reduction',
        'tummy tuck': 'tummy_tuck',
        abdominoplasty: 'tummy_tuck',
        liposuction: 'liposuction',
        lipo: 'liposuction',
        'mommy makeover': 'mommy_makeover',
        facelift: 'facelift',
        'face lift': 'facelift',
        botox: 'botox',
        filler: 'fillers',
    }

    for (const [keyword, procedure] of Object.entries(procedureKeywords)) {
        if (lowerMessage.includes(keyword)) {
            if (!result.detectedProcedures.includes(procedure)) {
                result.detectedProcedures.push(procedure)
            }
        }
    }

    // Detect tags
    if (
        lowerMessage.includes('asap') ||
        lowerMessage.includes('soon') ||
        lowerMessage.includes('urgent')
    ) {
        result.tags.push('urgent')
    }

    if (result.detectedProcedures.length > 1) {
        result.tags.push('multiple_procedures')
    }

    return result
}
