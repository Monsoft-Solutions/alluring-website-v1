/**
 * Conversation Analysis Schema
 *
 * Comprehensive Zod schema for AI-powered conversation analysis.
 * Extracts lead profile, psychographic data, and actionable intelligence.
 * Used with AI SDK's generateObject() for type-safe structured output.
 *
 * @module @workspace/ai/schemas/conversation-analysis
 */
import { z } from 'zod'

import {
    intentTypeSchema,
    detectableProcedureSchema,
    sessionTagSchema,
    INTENT_TYPES,
    DETECTABLE_PROCEDURES,
    SESSION_TAGS,
} from './intent-classification.schema'

// ============================================
// Lead Profile Enums
// ============================================

/**
 * Budget indicator levels
 */
export const BUDGET_INDICATORS = [
    'low',
    'medium',
    'high',
    'premium',
    'unknown',
] as const

export type BudgetIndicator = (typeof BUDGET_INDICATORS)[number]

/**
 * Timeline for procedure
 */
export const TIMELINE_OPTIONS = [
    'within_week',
    'within_month',
    'within_3_months',
    'within_6_months',
    'within_year',
    'flexible',
    'unknown',
] as const

export type Timeline = (typeof TIMELINE_OPTIONS)[number]

/**
 * Decision stage in buying journey
 */
export const DECISION_STAGES = [
    'researching',
    'comparing',
    'ready_to_book',
    'post_op',
    'unknown',
] as const

export type DecisionStage = (typeof DECISION_STAGES)[number]

/**
 * Patient type (local vs travel)
 */
export const PATIENT_TYPES = [
    'local',
    'travel_domestic',
    'travel_international',
    'unknown',
] as const

export type PatientType = (typeof PATIENT_TYPES)[number]

// ============================================
// Psychographic Enums
// ============================================

/**
 * Sentiment analysis result
 */
export const SENTIMENT_OPTIONS = [
    'positive',
    'neutral',
    'negative',
    'mixed',
] as const

export type Sentiment = (typeof SENTIMENT_OPTIONS)[number]

// ============================================
// Actionable Intelligence Enums
// ============================================

/**
 * Recommended follow-up action
 */
export const RECOMMENDED_ACTIONS = [
    'call_immediately',
    'schedule_callback',
    'send_info',
    'send_pricing',
    'nurture',
    'no_action',
] as const

export type RecommendedAction = (typeof RECOMMENDED_ACTIONS)[number]

/**
 * Follow-up priority levels
 */
export const FOLLOW_UP_PRIORITIES = ['urgent', 'high', 'normal', 'low'] as const

export type FollowUpPriority = (typeof FOLLOW_UP_PRIORITIES)[number]

/**
 * Contact method preferences
 */
export const CONTACT_METHODS = ['phone', 'email', 'text', 'whatsapp'] as const

export type ContactMethod = (typeof CONTACT_METHODS)[number]

// ============================================
// Zod Schemas
// ============================================

export const budgetIndicatorSchema = z.enum(BUDGET_INDICATORS)
export const timelineSchema = z.enum(TIMELINE_OPTIONS)
export const decisionStageSchema = z.enum(DECISION_STAGES)
export const patientTypeSchema = z.enum(PATIENT_TYPES)
export const sentimentSchema = z.enum(SENTIMENT_OPTIONS)
export const recommendedActionSchema = z.enum(RECOMMENDED_ACTIONS)
export const followUpPrioritySchema = z.enum(FOLLOW_UP_PRIORITIES)
export const contactMethodSchema = z.enum(CONTACT_METHODS)

/**
 * Lead profile extracted from conversation
 */
export const leadProfileSchema = z.object({
    budgetIndicator: budgetIndicatorSchema.describe(
        'Inferred budget level based on conversation signals'
    ),
    timeline: timelineSchema.describe(
        'When the lead wants to have the procedure done'
    ),
    decisionStage: decisionStageSchema.describe(
        'Where the lead is in their decision journey'
    ),
    patientType: patientTypeSchema.describe(
        'Whether the lead is local or traveling for the procedure'
    ),
})

