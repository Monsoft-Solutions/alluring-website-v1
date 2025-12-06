/**
 * Chat Types
 *
 * Centralized type definitions for the chat system.
 *
 * @module lib/chat/types
 */

/**
 * Message stored in the database
 */
export type StoredMessage = {
    id: string
    role: 'user' | 'assistant'
    content: string
    createdAt: string
}

/**
 * AI SDK v5 message format with parts
 */
export type AISDKMessage = {
    id: string
    role: 'user' | 'assistant' | 'system'
    parts: Array<{ type: 'text'; text: string }>
}

/**
 * Chat configuration from server
 */
export type ChatConfig = {
    isEnabled: boolean
    agentName: string
    welcomeMessage: string
    buttonPosition: 'bottom-right' | 'bottom-left'
    primaryColor: string
}

/**
 * Session data for chat
 */
export type ChatSessionData = {
    id: string
    fullName: string
    config: ChatConfig
    messages?: StoredMessage[]
}

/**
 * Props for the main chat interface component
 */
export type ChatInterfaceProps = {
    /** Chat session ID */
    sessionId: string
    /** Agent/assistant name */
    agentName: string
    /** Welcome message shown at conversation start */
    welcomeMessage: string
    /** User's display name (first name) */
    userName: string
    /** Previously stored messages to restore */
    initialMessages?: StoredMessage[]
    /** Callback when chat is reset */
    onReset?: () => void
}

/**
 * Chat message for display
 */
export type ChatMessageData = {
    id: string
    role: 'user' | 'assistant'
    content: string
    createdAt?: Date
    isStreaming?: boolean
}

/**
 * Quick reply button data
 */
export type QuickReplyData = {
    id: string
    label: string
    message: string
    category: string
}

/**
 * Chat widget state
 */
export type ChatWidgetState = 'loading' | 'pre-chat' | 'chatting' | 'error'

/**
 * Animation variants for chat components
 */
export type ChatAnimationVariant = 'fade' | 'slide' | 'scale' | 'none'

/**
 * Position variants for floating elements
 */
export type ChatPosition = 'bottom-right' | 'bottom-left' | 'bottom-center'
