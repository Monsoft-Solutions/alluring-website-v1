/**
 * Chat Admin Queries
 *
 * Database queries for chat management in admin panel.
 *
 * @module lib/queries/chat
 */
import { db } from '@workspace/db/client'
import {
    chatConfig,
    chatSession,
    chatMessage,
    chatQuickReply,
    chatEscalationTrigger,
    type ChatConfig,
    type ChatSession,
    type ChatMessage,
    type ChatQuickReply,
    type InsertChatQuickReply,
    type InsertChatMessage,
    type ChatEscalationTrigger,
    type InsertChatEscalationTrigger,
} from '@workspace/db/schema/chat'
import { eq, desc, count, sql, and, asc } from 'drizzle-orm'

import { DEFAULT_CHAT_CONFIG } from '@workspace/chat/constants'

/**
 * Get the active chat configuration
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
 * Get chat sessions with pagination
 */
export async function getChatSessions(
    page: number = 1,
    pageSize: number = 20,
    includeTestSessions: boolean = false
): Promise<{
    sessions: ChatSession[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}> {
    const offset = (page - 1) * pageSize

    const whereClause = includeTestSessions
        ? undefined
        : eq(chatSession.isTestSession, false)

    const [sessions, totalResult] = await Promise.all([
        db
            .select()
            .from(chatSession)
            .where(whereClause)
            .orderBy(desc(chatSession.createdAt))
            .limit(pageSize)
            .offset(offset),
        db.select({ count: count() }).from(chatSession).where(whereClause),
    ])

    const total = totalResult[0]?.count ?? 0

    return {
        sessions,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
    }
}

/**
 * Get a single chat session with messages
 */
export async function getChatSessionWithMessages(sessionId: string): Promise<{
    session: ChatSession
    messages: ChatMessage[]
} | null> {
    const sessions = await db
        .select()
        .from(chatSession)
        .where(eq(chatSession.id, sessionId))
        .limit(1)

    if (!sessions[0]) {
        return null
    }

    const messages = await db
        .select()
        .from(chatMessage)
        .where(eq(chatMessage.sessionId, sessionId))
        .orderBy(chatMessage.createdAt)

    return {
        session: sessions[0],
        messages,
    }
}

/**
 * Get chat analytics
 */
export async function getChatAnalytics(): Promise<{
    totalSessions: number
    totalMessages: number
    activeSessions: number
    avgMessagesPerSession: number
    recentSessions: ChatSession[]
}> {
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const [
        totalSessionsResult,
        totalMessagesResult,
        activeSessionsResult,
        recentSessions,
    ] = await Promise.all([
        db
            .select({ count: count() })
            .from(chatSession)
            .where(eq(chatSession.isTestSession, false)),
        db.select({ count: count() }).from(chatMessage),
        db
            .select({ count: count() })
            .from(chatSession)
            .where(
                and(
                    eq(chatSession.status, 'active'),
                    eq(chatSession.isTestSession, false)
                )
            ),
        db
            .select()
            .from(chatSession)
            .where(eq(chatSession.isTestSession, false))
            .orderBy(desc(chatSession.createdAt))
            .limit(5),
    ])

    const totalSessions = totalSessionsResult[0]?.count ?? 0
    const totalMessages = totalMessagesResult[0]?.count ?? 0
    const activeSessions = activeSessionsResult[0]?.count ?? 0

    return {
        totalSessions,
        totalMessages,
        activeSessions,
        avgMessagesPerSession:
            totalSessions > 0 ? Math.round(totalMessages / totalSessions) : 0,
        recentSessions,
    }
}

/**
 * Delete a chat session and its messages
 */
export async function deleteChatSession(sessionId: string): Promise<boolean> {
    try {
        await db.delete(chatSession).where(eq(chatSession.id, sessionId))
        return true
    } catch {
        return false
    }
}

// ============================================
// Quick Reply Queries
// ============================================

/**
 * Get all quick replies
 */
export async function getQuickReplies(): Promise<ChatQuickReply[]> {
    return db
        .select()
        .from(chatQuickReply)
        .orderBy(asc(chatQuickReply.category), asc(chatQuickReply.sortOrder))
}

/**
 * Get a single quick reply by ID
 */
export async function getQuickReplyById(
    id: string
): Promise<ChatQuickReply | null> {
    const results = await db
        .select()
        .from(chatQuickReply)
        .where(eq(chatQuickReply.id, id))
        .limit(1)

    return results[0] ?? null
}

/**
 * Create a new quick reply
 */
export async function createQuickReply(
    data: InsertChatQuickReply
): Promise<ChatQuickReply> {
    const [result] = await db.insert(chatQuickReply).values(data).returning()
    return result!
}

/**
 * Update a quick reply
 */
export async function updateQuickReply(
    id: string,
    data: Partial<InsertChatQuickReply>
): Promise<ChatQuickReply | null> {
    const results = await db
        .update(chatQuickReply)
        .set(data)
        .where(eq(chatQuickReply.id, id))
        .returning()

    return results[0] ?? null
}

/**
 * Delete a quick reply
 */
export async function deleteQuickReply(id: string): Promise<boolean> {
    try {
        await db.delete(chatQuickReply).where(eq(chatQuickReply.id, id))
        return true
    } catch {
        return false
    }
}

// ============================================
// Escalation Trigger Queries
// ============================================

/**
 * Get all escalation triggers
 */
export async function getEscalationTriggers(): Promise<
    ChatEscalationTrigger[]
> {
    return db
        .select()
        .from(chatEscalationTrigger)
        .orderBy(desc(chatEscalationTrigger.priority))
}

/**
 * Get active escalation triggers
 */
export async function getActiveEscalationTriggers(): Promise<
    ChatEscalationTrigger[]
> {
    return db
        .select()
        .from(chatEscalationTrigger)
        .where(eq(chatEscalationTrigger.isActive, true))
        .orderBy(desc(chatEscalationTrigger.priority))
}

/**
 * Create a new escalation trigger
 */
export async function createEscalationTrigger(
    data: InsertChatEscalationTrigger
): Promise<ChatEscalationTrigger> {
    const [result] = await db
        .insert(chatEscalationTrigger)
        .values(data)
        .returning()
    return result!
}

/**
 * Update an escalation trigger
 */
export async function updateEscalationTrigger(
    id: string,
    data: Partial<InsertChatEscalationTrigger>
): Promise<ChatEscalationTrigger | null> {
    const results = await db
        .update(chatEscalationTrigger)
        .set(data)
        .where(eq(chatEscalationTrigger.id, id))
        .returning()

    return results[0] ?? null
}

/**
 * Delete an escalation trigger
 */
export async function deleteEscalationTrigger(id: string): Promise<boolean> {
    try {
        await db
            .delete(chatEscalationTrigger)
            .where(eq(chatEscalationTrigger.id, id))
        return true
    } catch {
        return false
    }
}

/**
 * Increment trigger count when an escalation is triggered
 */
export async function incrementTriggerCount(triggerId: string): Promise<void> {
    await db
        .update(chatEscalationTrigger)
        .set({
            triggerCount: sql`${chatEscalationTrigger.triggerCount} + 1`,
        })
        .where(eq(chatEscalationTrigger.id, triggerId))
}

// ============================================
// Session Escalation Queries
// ============================================

/**
 * Get escalated sessions
 */
export async function getEscalatedSessions(): Promise<ChatSession[]> {
    return db
        .select()
        .from(chatSession)
        .where(
            and(
                eq(chatSession.isEscalated, true),
                eq(chatSession.isTestSession, false)
            )
        )
        .orderBy(desc(chatSession.escalatedAt))
}

/**
 * Escalate a chat session
 */
export async function escalateSession(
    sessionId: string,
    reason: string
): Promise<ChatSession | null> {
    const results = await db
        .update(chatSession)
        .set({
            isEscalated: true,
            escalatedAt: new Date(),
            escalationReason: reason,
            status: 'escalated',
        })
        .where(eq(chatSession.id, sessionId))
        .returning()

    return results[0] ?? null
}

/**
 * Assign an escalated session to an admin
 */
export async function assignSession(
    sessionId: string,
    assignedTo: string
): Promise<ChatSession | null> {
    const results = await db
        .update(chatSession)
        .set({ assignedTo })
        .where(eq(chatSession.id, sessionId))
        .returning()

    return results[0] ?? null
}

/**
 * Resolve an escalated session
 */
export async function resolveEscalation(
    sessionId: string
): Promise<ChatSession | null> {
    const results = await db
        .update(chatSession)
        .set({
            isEscalated: false,
            status: 'closed',
            closedAt: new Date(),
        })
        .where(eq(chatSession.id, sessionId))
        .returning()

    return results[0] ?? null
}
