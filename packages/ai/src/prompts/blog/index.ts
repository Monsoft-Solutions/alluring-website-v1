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
    BLOG_ANALYSIS_SYSTEM_PROMPT,
    getBlogAnalysisPrompt,
} from './blog-analysis.prompt'

export {
    FEATURED_IMAGE_PROMPT_SYSTEM,
    getFeaturedImagePrompt,
    type FeaturedImagePromptInput,
} from './featured-image-prompt.prompt'

// Blog Ideation Prompts
export {
    GENERATE_TOPICS_SYSTEM_PROMPT,
    getGenerateTopicsPrompt,
} from './generate-topics.prompt'

export {
    GENERATE_OUTLINE_SYSTEM_PROMPT,
    getGenerateOutlinePrompt,
} from './generate-outline.prompt'

export {
    GENERATE_POST_CONTENT_SYSTEM_PROMPT,
    getGeneratePostContentPrompt,
} from './generate-post-content.prompt'

// Agentic Writer Prompts
export {
    BRAND_VOICE_GUIDELINES,
    AI_SLOP_PREVENTION_RULES,
    RESEARCH_TOOL_GUIDELINES,
    CONTENT_STRUCTURE_RULES,
    SEO_WRITING_GUIDELINES,
    EEAT_GUIDELINES,
    LINKING_GUIDELINES,
    BUSINESS_CONTEXT,
    buildAgenticSystemPrompt,
    buildAgenticUserPrompt,
    type BuildAgenticUserPromptOptions,
} from './agentic-writer.prompt'
