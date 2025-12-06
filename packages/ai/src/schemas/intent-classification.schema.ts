/**
 * Intent Classification Schema
 *
 * Zod schema for validating AI intent classification responses.
 * Used with AI SDK's generateObject() for type-safe structured output.
 *
 * @module @workspace/ai/schemas/intent-classification
 */
import { z } from 'zod'

/**
 * Available intent types for classification
 */
export const INTENT_TYPES = [
    'consultation_request',
    'pricing_inquiry',
    'procedure_info',
    'post_op_question',
    'financing_inquiry',
    'general_inquiry',
    'complaint',
    'unknown',
] as const

export type IntentType = (typeof INTENT_TYPES)[number]

/**
 * Procedures that can be detected in conversations
 */
export const DETECTABLE_PROCEDURES = [
    'bbl',
    'breast_augmentation',
    'breast_lift',
    'breast_reduction',
    'tummy_tuck',
    'liposuction',
    'mommy_makeover',
    'facelift',
    'rhinoplasty',
    'blepharoplasty',
    'brow_lift',
    'chin_augmentation',
    'lip_augmentation',
    'botox',
    'fillers',
] as const

export type DetectableProcedure = (typeof DETECTABLE_PROCEDURES)[number]

/**
 * Tags that can be applied to sessions
 */
export const SESSION_TAGS = [
    'hot_lead',
    'price_sensitive',
    'ready_to_book',
    'returning_visitor',
    'multiple_procedures',
    'financing_needed',
    'urgent',
    'research_phase',
    'post_op_concern',
] as const

export type SessionTag = (typeof SESSION_TAGS)[number]

/**
 * Zod schema for intent type enum
 */
export const intentTypeSchema = z.enum(INTENT_TYPES)

/**
 * Zod schema for detectable procedure enum
 */
export const detectableProcedureSchema = z.enum(DETECTABLE_PROCEDURES)

/**
 * Zod schema for session tag enum
 */
export const sessionTagSchema = z.enum(SESSION_TAGS)

/**
 * Zod schema for intent classification result
 *
 * This schema is used with AI SDK's generateObject() to ensure
 * type-safe structured output from the LLM.
 */
export const intentClassificationSchema = z.object({
    primaryIntent: intentTypeSchema.describe(
        'The primary intent detected from the conversation'
    ),
    intentConfidence: z
        .number()
        .min(0)
        .max(1)
        .describe('Confidence score between 0 and 1'),
    detectedProcedures: z
        .array(detectableProcedureSchema)
        .describe('List of procedures mentioned in the conversation'),
    tags: z
        .array(sessionTagSchema)
        .describe('Relevant tags based on conversation context'),
})

/**
 * TypeScript type inferred from the schema
 */
export type IntentClassification = z.infer<typeof intentClassificationSchema>

/**
 * Message format for classification input
 */
export type ClassificationMessage = {
    role: 'user' | 'assistant'
    content: string
}
