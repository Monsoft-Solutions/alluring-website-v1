/**
 * Chat Configuration Table
 *
 * Stores AI chat agent configuration including system prompt,
 * model settings, and feature flags.
 *
 * @module packages/db/src/schema/chat/chat-config.table
 */
import {
    boolean,
    integer,
    pgTable,
    real,
    text,
    timestamp,
    uuid,
} from 'drizzle-orm/pg-core'

/**
 * Available AI models for chat
 */
export const CHAT_MODELS = [
    'gpt-4.1',
    'gpt-4.1-mini',
    'gpt-4-turbo',
    'gpt-4o',
    'gpt-4o-mini',
] as const

export type ChatModel = (typeof CHAT_MODELS)[number]

/**
 * Chat configuration table for storing agent settings
 * Only one active configuration should exist at a time
 */
export const chatConfig = pgTable('chat_config', {
    id: uuid('id').primaryKey().defaultRandom(),

    /**
     * Display name for the chat agent
     */
    agentName: text('agent_name').notNull().default('Alluring Assistant'),

    /**
     * System prompt that defines the AI's behavior and personality
     */
    systemPrompt: text('system_prompt').notNull(),

    /**
     * Welcome message shown when chat opens
     */
    welcomeMessage: text('welcome_message')
        .notNull()
        .default(
            "Hello! I'm here to help answer your questions about our procedures. How can I assist you today?"
        ),

    /**
     * AI model to use for responses
     */
    modelId: text('model_id').notNull().default('gpt-4.1'),

    /**
     * Temperature setting for response creativity (0-2)
     * Lower = more deterministic, Higher = more creative
     */
    temperature: real('temperature').notNull().default(0.7),

    /**
     * Maximum tokens for AI response
     */
    maxTokens: integer('max_tokens').notNull().default(1024),

    /**
     * Whether the chat widget is enabled on the website
     */
    isEnabled: boolean('is_enabled').notNull().default(true),

    /**
     * Position of the floating button
     */
    buttonPosition: text('button_position').notNull().default('bottom-right'),

    /**
     * Primary color for the chat widget (hex)
     */
    primaryColor: text('primary_color').notNull().default('#1c1917'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
})

export type ChatConfig = typeof chatConfig.$inferSelect
export type InsertChatConfig = typeof chatConfig.$inferInsert
