/**
 * Chat API Route - Streaming AI Responses
 *
 * Handles chat message streaming using AI SDK with GPT-4.1.
 * Saves messages to database and streams responses in real-time.
 *
 * @module app/api/chat/route
 */
import { type NextRequest, NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'

import { env } from '@/env'
import {
    getChatConfig,
    getChatSessionById,
    saveChatMessage,
    getRecentMessages,
} from '@/lib/queries/chat.query'
import type { AIMessage } from '@workspace/chat/types'
import {
    sanitizeMessageContent,
    estimateTokenCount,
} from '@workspace/chat/utils'

/**
 * POST /api/chat
 *
 * Handles chat messages and streams AI responses
 */
export async function POST(request: NextRequest) {
    try {
        // Validate OpenAI API key
        if (!env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'Chat is not configured' },
                { status: 503 }
            )
        }

        // Parse request body
        const body = await request.json()
        const { messages, sessionId } = body as {
            messages: AIMessage[]
            sessionId: string
        }

        // Validate required fields
        if (!sessionId || !messages || messages.length === 0) {
            return NextResponse.json(
                { error: 'Session ID and messages are required' },
                { status: 400 }
            )
        }

        // Verify session exists
        const session = await getChatSessionById(sessionId)
        if (!session) {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            )
        }

        // Get chat configuration
        const config = await getChatConfig()

        // Check if chat is enabled
        if (!config.isEnabled) {
            return NextResponse.json(
                { error: 'Chat is currently disabled' },
                { status: 503 }
            )
        }

        // Get the latest user message
        const lastMessage = messages[messages.length - 1]
        if (!lastMessage || lastMessage.role !== 'user') {
            return NextResponse.json(
                { error: 'Last message must be from user' },
                { status: 400 }
            )
        }

        // Save user message to database
        const sanitizedContent = sanitizeMessageContent(lastMessage.content)
        await saveChatMessage({
            sessionId,
            role: 'user',
            content: sanitizedContent,
            tokenCount: estimateTokenCount(sanitizedContent),
        })

        // Get recent messages from DB for context (to prevent manipulation)
        const dbMessages = await getRecentMessages(sessionId, 20)
        const contextMessages: AIMessage[] = dbMessages.map((msg) => ({
            role: msg.role as AIMessage['role'],
            content: msg.content,
        }))

        // Stream the AI response
        const result = streamText({
            model: openai(config.modelId),
            system: config.systemPrompt,
            messages: contextMessages,
            temperature: config.temperature,
            maxOutputTokens: config.maxTokens,
            onFinish: async ({ text }) => {
                // Save assistant message to database
                await saveChatMessage({
                    sessionId,
                    role: 'assistant',
                    content: text,
                    tokenCount: estimateTokenCount(text),
                })
            },
        })

        // Return streaming response
        return result.toTextStreamResponse()
    } catch (error) {
        console.error('Chat API error:', error)
        return NextResponse.json(
            { error: 'An error occurred processing your message' },
            { status: 500 }
        )
    }
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS(): Promise<NextResponse> {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    })
}
