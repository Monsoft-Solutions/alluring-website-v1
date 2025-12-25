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
    openai,
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
} from './generate-inline-image-prompt.function'

export {
    generateImageAlt,
    type GenerateImageAltOptions,
    type ImageAltResult,
} from './generate-image-alt.function'

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
} from './generate-blog-topics.function'

export {
    generateBlogOutline,
    type GenerateBlogOutlineOptions,
    type GenerateBlogOutlineResult,
    type OutlineSection,
} from './generate-blog-outline.function'

export {
    generateBlogPostContent,
    type GenerateBlogPostContentOptions,
    type GenerateBlogPostContentResult,
} from './generate-blog-post-content.function'

// Blog Content V2 Pipeline
export {
    generateBlogPostContentV2,
    type GenerateBlogPostContentV2Options,
    type GenerateBlogPostContentV2Result,
} from './generate-blog-post-content-v2.function'

// Blog Content Support Functions
export {
    gatherResearch,
    type GatherResearchOptions,
    type ResearchResult,
} from './gather-research.function'

export {
    scoreContentQuality,
    type ScoreContentQualityOptions,
    type QualityScoreResult,
    type QualityDimensions,
} from './score-content-quality.function'

export {
    enhanceContent,
    type EnhanceContentOptions,
    type EnhanceContentResult,
} from './enhance-content.function'

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
    type FaqItem,
} from './extract-faqs.function'

// SEO Content Brief
export {
    generateContentBrief,
    type GenerateContentBriefOptions,
} from './generate-content-brief.function'
