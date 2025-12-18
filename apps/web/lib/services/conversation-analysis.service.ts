/**
 * Conversation Analysis Service
 *
 * Handles asynchronous AI-powered conversation analysis.
 * Extracted from the chat API route for better code organization.
 *
 * @module lib/services/conversation-analysis
 */
import {
    analyzeConversation,
    calculateLeadScoreFromAnalysis,
} from '@workspace/ai'
import type { AnalysisMessage } from '@workspace/shared/schemas/chat'

import {
    getChatSessionById,
    updateSessionConversationAnalysis,
    upgradeChatSession,
} from '@/lib/queries/chat.query'

/**
 * Additional signals for lead scoring that aren't in the conversation
 */
export type AdditionalScoringSignals = {
    hasEmail?: boolean
    messageCount?: number
    sessionDurationMinutes?: number
    returningVisitor?: boolean
    isEscalated?: boolean
}

/**
 * Run comprehensive AI conversation analysis asynchronously
 *
 * This function should be called after streaming completes.
 * It doesn't block the chat response.
 *
 * Replaces keyword-based intent detection with AI-powered analysis
 * that extracts lead profile, psychographic data, and actionable intelligence.
 * Works with conversations in any language.
 *
 * @param sessionId - The chat session ID
 * @param messages - Array of conversation messages
 * @param additionalSignals - Extra signals for lead scoring
 */
export async function analyzeConversationAsync(
    sessionId: string,
    messages: Array<{ role: string; content: string }>,
    additionalSignals: AdditionalScoringSignals
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
                    extractedContact: analysis.extractedContact,
                }
            )

            // Auto-upgrade session if contact information was extracted
            await tryAutoUpgradeSession(sessionId, analysis.extractedContact)
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
 * Attempt to upgrade an anonymous session with extracted contact info
 *
 * @param sessionId - The chat session ID
 * @param extractedContact - Contact info extracted from conversation
 */
async function tryAutoUpgradeSession(
    sessionId: string,
    extractedContact: {
        fullName?: string
        phone?: string
        email?: string
    }
): Promise<void> {
    if (
        !extractedContact.phone ||
        !extractedContact.fullName ||
        extractedContact.phone.length < 10
    ) {
        return
    }

    try {
        // Get current session to check if it's still anonymous
        const currentSession = await getChatSessionById(sessionId)

        if (currentSession?.isAnonymous) {
            await upgradeChatSession(sessionId, {
                fullName: extractedContact.fullName,
                phone: extractedContact.phone,
                email: extractedContact.email || null,
            })

            console.log(
                `[ConversationAnalysis] Auto-upgraded session ${sessionId} with extracted contact info:`,
                {
                    fullName: extractedContact.fullName,
                    phone: extractedContact.phone,
                    email: extractedContact.email,
                }
            )
        }
    } catch (upgradeError) {
        console.error(
            `[ConversationAnalysis] Failed to auto-upgrade session ${sessionId}:`,
            upgradeError
        )
        // Non-blocking, continue even if upgrade fails
    }
}
