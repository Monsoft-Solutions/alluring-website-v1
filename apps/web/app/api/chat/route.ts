/**
 * Chat API Route - Streaming AI Responses
 *
 * Handles chat message streaming using AI SDK with GPT-4.1.
 * Saves messages to database and streams responses in real-time.
 * Includes intent classification and lead scoring.
 *
 * @module app/api/chat/route
 */
import { type NextRequest, NextResponse } from 'next/server'
import { openai, streamText, smoothStream, classifyIntent } from '@workspace/ai'
import type { ClassificationMessage } from '@workspace/ai/schemas'

import { env } from '@/env'
import {
    getChatConfig,
    getChatSessionById,
    saveChatMessage,
    getRecentMessages,
    updateSessionIntentAndScore,
} from '@/lib/queries/chat.query'
import type { AIMessage } from '@workspace/chat/types'
import {
    sanitizeMessageContent,
    estimateTokenCount,
} from '@workspace/chat/utils'
import {
    detectIntentKeywords,
    updateLeadScoreFromMessage,
    type ScoringSignals,
} from '@workspace/chat/services'

/**
 * AI SDK v5 message format with parts
 */
type AISDKMessage = {
    role: 'user' | 'assistant' | 'system'
    content?: string
    parts?: Array<{ type: 'text'; text: string }>
}

/**
 * Extract text content from AI SDK message (handles both v4 content and v5 parts format)
 */
function extractMessageContent(message: AISDKMessage): string {
    // Handle v5 parts format
    if (message.parts && Array.isArray(message.parts)) {
        return message.parts
            .filter((part) => part.type === 'text')
            .map((part) => part.text)
            .join('')
    }
    // Handle v4 content format
    if (typeof message.content === 'string') {
        return message.content
    }
    return ''
}

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
            messages: AISDKMessage[]
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
        const messageContent = extractMessageContent(lastMessage)
        if (!messageContent) {
            return NextResponse.json(
                { error: 'Message content is required' },
                { status: 400 }
            )
        }
        const sanitizedContent = sanitizeMessageContent(messageContent)
        await saveChatMessage({
            sessionId,
            role: 'user',
            content: sanitizedContent,
            tokenCount: estimateTokenCount(sanitizedContent),
        })

        // Update lead score incrementally from user message
        const currentSignals = (session.scoringSignals as ScoringSignals) ?? {}
        const updatedScore = updateLeadScoreFromMessage(
            session.leadScore ?? 0,
            currentSignals,
            sanitizedContent,
            true // isUserMessage
        )

        // Quick keyword-based intent detection for immediate updates
        const keywordIntent = detectIntentKeywords(sanitizedContent)

        // Update session with new score and any detected intents
        await updateSessionIntentAndScore(sessionId, {
            leadScore: updatedScore.score,
            leadGrade: updatedScore.grade,
            scoringSignals: updatedScore.signals,
            // Only update intent if we detected something and don't have one yet
            ...(keywordIntent.primaryIntent && !session.primaryIntent
                ? { primaryIntent: keywordIntent.primaryIntent }
                : {}),
            // Merge detected procedures
            ...(keywordIntent.detectedProcedures &&
            keywordIntent.detectedProcedures.length > 0
                ? {
                      detectedProcedures: [
                          ...new Set([
                              ...((session.detectedProcedures as string[]) ??
                                  []),
                              ...keywordIntent.detectedProcedures,
                          ]),
                      ],
                  }
                : {}),
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
            experimental_transform: smoothStream({ chunking: 'word' }),
            onFinish: async ({ text }) => {
                // Save assistant message to database
                await saveChatMessage({
                    sessionId,
                    role: 'assistant',
                    content: text,
                    tokenCount: estimateTokenCount(text),
                })

                // Run full AI intent classification after enough messages
                // (async, doesn't block response)
                const totalMessages = dbMessages.length + 2 // +2 for user msg and assistant response
                if (totalMessages >= 4 && !session.primaryIntent) {
                    classifyIntentAsync(sessionId, [
                        ...dbMessages,
                        { role: 'assistant', content: text },
                    ])
                }
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

/**
 * Run full AI intent classification asynchronously
 * This doesn't block the chat response
 */
async function classifyIntentAsync(
    sessionId: string,
    messages: Array<{ role: string; content: string }>
): Promise<void> {
    try {
        const classificationMessages: ClassificationMessage[] = messages
            .filter((m) => m.role === 'user' || m.role === 'assistant')
            .map((m) => ({
                role: m.role as 'user' | 'assistant',
                content: m.content,
            }))

        const classification = await classifyIntent(classificationMessages)

        if (classification.primaryIntent !== 'unknown') {
            await updateSessionIntentAndScore(sessionId, {
                primaryIntent: classification.primaryIntent,
                intentConfidence: classification.intentConfidence.toString(),
                detectedProcedures: classification.detectedProcedures,
                tags: classification.tags,
            })
        }
    } catch (error) {
        console.error('Async intent classification failed:', error)
        // Non-blocking, just log the error
    }
}
