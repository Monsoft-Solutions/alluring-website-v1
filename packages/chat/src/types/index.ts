/**
 * Chat Types Exports
 *
 * @module @workspace/chat/types
 */
export {
    CHAT_MODELS,
    BUTTON_POSITIONS,
    chatConfigSchema,
    type ChatModel,
    type ButtonPosition,
    type ChatConfigInput,
    type ChatConfigResponse,
} from './chat-config.type'

export {
    SESSION_STATUSES,
    preChatFormSchema,
    type SessionStatus,
    type PreChatFormInput,
    type CreateSessionRequest,
    type ChatSessionResponse,
    type ChatSessionWithMessages,
} from './chat-session.type'

export {
    MESSAGE_ROLES,
    chatMessageSchema,
    type MessageRole,
    type ChatMessageInput,
    type ChatMessageResponse,
    type AIMessage,
    type ChatRequest,
    type StreamChunk,
} from './chat-message.type'
