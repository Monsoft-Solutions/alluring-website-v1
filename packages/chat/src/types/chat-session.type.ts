/**
 * Chat Session Types
 *
 * @module @workspace/chat/types/chat-session
 */
import { z } from 'zod'

/**
 * Session status options
 */
export const SESSION_STATUSES = ['active', 'closed', 'archived'] as const

export type SessionStatus = (typeof SESSION_STATUSES)[number]

/**
 * Pre-chat form schema for validation
 */
export const preChatFormSchema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
    phone: z.string().min(10, 'Please enter a valid phone number').max(20),
    email: z.string().email().optional().or(z.literal('')),
})

export type PreChatFormInput = z.infer<typeof preChatFormSchema>

/**
 * Session creation request
 */
export type CreateSessionRequest = PreChatFormInput & {
    pageUrl?: string
    referrer?: string
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
    isTestSession?: boolean
}

/**
 * Chat session response for API
 */
export type ChatSessionResponse = {
    id: string
    fullName: string
    phone: string
    email?: string | null
    status: SessionStatus
    messageCount: number
    isTestSession: boolean
    pageUrl?: string | null
    lastMessageAt?: Date | null
    createdAt: Date
    updatedAt: Date
}

/**
 * Session with messages for detailed view
 */
export type ChatSessionWithMessages = ChatSessionResponse & {
    messages: Array<{
        id: string
        role: 'user' | 'assistant' | 'system'
        content: string
        createdAt: Date
    }>
}
