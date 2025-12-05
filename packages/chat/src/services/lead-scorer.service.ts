/**
 * Lead Scorer Service
 *
 * Calculates lead scores based on conversation signals and engagement.
 * Higher scores indicate more qualified leads.
 *
 * @module @workspace/chat/services/lead-scorer
 */

import type {
    IntentType,
    SessionTag,
    DetectableProcedure,
} from './intent-classifier.service'

/**
 * Scoring signals tracked for lead scoring
 */
export type ScoringSignals = {
    hasEmail?: boolean
    askedPricing?: boolean
    askedConsultation?: boolean
    mentionedProcedure?: string
    messageCount?: number
    sessionDuration?: number
    returningVisitor?: boolean
    exitIntent?: boolean
    isEscalated?: boolean
}

/**
 * Lead grade based on score
 */
export type LeadGrade = 'A' | 'B' | 'C' | 'D'

/**
 * Lead score result
 */
export type LeadScoreResult = {
    score: number
    grade: LeadGrade
    signals: ScoringSignals
}

/**
 * Scoring weights for different signals
 */
const SCORING_WEIGHTS = {
    // Lead capture signals
    hasEmail: 15,
    hasPhone: 10, // Already required, so base points

    // Intent signals
    askedPricing: 20,
    askedConsultation: 30,
    askedFinancing: 15,
    mentionedProcedure: 15,
    multipleProcedures: 10,

    // Engagement signals
    messageCount5Plus: 10,
    messageCount10Plus: 5, // Additional
    sessionDuration5Min: 10,
    sessionDuration10Min: 5, // Additional

    // Qualification signals
    returningVisitor: 15,
    readyToBook: 25,
    hotLead: 20,
    urgent: 10,

    // Negative signals
    exitIntent: -10,
    researchPhase: -5,
    complaint: -15,
}

/**
 * Grade thresholds
 */
const GRADE_THRESHOLDS = {
    A: 70,
    B: 50,
    C: 30,
    D: 0,
}

/**
 * Calculate lead grade from score
 */
export function calculateGrade(score: number): LeadGrade {
    if (score >= GRADE_THRESHOLDS.A) return 'A'
    if (score >= GRADE_THRESHOLDS.B) return 'B'
    if (score >= GRADE_THRESHOLDS.C) return 'C'
    return 'D'
}

/**
 * Calculate lead score from conversation data
 */
