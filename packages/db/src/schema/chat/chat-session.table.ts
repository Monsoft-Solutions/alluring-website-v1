/**
 * Chat Session Table
 *
 * Stores user chat sessions with lead information collected
 * from the pre-chat form.
 *
 * @module packages/db/src/schema/chat/chat-session.table
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
 * Session status options
 */
export const SESSION_STATUSES = ['active', 'closed', 'archived'] as const

export type SessionStatus = (typeof SESSION_STATUSES)[number]

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
