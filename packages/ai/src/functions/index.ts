/**
 * @workspace/ai/functions
 *
 * AI operation functions.
 *
 * @module @workspace/ai/functions
 */

export {
    classifyIntent,
    type ClassifyIntentOptions,
} from './classify-intent.function'

export {
    streamChat,
    streamText,
    smoothStream,
    TextStreamChatTransport,
    DefaultChatTransport,
    createUIMessageStream,
    createUIMessageStreamResponse,
    type ChatMessage,
    type StreamChatOptions,
    type UIMessageStreamWriter,
} from './stream-chat.function'

export {
    generateQuickQuestions,
    type GenerateQuickQuestionsOptions,
} from './generate-quick-questions.function'

export {
    analyzeConversation,
    calculateLeadScoreFromAnalysis,
    type AnalyzeConversationOptions,
} from './analyze-conversation.function'

// Gallery Image Analysis
export {
    analyzeGalleryImage,
    type AnalyzeImageOptions,
} from './analyze-image.function'

export {
    generateGallerySEOContent,
    type GenerateSEOContentOptions,
} from './generate-seo-content.function'

export {
    generateGalleryVisitorContent,
    type GenerateVisitorContentOptions,
} from './generate-visitor-content.function'

export {
    suggestGalleryGroups,
    type SuggestGroupsOptions,
} from './suggest-groups.function'

// Text Improvement
export {
    streamImproveText,
    type StreamImproveTextOptions,
} from './stream-improve-text.function'

// Blog Post AI
export {
    summarizeBlogPost,
    type SummarizeBlogPostOptions,
    type BlogPostSummary,
} from './summarize-blog-post.function'

export {
    summarizeRefreshChanges,
    type SummarizeRefreshChangesOptions,
    type RefreshChangeSummary,
} from './summarize-refresh-changes.function'

export {
    generateImagePrompt,
    type GenerateImagePromptOptions,
    type ImagePromptResult,
} from './generate-image-prompt.function'

export {
    analyzeBlogPost,
    type AnalyzeBlogPostOptions,
} from './analyze-blog-post.function'

export {
    generateInlineImagePrompt,
    type GenerateInlineImagePromptOptions,
    type InlineImagePromptResult,
    type InlineImageType,
    type PhotoStyle,
} from './generate-inline-image-prompt.function'

export {
    generateImageAlt,
    type GenerateImageAltOptions,
    type ImageAltResult,
} from './generate-image-alt.function'

export {
    detectPeopleInImage,
    type DetectPeopleInImageOptions,
    type PeopleDetectionResult,
} from './detect-people-in-image.function'

export {
    generateFeaturedImagePrompt,
    type GenerateFeaturedImagePromptOptions,
    type FeaturedImagePromptResult,
} from './generate-featured-image-prompt.function'

// Blog Ideation AI
export {
    generateBlogTopics,
    type GenerateBlogTopicsOptions,
    type GenerateBlogTopicsResult,
    type TopicSuggestion,
    type GscTopicSeed,
    type ContextHints,
    type ProcedureContext,
} from './generate-blog-topics.function'

export {
    generateBlogOutline,
    type GenerateBlogOutlineOptions,
    type GenerateBlogOutlineResult,
    type OutlineSection,
} from './generate-blog-outline.function'

export {
    extractMetadata,
    type ExtractMetadataOptions,
    type ContentMetadata,
} from './extract-metadata.function'

export {
    extractFaqs,
    generateFaqSchema,
    type ExtractFaqsOptions,
    type ExtractFaqsResult,
} from './extract-faqs.function'

export {
    extractQuickAnswer,
    serializeQuickAnswer,
    parseQuickAnswer,
    quickAnswerSchema,
    QUICK_ANSWER_MIN_WORDS,
    QUICK_ANSWER_MAX_WORDS,
    type QuickAnswerResult,
    type ExtractQuickAnswerOptions,
} from './extract-quick-answer.function'

// SEO Content Brief
export {
    generateContentBrief,
    type GenerateContentBriefOptions,
} from './generate-content-brief.function'

// Image Option Selection
export {
    selectImageOptions,
    type SelectImageOptionsOptions,
    type SelectedImageOptions,
    type ModelProfile,
} from './select-image-options.function'

// Instagram SEO Title Generation
export {
    generateInstagramSeoTitle,
    type GenerateInstagramSeoTitleOptions,
    type GenerateInstagramSeoTitleResult,
} from './generate-instagram-seo-title.function'

// Generated MDX Safety
export {
    validateGeneratedMdx,
    type MdxValidationResult,
    type MdxSanitizationAction,
} from './validate-generated-mdx.function'

export {
    validateInternalLinks,
    type InternalLinkValidationResult,
    type BrokenInternalLink,
} from './validate-internal-links.function'
