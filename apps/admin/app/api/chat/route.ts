/**
 * Admin Chat API Route - Streaming AI Responses for Testing
 *
 * Handles chat message streaming for admin test interface.
 *
 * @module app/api/chat/route
 */
import { type NextRequest, NextResponse } from 'next/server'
import { openai, streamText } from '@workspace/ai'

import { env } from '@/env'
import {
    sanitizeMessageContent,
    estimateTokenCount,
} from '@workspace/chat/utils'
import {
    getChatConfig,
    getRecentMessages,
    saveChatMessage,
} from '@/lib/queries/chat.query'
import { isAuthenticated } from '@/lib/utils/auth.util'

/**
 * AI SDK v5 message format (uses parts instead of content)
 */
type AISDKMessage = {
    role: 'user' | 'assistant' | 'system'
    content?: string
    parts?: Array<{ type: 'text'; text: string }>
}

/**
 * Extract text content from AI SDK message (supports both v4 and v5 formats)
 */
function extractMessageContent(message: AISDKMessage): string {
    // AI SDK v5 format: parts array
    if (message.parts && Array.isArray(message.parts)) {
        return message.parts
            .filter((part) => part.type === 'text')
            .map((part) => part.text)
            .join('')
    }
    // AI SDK v4 format: direct content string
    if (typeof message.content === 'string') {
        return message.content
    }
    return ''
}

/**
 * POST /api/chat
 */
export async function POST(request: NextRequest) {
    try {
        const authenticated = await isAuthenticated()
        if (!authenticated) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (!env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'OpenAI API key not configured' },
                { status: 503 }
            )
        }

        const body = await request.json()
        const { messages, sessionId } = body as {
            messages: AISDKMessage[]
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

        // Extract message content (supports AI SDK v4 and v5 formats)
        const messageContent = extractMessageContent(lastMessage)
        if (!messageContent) {
            return NextResponse.json(
                { error: 'Message content is required' },
                { status: 400 }
            )
        }

        // Save user message
        const sanitizedContent = sanitizeMessageContent(messageContent)
        await saveChatMessage({
            sessionId,
            role: 'user',
            content: sanitizedContent,
            tokenCount: estimateTokenCount(sanitizedContent),
        })

        // Get recent messages for context
        const dbMessages = await getRecentMessages(sessionId, 20)
        const contextMessages = dbMessages.map((msg) => ({
            role: msg.role as 'user' | 'assistant' | 'system',
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
