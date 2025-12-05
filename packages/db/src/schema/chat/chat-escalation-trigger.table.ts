/**
 * Chat Escalation Trigger Table
 *
 * Stores triggers that determine when a chat should be escalated
 * to a human agent. Triggers can be keyword-based, sentiment-based,
 * or manual.
 *
 * @module packages/db/src/schema/chat/chat-escalation-trigger.table
 */
import {
    boolean,
    integer,
    pgTable,
    text,
    timestamp,
    uuid,
} from 'drizzle-orm/pg-core'

/**
 * Escalation trigger types
 */
export const ESCALATION_TRIGGER_TYPES = [
    'keyword', // Specific words/phrases trigger escalation
    'sentiment', // Negative sentiment triggers escalation
    'intent', // Specific intents trigger escalation
    'manual', // User requests human agent
] as const

export type EscalationTriggerType = (typeof ESCALATION_TRIGGER_TYPES)[number]

/**
 * Chat escalation trigger table for storing escalation rules
 */
export const chatEscalationTrigger = pgTable('chat_escalation_trigger', {
    id: uuid('id').primaryKey().defaultRandom(),

    /**
     * Type of trigger
     */
    triggerType: text('trigger_type').notNull(),

    /**
     * Trigger value (e.g., keyword phrase, sentiment threshold)
     */
    triggerValue: text('trigger_value').notNull(),

    /**
     * Description of this trigger for admin reference
     */
    description: text('description'),

    /**
     * Priority - higher priority triggers are checked first
     */
    priority: integer('priority').notNull().default(0),

    /**
     * Whether this trigger is active
     */
    isActive: boolean('is_active').notNull().default(true),

    /**
     * Number of times this trigger has fired
     */
    triggerCount: integer('trigger_count').notNull().default(0),

    /**
     * Timestamps
     */
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
})

export type ChatEscalationTrigger = typeof chatEscalationTrigger.$inferSelect
export type InsertChatEscalationTrigger =
    typeof chatEscalationTrigger.$inferInsert
