/**
 * Chat Database Queries
 *
 * @module lib/queries/chat
 */
import { db } from '@workspace/db/client'
import {
    chatConfig,
    chatSession,
    chatMessage,
    type ChatConfig,
    type ChatSession,
    type ChatMessage,
    type InsertChatSession,
    type InsertChatMessage,
} from '@workspace/db/schema/chat'
import { and, eq, desc, sql } from 'drizzle-orm'

import { DEFAULT_CHAT_CONFIG } from '@workspace/chat/constants'
import type { ConversationAnalysis } from '@workspace/shared/schemas/chat'

/**
 * Get the active chat configuration
 * Returns the first config or creates default if none exists
 */
export async function getChatConfig(): Promise<ChatConfig> {
    const configs = await db.select().from(chatConfig).limit(1)

    if (configs.length > 0 && configs[0]) {
        return configs[0]
    }

    // Create default configuration if none exists
    const [newConfig] = await db
        .insert(chatConfig)
        .values({
            agentName: DEFAULT_CHAT_CONFIG.agentName,
            systemPrompt: DEFAULT_CHAT_CONFIG.systemPrompt,
            welcomeMessage: DEFAULT_CHAT_CONFIG.welcomeMessage,
            modelId: DEFAULT_CHAT_CONFIG.modelId,
            temperature: DEFAULT_CHAT_CONFIG.temperature,
            maxTokens: DEFAULT_CHAT_CONFIG.maxTokens,
            isEnabled: DEFAULT_CHAT_CONFIG.isEnabled,
            buttonPosition: DEFAULT_CHAT_CONFIG.buttonPosition,
            primaryColor: DEFAULT_CHAT_CONFIG.primaryColor,
        })
        .returning()

    return newConfig!
}

/**
 * Create a new chat session
 */
export async function createChatSession(
    data: InsertChatSession
): Promise<ChatSession> {
    const [session] = await db.insert(chatSession).values(data).returning()
    return session!
}

/**
 * Get a chat session by ID
 */
export async function getChatSessionById(
    id: string
): Promise<ChatSession | null> {
    const sessions = await db
        .select()
        .from(chatSession)
        .where(eq(chatSession.id, id))
        .limit(1)

    return sessions[0] ?? null
}

/**
 * Save a chat message
 */
export async function saveChatMessage(
    data: InsertChatMessage
): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessage).values(data).returning()

    // Update session message count and last message timestamp
    await db
        .update(chatSession)
        .set({
            messageCount: sql`${chatSession.messageCount} + 1`,
            lastMessageAt: new Date(),
        })
        .where(eq(chatSession.id, data.sessionId))

    return message!
}

/**
 * Get messages for a session
 */
export async function getSessionMessages(
    sessionId: string
): Promise<ChatMessage[]> {
    return db
        .select()
        .from(chatMessage)
        .where(eq(chatMessage.sessionId, sessionId))
        .orderBy(chatMessage.createdAt)
}

/**
 * Get recent messages for context (limited for AI)
 */
export async function getRecentMessages(
    sessionId: string,
    limit: number = 20
): Promise<ChatMessage[]> {
    const messages = await db
        .select()
        .from(chatMessage)
        .where(eq(chatMessage.sessionId, sessionId))
        .orderBy(desc(chatMessage.createdAt))
        .limit(limit)

    // Reverse to get chronological order
    return messages.reverse()
}

/**
 * Close a chat session
 */
export async function closeChatSession(sessionId: string): Promise<void> {
    await db
        .update(chatSession)
        .set({
            status: 'closed',
            closedAt: new Date(),
        })
        .where(eq(chatSession.id, sessionId))
}

/**
 * Update session intent classification and lead scoring
 */
export async function updateSessionIntentAndScore(
    sessionId: string,
    data: {
        primaryIntent?: string
        intentConfidence?: string
        detectedProcedures?: string[]
        tags?: string[]
        leadScore?: number
        leadGrade?: string
        scoringSignals?: Record<string, unknown>
    }
): Promise<void> {
    await db
        .update(chatSession)
        .set({
            ...(data.primaryIntent !== undefined && {
                primaryIntent: data.primaryIntent,
            }),
            ...(data.intentConfidence !== undefined && {
                intentConfidence: data.intentConfidence,
            }),
            ...(data.detectedProcedures !== undefined && {
                detectedProcedures: data.detectedProcedures,
            }),
            ...(data.tags !== undefined && { tags: data.tags }),
            ...(data.leadScore !== undefined && { leadScore: data.leadScore }),
            ...(data.leadGrade !== undefined && { leadGrade: data.leadGrade }),
            ...(data.scoringSignals !== undefined && {
                scoringSignals: data.scoringSignals,
            }),
        })
        .where(eq(chatSession.id, sessionId))
}

/**
 * Update session with comprehensive conversation analysis
 *
 * Stores AI-extracted intelligence including lead profile,
 * psychographic data, and actionable intelligence.
 */
