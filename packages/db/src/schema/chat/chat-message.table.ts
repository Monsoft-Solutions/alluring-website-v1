/**
 * Chat Message Table
 *
 * Stores individual messages within chat sessions.
 *
 * @module packages/db/src/schema/chat/chat-message.table
 */
import {
    integer,
    jsonb,
    pgTable,
    text,
    timestamp,
    uuid,
} from 'drizzle-orm/pg-core'

import { chatSession } from './chat-session.table'

/**
 * Message role types
 */
export const MESSAGE_ROLES = ['user', 'assistant', 'system'] as const

export type MessageRole = (typeof MESSAGE_ROLES)[number]

/**
 * Chat message table for storing conversation messages
 */
export const chatMessage = pgTable('chat_message', {
    id: uuid('id').primaryKey().defaultRandom(),

    /**
     * Reference to the parent session
     */
    sessionId: uuid('session_id')
        .notNull()
        .references(() => chatSession.id, { onDelete: 'cascade' }),

    /**
     * Message role (user, assistant, or system)
     */
    role: text('role').notNull(),

    /**
     * Message content
     */
    content: text('content').notNull(),

    /**
     * Token count for the message (for analytics/billing)
     */
    tokenCount: integer('token_count'),

    /**
     * AI-generated suggested follow-up questions
     * Only populated for assistant messages after AI generation
     */
    suggestedQuestions: jsonb('suggested_questions').$type<string[]>(),

    /**
     * Timestamp when the message was created
     */
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type ChatMessage = typeof chatMessage.$inferSelect
export type InsertChatMessage = typeof chatMessage.$inferInsert
