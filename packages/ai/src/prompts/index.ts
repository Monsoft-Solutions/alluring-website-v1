/**
 * @workspace/ai/prompts
 *
 * Prompt templates for AI operations.
 *
 * @module @workspace/ai/prompts
 */

export {
    // Intent Classification
    INTENT_CLASSIFICATION_SYSTEM_PROMPT,
    formatMessagesForClassification,
    getIntentClassificationPrompt,
    // System Prompts
    DEFAULT_CHAT_SYSTEM_PROMPT,
    generateSystemPrompt,
    type SystemPromptParams,
    // Quick Questions
    QUICK_QUESTIONS_SYSTEM_PROMPT,
    formatMessagesForQuickQuestions,
    getQuickQuestionsPrompt,
    // Conversation Analysis
    CONVERSATION_ANALYSIS_SYSTEM_PROMPT,
    formatMessagesForAnalysis,
    getConversationAnalysisPrompt,
} from './chat'
