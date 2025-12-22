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

export {
    // Image Analysis
    IMAGE_ANALYSIS_SYSTEM_PROMPT,
    getImageAnalysisPrompt,
    // SEO Content
    SEO_CONTENT_SYSTEM_PROMPT,
    getSEOContentPrompt,
    // Visitor Content
    VISITOR_CONTENT_SYSTEM_PROMPT,
    getVisitorContentPrompt,
    // Group Suggestion
    GROUP_SUGGESTION_SYSTEM_PROMPT,
    getGroupSuggestionPrompt,
} from './gallery'

export {
    // Text Improvement
    TEXT_IMPROVEMENT_SYSTEM_PROMPT,
    getTextImprovementPrompt,
} from './text'

export {
    // Blog Summary
    BLOG_SUMMARY_SYSTEM_PROMPT,
    getBlogSummaryPrompt,
    // Image Prompt Generation
    IMAGE_PROMPT_SYSTEM_PROMPT,
    getImagePromptPrompt,
    // Inline Image Prompt Generation
    INLINE_IMAGE_PROMPT_SYSTEM,
    getInlineImagePrompt,
    // Blog Analysis
    BLOG_ANALYSIS_SYSTEM_PROMPT,
    getBlogAnalysisPrompt,
} from './blog'
