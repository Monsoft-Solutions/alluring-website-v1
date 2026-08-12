export {
    BLOG_SUMMARY_SYSTEM_PROMPT,
    getBlogSummaryPrompt,
} from './blog-summary.prompt'

export {
    IMAGE_PROMPT_SYSTEM_PROMPT,
    getImagePromptPrompt,
} from './image-prompt.prompt'

export {
    INLINE_IMAGE_PROMPT_SYSTEM,
    getInlineImagePrompt,
} from './inline-image-prompt.prompt'

export {
    INLINE_IMAGE_ANALYZER_SYSTEM_PROMPT,
    getInlineImageAnalyzerPrompt,
} from './inline-image-analyzer.prompt'

export {
    BLOG_ANALYSIS_SYSTEM_PROMPT,
    getBlogAnalysisPrompt,
} from './blog-analysis.prompt'

export {
    FEATURED_IMAGE_PROMPT_SYSTEM,
    getFeaturedImagePrompt,
    extractImageConcept,
    type FeaturedImagePromptInput,
} from './featured-image-prompt.prompt'

export {
    SELECT_IMAGE_OPTIONS_SYSTEM,
    getSelectImageOptionsPrompt,
} from './select-image-options.prompt'

// Blog Ideation Prompts
export {
    GENERATE_TOPICS_SYSTEM_PROMPT,
    getGenerateTopicsPrompt,
} from './generate-topics.prompt'

export {
    GENERATE_OUTLINE_SYSTEM_PROMPT,
    getGenerateOutlinePrompt,
} from './generate-outline.prompt'

// Agentic Writer Prompts
export {
    // New consolidated constants
    ROLE_AND_CONTEXT,
    WRITING_STYLE_PRINCIPLES,
    WRITING_EXAMPLES,
    CONTENT_REQUIREMENTS,
    RESEARCH_GUIDELINES,
    OUTPUT_FORMAT,
    CONTENT_TYPE_TEMPLATES,
    // Functions
    getContentTypeInstructions,
    buildAgenticSystemPrompt,
    buildAgenticUserPrompt,
    // Types
    type BuildAgenticUserPromptOptions,
    type ContentType,
} from './agentic-writer.prompt'

// Refresh Writer Prompts (epic #144)
export {
    REFRESH_MODE_RULES,
    buildRefreshBriefSection,
    type RefreshBriefInput,
} from './refresh-writer.prompt'
export {
    REFRESH_CHANGE_SUMMARY_SYSTEM_PROMPT,
    getRefreshChangeSummaryPrompt,
} from './refresh-change-summary.prompt'
