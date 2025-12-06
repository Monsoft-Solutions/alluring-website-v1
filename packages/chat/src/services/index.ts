/**
 * Chat Services Exports
 *
 * @module @workspace/chat/services
 */
export {
    detectIntentKeywords,
    // Re-exports from @workspace/ai/schemas for backward compatibility
    INTENT_TYPES,
    DETECTABLE_PROCEDURES,
    SESSION_TAGS,
    type IntentType,
    type DetectableProcedure,
    type SessionTag,
    type IntentClassification,
    type ClassificationMessage,
} from './intent-classifier.service'

export {
    calculateGrade,
    calculateLeadScore,
    updateLeadScoreFromMessage,
    formatLeadScore,
    getGradeColor,
    type ScoringSignals,
    type LeadGrade,
    type LeadScoreResult,
} from './lead-scorer.service'