export async function updateSessionConversationAnalysis(
    sessionId: string,
    analysis: ConversationAnalysis,
    leadScore: number,
    leadGrade: string
): Promise<void> {
    await db
        .update(chatSession)
        .set({
            // Full analysis object
            conversationAnalysis: analysis,

            // Extracted components for easier querying
            leadProfile: analysis.leadProfile,
            psychographicData: analysis.psychographicData,
            actionableIntelligence: analysis.actionableIntelligence,
            conversationSummary: analysis.conversationSummary,

            // Indexed fields for filtering
            decisionStage: analysis.leadProfile.decisionStage,
            followUpPriority: analysis.actionableIntelligence.followUpPriority,

            // Update existing intent fields for backward compatibility
            primaryIntent: analysis.primaryIntent,
            intentConfidence: analysis.intentConfidence.toString(),
            detectedProcedures: analysis.detectedProcedures,
            tags: analysis.tags,

            // Update lead scoring
            leadScore,
            leadGrade,

            // Mark when analysis was performed
            analyzedAt: new Date(),
        })
        .where(eq(chatSession.id, sessionId))
}

/**
 * Escalate a chat session to human support
 */
export async function escalateChatSession(
    sessionId: string,
    reason: string
): Promise<void> {
    await db
        .update(chatSession)
        .set({
            isEscalated: true,
            escalatedAt: new Date(),
            escalationReason: reason,
            status: 'escalated',
        })
        .where(eq(chatSession.id, sessionId))
}

/**
 * Update suggested questions for a specific message
 */
export async function updateMessageSuggestedQuestions(
    messageId: string,
    questions: string[]
): Promise<void> {
    await db
        .update(chatMessage)
        .set({ suggestedQuestions: questions })
        .where(eq(chatMessage.id, messageId))
}

/**
 * Get suggested questions from the latest assistant message in a session
 */
export async function getLatestAssistantMessageQuestions(
    sessionId: string
): Promise<string[] | null> {
    const messages = await db
        .select({
            suggestedQuestions: chatMessage.suggestedQuestions,
            role: chatMessage.role,
        })
        .from(chatMessage)
        .where(
            and(
                eq(chatMessage.sessionId, sessionId),
                eq(chatMessage.role, 'assistant')
            )
        )
        .orderBy(desc(chatMessage.createdAt))
        .limit(1)

    const latestAssistant = messages[0]
    if (
        latestAssistant?.suggestedQuestions &&
        latestAssistant.suggestedQuestions.length > 0
    ) {
        return latestAssistant.suggestedQuestions
    }

    return null
}

/**
 * Get suggested questions for a specific message by ID
 */
export async function getMessageSuggestedQuestions(
    messageId: string
): Promise<string[] | null> {
    const messages = await db
        .select({ suggestedQuestions: chatMessage.suggestedQuestions })
        .from(chatMessage)
        .where(eq(chatMessage.id, messageId))
        .limit(1)

    return messages[0]?.suggestedQuestions ?? null
}

// ============================================
// Anonymous Session Functions
// ============================================

/**
 * Lead context for thank-you page sessions
 */
export type LeadContextInput = {
    firstName?: string
    procedure?: string
}

/**
 * Input for creating an anonymous chat session
 */
export type CreateAnonymousSessionInput = {
    pageUrl?: string
    referrer?: string
    ipAddress?: string
    userAgent?: string
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
    /** Lead context from form submission (thank-you page) */
    leadContext?: LeadContextInput
}

/**
 * Create an anonymous chat session (without pre-chat form)
 *
 * Anonymous sessions don't require name/phone upfront.
 * They can be upgraded later when the user provides contact info.
 *
 * If leadContext is provided (thank-you page), stores:
 * - procedure in detectedProcedures for AI prompt enhancement
 * - firstName in scoringSignals.leadFirstName for personalization
 */
export async function createAnonymousChatSession(
    data: CreateAnonymousSessionInput
): Promise<ChatSession> {
    // Build scoring signals with lead context if provided
    const scoringSignals = data.leadContext
        ? {
              leadFirstName: data.leadContext.firstName,
              fromFormSubmission: true,
          }
        : undefined

    // Store procedure as detected procedure for AI context
    const detectedProcedures = data.leadContext?.procedure
        ? [data.leadContext.procedure]
        : undefined

    const [session] = await db
        .insert(chatSession)
        .values({
            isAnonymous: true,
            pageUrl: data.pageUrl,
            referrer: data.referrer,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
            utmSource: data.utmSource,
            utmMedium: data.utmMedium,
            utmCampaign: data.utmCampaign,
            // Store lead context for AI prompt enhancement
            scoringSignals,
            detectedProcedures,
        })
        .returning()

    return session!
}

/**
 * Input for upgrading an anonymous session
 */
export type UpgradeSessionInput = {
    fullName: string
    phone: string
    email?: string | null
}

/**
 * Upgrade an anonymous session with contact information
 *
 * Converts an anonymous session to a lead by adding contact info.
 */
export async function upgradeChatSession(
    sessionId: string,
    data: UpgradeSessionInput
): Promise<ChatSession | null> {
    const [updated] = await db
        .update(chatSession)
        .set({
            fullName: data.fullName,
            phone: data.phone,
            email: data.email,
            isAnonymous: false,
        })
        .where(
            and(
                eq(chatSession.id, sessionId),
                eq(chatSession.isAnonymous, true)
            )
        )
        .returning()

    return updated ?? null
}
