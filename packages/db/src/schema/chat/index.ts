/**
 * Chat Schema Exports
 *
 * @module packages/db/src/schema/chat
 */
export {
    CHAT_MODELS,
    chatConfig,
    type ChatModel,
    type ChatConfig,
    type InsertChatConfig,
} from './chat-config.table'

export {
    SESSION_STATUSES,
    CHAT_INTENTS,
    LEAD_GRADES,
    chatSession,
    type SessionStatus,
    type ChatIntent,
    type LeadGrade,
    type ScoringSignals,
    type DbLeadProfile,
    type DbPsychographicData,
    type DbContactPreference,
    type DbActionableIntelligence,
    type DbConversationAnalysis,
    type ChatSession,
    type InsertChatSession,
} from './chat-session.table'

export {
    MESSAGE_ROLES,
    chatMessage,
    type MessageRole,
    type ChatMessage,
    type InsertChatMessage,
} from './chat-message.table'

export {
    QUICK_REPLY_CATEGORIES,
    chatQuickReply,
    type QuickReplyCategory,
    type ChatQuickReply,
    type InsertChatQuickReply,
} from './chat-quick-reply.table'

export {
    ESCALATION_TRIGGER_TYPES,
    chatEscalationTrigger,
    type EscalationTriggerType,
    type ChatEscalationTrigger,
    type InsertChatEscalationTrigger,
} from './chat-escalation-trigger.table'
