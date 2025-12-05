/**
 * Chat Message Types
 *
 * @module @workspace/chat/types/chat-message
 */
import { z } from 'zod'

/**
 * Message role types
 */
export const MESSAGE_ROLES = ['user', 'assistant', 'system'] as const

export type MessageRole = (typeof MESSAGE_ROLES)[number]

/**
 * Chat message schema for validation
 */
export const chatMessageSchema = z.object({
    role: z.enum(MESSAGE_ROLES),
    content: z.string().min(1).max(10000),
})

export type ChatMessageInput = z.infer<typeof chatMessageSchema>

/**
 * Chat message response for API
 */
export type ChatMessageResponse = {
    id: string
    sessionId: string
    role: MessageRole
    content: string
    tokenCount?: number | null
    createdAt: Date
}

/**
 * Message for AI SDK compatibility
 */
export type AIMessage = {
    role: MessageRole
    content: string
}

/**
 * Chat request payload
 */
export type ChatRequest = {
    sessionId: string
    messages: AIMessage[]
}

/**
 * Streaming response chunk
 */
export type StreamChunk = {
    type: 'text' | 'error' | 'done'
    content?: string
    error?: string
}