export function calculateLeadScore(params: {
    hasEmail: boolean
    messageCount: number
    sessionDurationMinutes?: number
    primaryIntent?: IntentType
    tags?: SessionTag[]
    detectedProcedures?: DetectableProcedure[]
    returningVisitor?: boolean
    isEscalated?: boolean
}): LeadScoreResult {
    let score = 0
    const signals: ScoringSignals = {}

    // Base score - everyone starts at 10 (they provided phone)
    score += 10

    // Email provided
    if (params.hasEmail) {
        score += SCORING_WEIGHTS.hasEmail
        signals.hasEmail = true
    }

    // Message count engagement
    if (params.messageCount >= 5) {
        score += SCORING_WEIGHTS.messageCount5Plus
        signals.messageCount = params.messageCount
    }
    if (params.messageCount >= 10) {
        score += SCORING_WEIGHTS.messageCount10Plus
    }

    // Session duration
    if (params.sessionDurationMinutes && params.sessionDurationMinutes >= 5) {
        score += SCORING_WEIGHTS.sessionDuration5Min
        signals.sessionDuration = params.sessionDurationMinutes
    }
    if (params.sessionDurationMinutes && params.sessionDurationMinutes >= 10) {
        score += SCORING_WEIGHTS.sessionDuration10Min
    }

    // Returning visitor
    if (params.returningVisitor) {
        score += SCORING_WEIGHTS.returningVisitor
        signals.returningVisitor = true
    }

    // Intent-based scoring
    if (params.primaryIntent) {
        switch (params.primaryIntent) {
            case 'consultation_request':
                score += SCORING_WEIGHTS.askedConsultation
                signals.askedConsultation = true
                break
            case 'pricing_inquiry':
                score += SCORING_WEIGHTS.askedPricing
                signals.askedPricing = true
                break
            case 'financing_inquiry':
                score += SCORING_WEIGHTS.askedFinancing
                signals.askedPricing = true
                break
            case 'complaint':
                score += SCORING_WEIGHTS.complaint
                break
        }
    }

    // Procedure detection
    if (params.detectedProcedures && params.detectedProcedures.length > 0) {
        score += SCORING_WEIGHTS.mentionedProcedure
        signals.mentionedProcedure = params.detectedProcedures[0]

        if (params.detectedProcedures.length > 1) {
            score += SCORING_WEIGHTS.multipleProcedures
        }
    }

    // Tag-based scoring
    if (params.tags) {
        if (params.tags.includes('hot_lead')) {
            score += SCORING_WEIGHTS.hotLead
        }
        if (params.tags.includes('ready_to_book')) {
            score += SCORING_WEIGHTS.readyToBook
        }
        if (params.tags.includes('urgent')) {
            score += SCORING_WEIGHTS.urgent
        }
        if (params.tags.includes('research_phase')) {
            score += SCORING_WEIGHTS.researchPhase
        }
    }

    // Escalation bonus (engaged enough to request human)
    if (params.isEscalated) {
        score += 5
        signals.isEscalated = true
    }

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score))

    return {
        score,
        grade: calculateGrade(score),
        signals,
    }
}

/**
 * Update lead score incrementally based on new message
 */
export function updateLeadScoreFromMessage(
    currentScore: number,
    currentSignals: ScoringSignals,
    messageContent: string,
    isUserMessage: boolean
): LeadScoreResult {
    let score = currentScore
    const signals = { ...currentSignals }
    const lowerContent = messageContent.toLowerCase()

    // Only score user messages
    if (!isUserMessage) {
        return { score, grade: calculateGrade(score), signals }
    }

    // Check for pricing keywords
    if (
        !signals.askedPricing &&
        (lowerContent.includes('price') ||
            lowerContent.includes('cost') ||
            lowerContent.includes('how much') ||
            lowerContent.includes('afford'))
    ) {
        score += SCORING_WEIGHTS.askedPricing
        signals.askedPricing = true
    }

    // Check for consultation keywords
    if (
        !signals.askedConsultation &&
        (lowerContent.includes('consultation') ||
            lowerContent.includes('appointment') ||
            lowerContent.includes('schedule') ||
            lowerContent.includes('book'))
    ) {
        score += SCORING_WEIGHTS.askedConsultation
        signals.askedConsultation = true
    }

    // Check for procedure mentions
    if (!signals.mentionedProcedure) {
        const procedureKeywords = [
            'bbl',
            'brazilian',
            'breast',
            'tummy',
            'lipo',
            'mommy makeover',
            'facelift',
            'rhinoplasty',
            'nose',
            'botox',
            'filler',
        ]

        for (const keyword of procedureKeywords) {
            if (lowerContent.includes(keyword)) {
                score += SCORING_WEIGHTS.mentionedProcedure
                signals.mentionedProcedure = keyword
                break
            }
        }
    }

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score))

    return {
        score,
        grade: calculateGrade(score),
        signals,
    }
}

/**
 * Format lead score for display
 */
export function formatLeadScore(score: number, grade: LeadGrade): string {
    return `${grade} (${score})`
}

/**
 * Get grade color for UI
 */
export function getGradeColor(grade: LeadGrade): string {
    switch (grade) {
        case 'A':
            return 'bg-green-100 text-green-800'
        case 'B':
            return 'bg-blue-100 text-blue-800'
        case 'C':
            return 'bg-yellow-100 text-yellow-800'
        case 'D':
            return 'bg-stone-100 text-stone-800'
    }
}
