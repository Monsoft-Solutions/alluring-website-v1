/**
 * Chat Quick Reply Table
 *
 * Stores quick reply button options that guide user conversations.
 * Quick replies can be categorized and shown contextually based on
 * conversation stage.
 *
 * @module packages/db/src/schema/chat/chat-quick-reply.table
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
 * Quick reply categories for contextual display
 */
export const QUICK_REPLY_CATEGORIES = [
    'initial', // Show at start of conversation
    'procedures', // Procedure-related questions
    'pricing', // Pricing and financing questions
    'scheduling', // Consultation scheduling
    'general', // General questions
    'closing', // End of conversation
] as const

export type QuickReplyCategory = (typeof QUICK_REPLY_CATEGORIES)[number]

/**
 * Chat quick reply table for storing quick reply button options
 */
export const chatQuickReply = pgTable('chat_quick_reply', {
    id: uuid('id').primaryKey().defaultRandom(),

    /**
     * Display label for the button
     */
    label: text('label').notNull(),

    /**
     * Message that gets sent when the button is clicked
     */
    message: text('message').notNull(),

    /**
     * Category for contextual display
     */
    category: text('category').notNull().default('general'),

    /**
     * Sort order for display
     */
    sortOrder: integer('sort_order').notNull().default(0),

    /**
     * Whether this quick reply is active
     */
    isActive: boolean('is_active').notNull().default(true),

    /**
     * Number of times this quick reply has been clicked
     */
    clickCount: integer('click_count').notNull().default(0),

    /**
     * Timestamps
     */
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
})

export type ChatQuickReply = typeof chatQuickReply.$inferSelect
export type InsertChatQuickReply = typeof chatQuickReply.$inferInsert
