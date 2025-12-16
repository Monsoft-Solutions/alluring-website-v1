/**
 * Conversation Analysis Schema
 *
 * Comprehensive Zod schema for AI-powered conversation analysis.
 * Extracts lead profile, psychographic data, and actionable intelligence.
 * Single source of truth used across @workspace/ai, @workspace/chat, and apps.
 *
 * @module @workspace/shared/schemas/chat/conversation-analysis
 */
import { z } from 'zod'

import {
    intentTypeSchema,
    detectableProcedureSchema,
    sessionTagSchema,
} from './intent-classification.schema'

// ============================================
// Lead Profile Const Arrays & Enums
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

/**
 * Patient type (local vs travel)
 */
export const PATIENT_TYPES = [
    'local',
    'travel_domestic',
    'travel_international',
    'unknown',
] as const

// ============================================
// Psychographic Const Arrays
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

// ============================================
// Actionable Intelligence Const Arrays
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

/**
 * Follow-up priority levels
 */
export const FOLLOW_UP_PRIORITIES = ['urgent', 'high', 'normal', 'low'] as const

/**
 * Contact method preferences
 */
export const CONTACT_METHODS = ['phone', 'email', 'text', 'whatsapp'] as const

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
 * Extracted contact information schema
 * Captures actual contact details provided by the user in conversation
 */
export const extractedContactSchema = z.object({
    fullName: z
        .string()
        .optional()
        .describe('Full name if provided (e.g., "John Smith", "Maria Garcia")'),
    phone: z
        .string()
        .optional()
        .describe(
            'Phone number if provided - extract digits only, no formatting (e.g., "5551234567")'
        ),
    email: z.string().optional().describe('Email address if provided'),
    location: z
        .string()
        .optional()
        .describe(
            'Where they live/are located if mentioned (e.g., "New York", "Orlando, FL", "Colombia")'
        ),
    preferredContactMethod: contactMethodSchema
        .optional()
        .describe(
            'How they explicitly want to be contacted (phone, email, text, whatsapp)'
        ),
    preferredContactTime: z
        .string()
        .optional()
        .describe(
            'When they prefer to be contacted if specified (e.g., "mornings", "after 6pm", "weekends")'
        ),
})

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

/**
 * Complete conversation analysis schema
 *
 * This schema combines intent classification with comprehensive
 * lead analysis for sales team actionability.
 */
export const conversationAnalysisSchema = z.object({
    // Intent classification
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

    // Extracted contact information
    extractedContact: extractedContactSchema.describe(
        'Actual contact information provided by user in conversation'
    ),

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

// ============================================
// Types inferred from schemas
// ============================================

export type BudgetIndicator = z.infer<typeof budgetIndicatorSchema>
export type Timeline = z.infer<typeof timelineSchema>
export type DecisionStage = z.infer<typeof decisionStageSchema>
export type PatientType = z.infer<typeof patientTypeSchema>
export type Sentiment = z.infer<typeof sentimentSchema>
export type RecommendedAction = z.infer<typeof recommendedActionSchema>
export type FollowUpPriority = z.infer<typeof followUpPrioritySchema>
export type ContactMethod = z.infer<typeof contactMethodSchema>
export type ExtractedContact = z.infer<typeof extractedContactSchema>
export type LeadProfile = z.infer<typeof leadProfileSchema>
export type ContactPreference = z.infer<typeof contactPreferenceSchema>
export type PsychographicData = z.infer<typeof psychographicDataSchema>
export type ActionableIntelligence = z.infer<
    typeof actionableIntelligenceSchema
>
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
    extractedContact: {},
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
