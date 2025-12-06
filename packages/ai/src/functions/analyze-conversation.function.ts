/**
 * Conversation Analysis Function
 *
 * AI-powered comprehensive conversation analysis.
 * Extracts lead profile, psychographic data, and actionable intelligence.
 * Uses AI SDK generateObject() for type-safe structured output.
 *
 * @module @workspace/ai/functions/analyze-conversation
 */
import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'

import {
    conversationAnalysisSchema,
    DEFAULT_CONVERSATION_ANALYSIS,
    type ConversationAnalysis,
    type AnalysisMessage,
} from '../schemas/conversation-analysis.schema'
import {
    CONVERSATION_ANALYSIS_SYSTEM_PROMPT,
    getConversationAnalysisPrompt,
} from '../prompts/chat/conversation-analysis.prompt'
import { DEFAULT_CLASSIFICATION_MODEL_ID } from '../models/available-models.constant'

/**
 * Options for conversation analysis
 */
export type AnalyzeConversationOptions = {
    /** Model ID to use (defaults to gpt-4o-mini) */
    modelId?: string
    /** Temperature for generation (defaults to 0.3 for consistent results) */
    temperature?: number
    /** Minimum messages required for analysis (defaults to 2) */
    minMessages?: number
}

/**
 * Analyze a conversation using AI
 *
 * Uses generateObject() with a comprehensive Zod schema for type-safe
 * structured output from the LLM. Works with conversations in any language.
 *
 * @param messages - The conversation messages to analyze
 * @param options - Optional configuration
 * @returns Comprehensive conversation analysis result
 *
 * @example
 * ```typescript
 * const analysis = await analyzeConversation([
 *   { role: 'user', content: 'How much does a BBL cost?' },
 *   { role: 'assistant', content: 'BBL pricing varies based on...' },
 *   { role: 'user', content: 'I want to schedule a consultation' },
 * ])
 *
 * console.log(analysis.primaryIntent) // 'consultation_request'
 * console.log(analysis.leadProfile.decisionStage) // 'ready_to_book'
 * console.log(analysis.actionableIntelligence.recommendedAction) // 'call_immediately'
 * console.log(analysis.conversationSummary) // 'Lead is interested in BBL...'
 * ```
 */
export async function analyzeConversation(
    messages: AnalysisMessage[],
    options: AnalyzeConversationOptions = {}
): Promise<ConversationAnalysis> {
    const {
        modelId = DEFAULT_CLASSIFICATION_MODEL_ID,
        temperature = 0.3,
        minMessages = 2,
    } = options

    // Need at least minMessages to analyze meaningfully
    if (messages.length < minMessages) {
        return DEFAULT_CONVERSATION_ANALYSIS
    }

    try {
        const result = await generateObject({
            model: openai(modelId),
            schema: conversationAnalysisSchema,
            system: CONVERSATION_ANALYSIS_SYSTEM_PROMPT,
            prompt: getConversationAnalysisPrompt(messages),
            temperature,
        })

        return result.object
    } catch (error) {
        console.error('Conversation analysis error:', error)
        return DEFAULT_CONVERSATION_ANALYSIS
    }
}

/**
 * Calculate lead score from conversation analysis
 *
 * Uses the AI-extracted signals to calculate a lead score.
 * This replaces the keyword-based scoring approach.
 *
 * @param analysis - The conversation analysis result
 * @param additionalSignals - Additional signals not in the analysis
 * @returns Lead score (0-100) and grade
 */
export function calculateLeadScoreFromAnalysis(
    analysis: ConversationAnalysis,
    additionalSignals: {
        hasEmail?: boolean
        messageCount?: number
        sessionDurationMinutes?: number
        returningVisitor?: boolean
        isEscalated?: boolean
    } = {}
): { score: number; grade: 'A' | 'B' | 'C' | 'D' } {
    let score = 10 // Base score (phone is required)

    // Email provided
    if (additionalSignals.hasEmail) {
        score += 15
    }

    // Message engagement
    if (additionalSignals.messageCount && additionalSignals.messageCount >= 5) {
        score += 10
    }
    if (
        additionalSignals.messageCount &&
        additionalSignals.messageCount >= 10
    ) {
        score += 5
    }

    // Session duration
    if (
        additionalSignals.sessionDurationMinutes &&
        additionalSignals.sessionDurationMinutes >= 5
    ) {
        score += 10
    }
    if (
        additionalSignals.sessionDurationMinutes &&
        additionalSignals.sessionDurationMinutes >= 10
    ) {
        score += 5
    }

    // Returning visitor
    if (additionalSignals.returningVisitor) {
        score += 15
    }

    // Intent-based scoring
    switch (analysis.primaryIntent) {
        case 'consultation_request':
            score += 30
            break
        case 'pricing_inquiry':
            score += 20
            break
        case 'financing_inquiry':
            score += 15
            break
        case 'complaint':
            score -= 15
            break
    }

    // Procedure detection
    if (analysis.detectedProcedures.length > 0) {
        score += 15
    }
    if (analysis.detectedProcedures.length > 1) {
        score += 10
    }

    // Decision stage scoring
    switch (analysis.leadProfile.decisionStage) {
        case 'ready_to_book':
            score += 25
            break
        case 'comparing':
            score += 10
            break
        case 'researching':
            score -= 5
            break
    }

    // Timeline scoring
    switch (analysis.leadProfile.timeline) {
        case 'within_week':
            score += 20
            break
        case 'within_month':
            score += 15
            break
        case 'within_3_months':
            score += 10
            break
    }

    // Budget indicator scoring
    switch (analysis.leadProfile.budgetIndicator) {
        case 'premium':
            score += 15
            break
        case 'high':
            score += 10
            break
        case 'low':
            score -= 5
            break
    }

    // Tag-based scoring
    if (analysis.tags.includes('hot_lead')) {
        score += 20
    }
    if (analysis.tags.includes('ready_to_book')) {
        score += 25
    }
    if (analysis.tags.includes('urgent')) {
        score += 10
    }
    if (analysis.tags.includes('research_phase')) {
        score -= 5
    }

    // Sentiment scoring
    switch (analysis.psychographicData.sentiment) {
        case 'positive':
            score += 10
            break
        case 'negative':
            score -= 10
            break
    }

    // Follow-up priority bonus
    switch (analysis.actionableIntelligence.followUpPriority) {
        case 'urgent':
            score += 15
            break
        case 'high':
            score += 10
            break
    }

    // Escalation bonus
    if (additionalSignals.isEscalated) {
        score += 5
    }

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score))

    // Calculate grade
    let grade: 'A' | 'B' | 'C' | 'D'
    if (score >= 70) {
        grade = 'A'
    } else if (score >= 50) {
        grade = 'B'
    } else if (score >= 30) {
        grade = 'C'
    } else {
        grade = 'D'
    }

    return { score, grade }
}