export type LeadProfile = z.infer<typeof leadProfileSchema>

/**
 * Contact preference information
 */
export const contactPreferenceSchema = z.object({
    method: contactMethodSchema
        .optional()
        .describe('Preferred contact method if mentioned'),
    timeOfDay: z
        .string()
        .optional()
        .describe(
            'Preferred time to contact if mentioned (e.g., "mornings", "after 5pm")'
        ),
    language: z
        .string()
        .optional()
        .describe('Preferred language for communication if mentioned'),
})

export type ContactPreference = z.infer<typeof contactPreferenceSchema>

/**
 * Psychographic data extracted from conversation
 */
export const psychographicDataSchema = z.object({
    motivations: z
        .array(z.string())
        .describe(
            'Primary motivations and goals (e.g., "feel more confident", "look younger")'
        ),
    concerns: z
        .array(z.string())
        .describe(
            'Fears and hesitations about the procedure (e.g., "worried about pain", "scared of anesthesia")'
        ),
    objections: z
        .array(z.string())
        .describe(
            'Barriers to booking (e.g., "need to save more", "partner not supportive")'
        ),
    sentiment: sentimentSchema.describe(
        'Overall emotional tone of the conversation'
    ),
})

export type PsychographicData = z.infer<typeof psychographicDataSchema>

/**
 * Actionable intelligence for sales team
 */
export const actionableIntelligenceSchema = z.object({
    recommendedAction: recommendedActionSchema.describe(
        'Best next step for the sales team'
    ),
    followUpPriority: followUpPrioritySchema.describe(
        'How urgently this lead should be followed up'
    ),
    talkingPoints: z
        .array(z.string())
        .describe(
            'Key points the sales team should address in follow-up (max 5)'
        ),
    contactPreference: contactPreferenceSchema.describe(
        'How and when the lead prefers to be contacted'
    ),
})

export type ActionableIntelligence = z.infer<
    typeof actionableIntelligenceSchema
>

/**
 * Complete conversation analysis schema
 *
 * This schema combines intent classification with comprehensive
 * lead analysis for sales team actionability.
 */
export const conversationAnalysisSchema = z.object({
    // Intent classification (same as before)
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

    // Lead profile
    leadProfile: leadProfileSchema.describe(
        'Profile information about the lead'
    ),

    // Psychographic data
    psychographicData: psychographicDataSchema.describe(
        'Emotional and psychological insights'
    ),

    // Actionable intelligence
    actionableIntelligence: actionableIntelligenceSchema.describe(
        'Recommended actions for sales team'
    ),

    // Human-readable summary
    conversationSummary: z
        .string()
        .describe(
            'A 2-3 sentence summary of the conversation for quick review by sales team'
        ),
})

export type ConversationAnalysis = z.infer<typeof conversationAnalysisSchema>

/**
 * Message format for analysis input
 */
export type AnalysisMessage = {
    role: 'user' | 'assistant'
    content: string
}

/**
 * Default analysis result for errors or empty conversations
 */
export const DEFAULT_CONVERSATION_ANALYSIS: ConversationAnalysis = {
    primaryIntent: 'unknown',
    intentConfidence: 0,
    detectedProcedures: [],
    tags: [],
    leadProfile: {
        budgetIndicator: 'unknown',
        timeline: 'unknown',
        decisionStage: 'unknown',
        patientType: 'unknown',
    },
    psychographicData: {
        motivations: [],
        concerns: [],
        objections: [],
        sentiment: 'neutral',
    },
    actionableIntelligence: {
        recommendedAction: 'no_action',
        followUpPriority: 'normal',
        talkingPoints: [],
        contactPreference: {},
    },
    conversationSummary: 'Insufficient conversation data for analysis.',
}

// Re-export intent classification types for convenience
export {
    INTENT_TYPES,
    DETECTABLE_PROCEDURES,
    SESSION_TAGS,
    type IntentType,
    type DetectableProcedure,
    type SessionTag,
} from './intent-classification.schema'
