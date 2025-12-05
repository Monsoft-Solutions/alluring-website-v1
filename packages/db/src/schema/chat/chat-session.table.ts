/**
 * Chat Session Table
 *
 * Stores user chat sessions with lead information collected
 * from the pre-chat form. Includes intent classification,
 * lead scoring, and human handoff capabilities.
 *
 * @module packages/db/src/schema/chat/chat-session.table
 */
import {
    boolean,
    integer,
    jsonb,
    numeric,
    pgTable,
    text,
    timestamp,
    uuid,
} from 'drizzle-orm/pg-core'

/**
 * Session status options
 */
export const SESSION_STATUSES = [
    'active',
    'closed',
    'archived',
    'escalated',
] as const

export type SessionStatus = (typeof SESSION_STATUSES)[number]

/**
 * Intent types for conversation classification
 */
export const CHAT_INTENTS = [
    'consultation_request',
    'pricing_inquiry',
    'procedure_info',
    'post_op_question',
    'financing_inquiry',
    'general_inquiry',
    'complaint',
    'unknown',
] as const

export type ChatIntent = (typeof CHAT_INTENTS)[number]

/**
 * Lead grade types
 */
export const LEAD_GRADES = ['A', 'B', 'C', 'D'] as const

export type LeadGrade = (typeof LEAD_GRADES)[number]

/**
 * Scoring signals tracked for lead scoring
 */
export type ScoringSignals = {
    hasEmail?: boolean
    askedPricing?: boolean
    askedConsultation?: boolean
    mentionedProcedure?: string
    messageCount?: number
    sessionDuration?: number
    returningVisitor?: boolean
    exitIntent?: boolean
}

/**
 * Chat session table for tracking conversations and leads
 */
export const chatSession = pgTable('chat_session', {
    id: uuid('id').primaryKey().defaultRandom(),

    /**
     * Lead information from pre-chat form
     */
    fullName: text('full_name').notNull(),
    phone: text('phone').notNull(),
    email: text('email'),

    /**
     * Session status
     */
    status: text('status').notNull().default('active'),

    /**
     * Message count for quick analytics
     */
    messageCount: integer('message_count').notNull().default(0),

    /**
     * Whether this is an admin test session
     */
    isTestSession: boolean('is_test_session').notNull().default(false),

    /**
     * Metadata for analytics
     */
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    pageUrl: text('page_url'),
    referrer: text('referrer'),

    /**
     * UTM tracking fields
     */
    utmSource: text('utm_source'),
    utmMedium: text('utm_medium'),
    utmCampaign: text('utm_campaign'),

    // ============================================
    // Intent Classification Fields (Phase 2)
    // ============================================

    /**
     * Primary detected intent of the conversation
     */
    primaryIntent: text('primary_intent'),

    /**
     * Confidence score for intent classification (0.0-1.0)
     */
    intentConfidence: numeric('intent_confidence', { precision: 3, scale: 2 }),

    /**
     * Procedures mentioned or detected in the conversation
     * Stored as JSON array: ["bbl", "tummy_tuck"]
     */
    detectedProcedures: jsonb('detected_procedures').$type<string[]>(),

    /**
     * Tags for the session
     * Stored as JSON array: ["hot_lead", "price_sensitive"]
     */
    tags: jsonb('tags').$type<string[]>(),

    // ============================================
    // Lead Scoring Fields (Phase 3)
    // ============================================

    /**
     * Calculated lead score (0-100+)
     */
    leadScore: integer('lead_score').notNull().default(0),

    /**
     * Lead grade based on score thresholds
     * A: 70+, B: 50-69, C: 30-49, D: <30
     */
    leadGrade: text('lead_grade'),

    /**
     * Signals that contributed to the lead score
     */
    scoringSignals: jsonb('scoring_signals').$type<ScoringSignals>(),

    // ============================================
    // Human Handoff Fields (Phase 4)
    // ============================================

    /**
     * Whether this session has been escalated to a human
     */
    isEscalated: boolean('is_escalated').notNull().default(false),

    /**
     * When the session was escalated
     */
    escalatedAt: timestamp('escalated_at'),

    /**
     * Reason for escalation (keyword, manual, sentiment, etc.)
     */
    escalationReason: text('escalation_reason'),

    /**
     * Admin user assigned to handle this escalation
     */
    assignedTo: text('assigned_to'),

    /**
     * Timestamps
     */
    lastMessageAt: timestamp('last_message_at'),
    closedAt: timestamp('closed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
})

export type ChatSession = typeof chatSession.$inferSelect
export type InsertChatSession = typeof chatSession.$inferInsert
