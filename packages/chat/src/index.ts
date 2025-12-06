/**
 * @workspace/chat
 *
 * Shared chat types, constants, and utilities for the AI chat agent.
 * This package is app-agnostic and can be used across multiple applications.
 *
 * @module @workspace/chat
 */

// Types
export {
    CHAT_MODELS,
    BUTTON_POSITIONS,
    chatConfigSchema,
    SESSION_STATUSES,
    preChatFormSchema,
    MESSAGE_ROLES,
    chatMessageSchema,
    type ChatModel,
    type ButtonPosition,
    type ChatConfigInput,
    type ChatConfigResponse,
    type SessionStatus,
    type PreChatFormInput,
    type CreateSessionRequest,
    type ChatSessionResponse,
    type ChatSessionWithMessages,
    type MessageRole,
    type ChatMessageInput,
    type ChatMessageResponse,
    type AIMessage,
    type ChatRequest,
    type StreamChunk,
} from './types'

// Constants
export {
    DEFAULT_SYSTEM_PROMPT,
    DEFAULT_WELCOME_MESSAGE,
    DEFAULT_CHAT_CONFIG,
    MAX_MESSAGE_LENGTH,
    MAX_CONTEXT_MESSAGES,
    TYPING_INDICATOR_DELAY,
} from './constants'

// Utilities
export {
    formatMessagesForAI,
    sanitizeMessageContent,
    estimateTokenCount,
    formatMessageTime,
    formatRelativeTime,
    truncateMessage,
    isValidPhoneNumber,
    formatPhoneNumber,
} from './utils'

// Services
export {
    detectIntentKeywords,
    calculateGrade,
    calculateLeadScore,
    updateLeadScoreFromMessage,
    formatLeadScore,
    getGradeColor,
    // Re-exports from @workspace/ai/schemas
    INTENT_TYPES,
    DETECTABLE_PROCEDURES,
    SESSION_TAGS,
    type IntentType,
    type DetectableProcedure,
    type SessionTag,
    type IntentClassification,
    type ClassificationMessage,
    type ScoringSignals,
    type LeadGrade,
    type LeadScoreResult,
} from './services'
