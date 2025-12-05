/**
 * Admin Chat API Route - Streaming AI Responses for Testing
 *
 * Handles chat message streaming for admin test interface.
 *
 * @module app/api/chat/route
 */
import { type NextRequest, NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'

import { env } from '@/env'
import { db } from '@workspace/db/client'
import { chatConfig, chatSession, chatMessage } from '@workspace/db/schema/chat'
import { eq, sql } from 'drizzle-orm'
import type { AIMessage } from '@workspace/chat/types'
import {
    sanitizeMessageContent,
    estimateTokenCount,
} from '@workspace/chat/utils'
import { DEFAULT_CHAT_CONFIG } from '@workspace/chat/constants'

/**
 * Get chat configuration
 */
async function getChatConfig() {
    const configs = await db.select().from(chatConfig).limit(1)
    if (configs.length > 0 && configs[0]) {
        return configs[0]
    }
    return {
        ...DEFAULT_CHAT_CONFIG,
        id: 'default',
        createdAt: new Date(),
        updatedAt: new Date(),
    }
}

/**
 * Get recent messages for context
 */
async function getRecentMessages(sessionId: string, limit: number = 20) {
    const messages = await db
        .select()
        .from(chatMessage)
        .where(eq(chatMessage.sessionId, sessionId))
        .orderBy(chatMessage.createdAt)
        .limit(limit)

    return messages
}

/**
 * Save a chat message
 */
async function saveChatMessage(data: {
    sessionId: string
    role: string
    content: string
    tokenCount?: number
}) {
    const [message] = await db.insert(chatMessage).values(data).returning()

    await db
        .update(chatSession)
        .set({
            messageCount: sql`${chatSession.messageCount} + 1`,
            lastMessageAt: new Date(),
        })
        .where(eq(chatSession.id, data.sessionId))

    return message
}

/**
 * POST /api/chat
 */
export async function POST(request: NextRequest) {
    try {
        if (!env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'OpenAI API key not configured' },
                { status: 503 }
            )
        }

        const body = await request.json()
        const { messages, sessionId } = body as {
            messages: AIMessage[]
            sessionId: string
        }

        if (!sessionId || !messages || messages.length === 0) {
            return NextResponse.json(
                { error: 'Session ID and messages are required' },
                { status: 400 }
            )
        }

        const config = await getChatConfig()

        // Get the latest user message
        const lastMessage = messages[messages.length - 1]
        if (!lastMessage || lastMessage.role !== 'user') {
            return NextResponse.json(
                { error: 'Last message must be from user' },
                { status: 400 }
            )
        }

        // Save user message
        const sanitizedContent = sanitizeMessageContent(lastMessage.content)
        await saveChatMessage({
            sessionId,
            role: 'user',
            content: sanitizedContent,
            tokenCount: estimateTokenCount(sanitizedContent),
        })

        // Get recent messages for context
        const dbMessages = await getRecentMessages(sessionId, 20)
        const contextMessages: AIMessage[] = dbMessages.map((msg) => ({
            role: msg.role as AIMessage['role'],
            content: msg.content,
        }))

        // Stream response
        const result = streamText({
            model: openai(config.modelId),
            system: config.systemPrompt,
            messages: contextMessages,
            temperature: config.temperature,
            maxOutputTokens: config.maxTokens,
            onFinish: async ({ text }) => {
                await saveChatMessage({
                    sessionId,
                    role: 'assistant',
                    content: text,
                    tokenCount: estimateTokenCount(text),
                })
            },
        })

        return result.toTextStreamResponse()
    } catch (error) {
        console.error('Admin chat API error:', error)
        return NextResponse.json(
            { error: 'An error occurred' },
            { status: 500 }
        )
    }
}
