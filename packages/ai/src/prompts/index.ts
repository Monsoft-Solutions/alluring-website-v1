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
    buildChatSystemPrompt,
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
    // Inline Image Analyzer
    INLINE_IMAGE_ANALYZER_SYSTEM_PROMPT,
    getInlineImageAnalyzerPrompt,
    // Blog Analysis
    BLOG_ANALYSIS_SYSTEM_PROMPT,
    getBlogAnalysisPrompt,
    // Featured Image Prompt Generation
    FEATURED_IMAGE_PROMPT_SYSTEM,
    getFeaturedImagePrompt,
    extractImageConcept,
    type FeaturedImagePromptInput,
    // Writer, outline and topics (each carries the claims canon, #354)
    buildAgenticSystemPrompt,
    GENERATE_OUTLINE_SYSTEM_PROMPT,
    GENERATE_TOPICS_SYSTEM_PROMPT,
    CLAIM_TOKEN_RULE,
} from './blog'

export {
    // Content Brief Generation
    CONTENT_BRIEF_SYSTEM_PROMPT,
    getContentBriefPrompt,
} from './seo'
