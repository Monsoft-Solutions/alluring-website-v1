/**
 * Chat API Route - Streaming AI Responses
 *
 * Handles chat message streaming using AI SDK with GPT-4.1.
 * Saves messages to database and streams responses in real-time.
 * Includes comprehensive AI conversation analysis and lead scoring.
 *
 * @module app/api/chat/route
 */
import { type NextRequest, NextResponse } from 'next/server'
import {
    openai,
    streamText,
    smoothStream,
    generateQuickQuestions,
    analyzeConversation,
    calculateLeadScoreFromAnalysis,
} from '@workspace/ai'
import type { AnalysisMessage } from '@workspace/ai/schemas'

import { env } from '@/env'
import {
    getChatConfig,
    getChatSessionById,
    saveChatMessage,
    getRecentMessages,
    updateMessageSuggestedQuestions,
    updateSessionConversationAnalysis,
} from '@/lib/queries/chat.query'
import type { AIMessage } from '@workspace/chat/types'
import {
    sanitizeMessageContent,
    estimateTokenCount,
} from '@workspace/chat/utils'

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

        // Get recent messages from DB for context (to prevent manipulation)
        const dbMessages = await getRecentMessages(sessionId, 20)
        const contextMessages: AIMessage[] = dbMessages.map((msg) => ({
            role: msg.role as AIMessage['role'],
            content: msg.content,
        }))

        // Get detected procedures for quick questions context
        const detectedProcedures =
            (session.detectedProcedures as string[]) ?? []

        // Stream the AI response
        const result = streamText({
            model: openai(config.modelId),
            system: config.systemPrompt,
            messages: contextMessages,
            temperature: config.temperature,
            maxOutputTokens: config.maxTokens,
            experimental_transform: smoothStream({ chunking: 'word' }),
            onFinish: async ({ text }) => {
                // Save assistant message to database and get the message ID
                const savedMessage = await saveChatMessage({
                    sessionId,
                    role: 'assistant',
                    content: text,
                    tokenCount: estimateTokenCount(text),
                })

                // Run comprehensive AI conversation analysis after enough messages
                // (async, doesn't block response)
                const totalMessages = dbMessages.length + 2 // +2 for user msg and assistant response
                if (totalMessages >= 4) {
                    analyzeConversationAsync(
                        sessionId,
                        [...dbMessages, { role: 'assistant', content: text }],
                        {
                            hasEmail: !!session.email,
                            messageCount: totalMessages,
                            returningVisitor: false, // Could be enhanced with visitor tracking
                            isEscalated: session.isEscalated,
                        }
                    )
                }

                // Generate contextual quick questions (async, doesn't block response)
                generateQuickQuestionsAsync(
                    savedMessage.id,
                    contextMessages,
                    text,
                    detectedProcedures
                )
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
 * Run comprehensive AI conversation analysis asynchronously
 * This doesn't block the chat response
 *
 * Replaces the keyword-based intent detection with AI-powered analysis
 * that extracts lead profile, psychographic data, and actionable intelligence.
 * Works with conversations in any language.
 */
async function analyzeConversationAsync(
    sessionId: string,
    messages: Array<{ role: string; content: string }>,
    additionalSignals: {
        hasEmail?: boolean
        messageCount?: number
        sessionDurationMinutes?: number
        returningVisitor?: boolean
        isEscalated?: boolean
    }
): Promise<void> {
    try {
        console.log(
            `[ConversationAnalysis] Analyzing session ${sessionId}, ${messages.length} messages`
        )

        // Filter to user/assistant messages and format for analysis
        const analysisMessages: AnalysisMessage[] = messages
            .filter((m) => m.role === 'user' || m.role === 'assistant')
            .map((m) => ({
                role: m.role as 'user' | 'assistant',
                content: m.content,
            }))

        // Run comprehensive AI analysis
        const analysis = await analyzeConversation(analysisMessages)

        if (analysis.primaryIntent !== 'unknown') {
            // Calculate lead score from analysis
            const { score, grade } = calculateLeadScoreFromAnalysis(
                analysis,
                additionalSignals
            )

            // Save complete analysis to database
            await updateSessionConversationAnalysis(
                sessionId,
                analysis,
                score,
                grade
            )

            console.log(
                `[ConversationAnalysis] Session ${sessionId} analyzed:`,
                {
                    intent: analysis.primaryIntent,
                    decisionStage: analysis.leadProfile.decisionStage,
                    followUpPriority:
                        analysis.actionableIntelligence.followUpPriority,
                    score,
                    grade,
                }
            )
        } else {
            console.log(
                `[ConversationAnalysis] Session ${sessionId}: Unknown intent, skipping update`
            )
        }
    } catch (error) {
        console.error('[ConversationAnalysis] Analysis failed:', error)
        // Non-blocking, just log the error
    }
}

/**
 * Generate contextual quick questions asynchronously
 * This doesn't block the chat response
 */
async function generateQuickQuestionsAsync(
    messageId: string,
    messages: AIMessage[],
    lastResponse: string,
    detectedProcedures: string[]
): Promise<void> {
    try {
        console.log(
            `[QuickQuestions] Generating for message ${messageId}, ${messages.length} context messages`
        )

        const questions = await generateQuickQuestions({
            messages: messages.map((m) => ({
                role: m.role as 'user' | 'assistant',
                content: m.content,
            })),
            lastResponse,
            detectedProcedures:
                detectedProcedures.length > 0 ? detectedProcedures : undefined,
        })

        console.log(
            `[QuickQuestions] Generated ${questions.length} questions:`,
            questions
        )

        // Only update if we got questions
        if (questions.length > 0) {
            await updateMessageSuggestedQuestions(messageId, questions)
            console.log(
                `[QuickQuestions] Saved questions to message ${messageId}`
            )
        } else {
            console.log(
                `[QuickQuestions] No questions generated, skipping save`
            )
        }
    } catch (error) {
        console.error('[QuickQuestions] Generation failed:', error)
        // Non-blocking, just log the error
    }
}
