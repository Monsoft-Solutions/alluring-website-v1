/**
 * Message Formatting Utilities
 *
 * @module @workspace/chat/utils/message-formatter
 */
import type { AIMessage, MessageRole } from '../types/chat-message.type'
import { MAX_CONTEXT_MESSAGES } from '../constants/default-config.constant'

/**
 * Formats messages for AI SDK consumption
 * Ensures proper structure and limits context window
 */
export function formatMessagesForAI(
    messages: Array<{ role: string; content: string }>,
    maxMessages: number = MAX_CONTEXT_MESSAGES
): AIMessage[] {
    // Take the most recent messages up to the limit
    const recentMessages = messages.slice(-maxMessages)

    return recentMessages.map((msg) => ({
        role: msg.role as MessageRole,
        content: msg.content,
    }))
}

/**
 * Sanitizes user input for safety
 */
export function sanitizeMessageContent(content: string): string {
    if (!content || typeof content !== 'string') {
        return ''
    }
    return content
        .trim()
        .slice(0, 2000) // Enforce max length
        .replace(/\u0000/g, '') // Remove null bytes
}

/**
 * Estimates token count for a message
 * Rough approximation: ~4 characters per token
 */
export function estimateTokenCount(content: string): number {
    return Math.ceil(content.length / 4)
}

/**
 * Formats timestamp for display
 */
export function formatMessageTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).format(date)
}

/**
 * Formats relative time for session list
 */
export function formatRelativeTime(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
    }).format(date)
}

/**
 * Truncates message content for preview
 */
export function truncateMessage(
    content: string,
    maxLength: number = 100
): string {
    if (content.length <= maxLength) return content
    return content.slice(0, maxLength).trim() + '...'
}

/**
 * Validates phone number format (basic validation)
 */
export function isValidPhoneNumber(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '')
    return cleaned.length >= 10 && cleaned.length <= 15
}

/**
 * Formats phone number for display
 */
export function formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
        return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
    }
    return phone
}
