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
    type ChatConfig,
    type ChatSession,
    type ChatMessage,
} from '@workspace/db/schema/chat'
import { eq, desc, count, sql, and, gte, ne } from 'drizzle-orm'

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
