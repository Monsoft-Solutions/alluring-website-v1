/**
 * Agentic Blog Post Content Generation Function
 *
 * Uses an agentic approach where the AI has access to research tools
 * (Perplexity AI and Google Search) during content writing.
 * The AI decides when to search for facts, statistics, and sources
 * as needed while generating content.
 *
 * Uses AI SDK generateText directly with tool() helper for proper
 * multi-step tool calling (inputSchema format per AI SDK docs).
 *
 * @module @workspace/ai/functions/generate-blog-post-content-agentic
 */
import { generateText, stepCountIs } from 'ai'
import { openai } from '@ai-sdk/openai'

import {
    createResearchTools,
    createSourceCollector,
    type CollectedSource,
} from '../tools/research-tools.tool'
import { getInternalPagesContext } from '../data/internal-pages.data'
import { telemetryConfig } from '../telemetry'
import type { FaqItem } from '@workspace/shared/schemas/blog'

import { extractMetadata } from './extract-metadata.function'
import { extractFaqs, generateFaqSchema } from './extract-faqs.function'

/**
 * Outline section input type
 */
type OutlineSectionInput = {
    title: string
    description: string
    keyPoints?: string[]
    subsections?: Array<{ title: string; description?: string }>
}

/**
 * Options for agentic content generation
 */
export type GenerateBlogPostContentAgenticOptions = {
    /** Blog post title */
    title: string
    /** Main topic */
    topic: string
    /** Primary keyword to target */
    primaryKeyword: string
    /** Secondary keywords */
    secondaryKeywords?: string[]
    /** Target audience description */
    targetAudience?: string
    /** What makes this post unique */
    uniqueAngle?: string
    /** Structured outline to follow */
    outline: {
        tldr: string[]
        introduction: { hook: string; preview: string }
        sections: OutlineSectionInput[]
        conclusion: {
            summaryPoints: string[]
            nextSteps: string
        }
    }
    /** Target word count */
    estimatedWordCount?: number
    /** Model ID for content generation (default: gpt-4.1) */
    modelId?: string
    /** Temperature for content (default: 0.7) */
    temperature?: number
    /** Maximum tool call steps (default: 10) */
    maxSteps?: number
    /** Callback for step progress */
    onStepFinish?: (step: {
        stepType: string
        toolCalls?: unknown[]
        text?: string
    }) => void
}

/**
 * Agentic content generation result
 */
export type GenerateBlogPostContentAgenticResult = {
    /** Final blog post content (markdown) */
    content: string
    /** Word count of final content */
    wordCount: number
    /** SEO meta description */
    metaDescription: string
    /** Short excerpt for previews */
    excerpt: string
    /** Suggested tags */
    suggestedTags: string[]
    /** Reading time in minutes */
    readingTimeMinutes: number
    /** Suggested category */
    suggestedCategory: string
    /** Extracted FAQ items */
    faqs: FaqItem[]
    /** FAQ Schema JSON-LD (null if no FAQs) */
    faqSchema: object | null
    /** All sources used during generation */
    sources: CollectedSource[]
    /** Pipeline metadata */
    pipelineMetadata: {
        /** Total generation time in ms */
        totalTimeMs: number
        /** Number of tool calls made */
        toolCallCount: number
        /** Content generation time in ms */
        contentGenTimeMs: number
        /** Metadata extraction time in ms */
        metadataTimeMs: number
    }
}

/**
 * Default content generation model
 * Using GPT-4.1 for better tool usage and quality
 */
const DEFAULT_CONTENT_MODEL = 'gpt-5.2'

/**
 * System prompt for agentic content generation
 */
const AGENTIC_SYSTEM_PROMPT = `You are an expert content writer for a luxury plastic surgery clinic in Miami, FL.

Your role is to write high-quality, SEO-optimized blog posts that:
1. Educate patients about cosmetic procedures
2. Build trust through expertise and transparency
3. Drive organic traffic through natural keyword integration
4. Follow the brand voice and content guidelines exactly

## Business Context
- Business: Alluring Plastic Surgery - luxury cosmetic surgery clinic
- Location: Miami, FL (serves locals + medical tourists from Latin America/Caribbean)
- Tagline: "Luxury Surgeries Made Affordable"
- Target Audience: Women 25-55, value quality, seek affordability

## Brand Voice Guidelines

**Clear over clever:**
- Direct statements, not metaphors
- Active voice preferred
- Short, scannable sentences
- Technical content made accessible

**Technical but accessible:**
- Explain complex concepts simply
- Avoid jargon unless necessary (then explain it)
- Use examples to demonstrate points

**Confident, not arrogant:**
- "Here's how we approach this" not "The only way"
- Share learnings, not lectures
- Show expertise through substance

**What to say:**
✅ "Here's how..."
✅ "We typically see..."
✅ "The solution involves..."
✅ "In our experience..."
✅ "Patients often ask..."

**What NOT to say:**
❌ "Revolutionary approach"
❌ "Game-changing solution"
❌ "Blazing fast recovery"
❌ "World-class results"
❌ "Seamlessly integrate"
❌ "Unlock the power"
❌ Corporate jargon (leverage, synergy, paradigm)

## Research Tool Usage

You have access to research tools. you can use both perplexity_search and google_search as many times as you need. Use them strategically:

**Use \`perplexity_search\` when you need:**
- Current statistics (e.g., "what percentage of BBL patients...")
- Medical facts and recovery information
- Recent trends or data points
- Any claim that should be cited

**Use \`google_search\` when you need:**
- Information from specific websites
- Recent news or articles
- Specific procedure details from medical organizations

**Research best practices:**
- Search BEFORE making factual claims
- Cite all statistics with source links
- Use the sources returned to add credibility
- Don't make up numbers - either search for them or omit

## Content Structure Requirements

1. **TL;DR Section**: Start with key takeaways (2-3 bullet points)

2. **Body Sections**:
   - Use H2 for main sections
   - Use H3 for subsections
   - Keep paragraphs short (3-4 sentences max)
   - Use bullet points for lists
   - Include statistics with citations when available

3. **FAQ Section (Required)**:
   - Include a ## Frequently Asked Questions section near the end
   - 3-5 Q&A pairs that readers commonly search for
   - Use this format:
     **Q: Question goes here?**
     Answer paragraph (2-4 sentences)

4. **Conclusion**:
   - Summarize key points
   - Provide clear next steps
   - End with a natural CTA opportunity (don't write the CTA itself)

## SEO Writing Guidelines
- Primary keyword in first 100 words
- Primary keyword in at least one H2
- Natural keyword density (don't stuff)
- Use semantic variations
- Write for humans first, search engines second

## Linking Guidelines
- Include 3-5 internal links using the provided internal pages
- Include 2-4 external links to sources you find via search
- Use descriptive anchor text (not "click here" or "source")
- Format: [anchor text](url)

## Formatting
- Use markdown format
- H1 is the title (don't include in content, it's separate)
- Start content with TL;DR section
- Use ** for bold important terms

## E-E-A-T Signals (for medical content credibility)
- Reference "our surgeons" or "board-certified plastic surgeons"
- Mention Miami location for local expertise
- Use phrases like "In our experience with hundreds of patients..."
- Cite statistics from authoritative medical sources

## Medical Content Note
- Be informative but not prescriptive
- Always suggest consulting with a board-certified surgeon
- Don't make specific medical claims or guarantees
- Focus on general information and what to expect`

/**
 * Format sections text helper
 */
function formatSectionsText(sections: OutlineSectionInput[]): string {
    let sectionsText = ''
    for (const section of sections) {
        sectionsText += `\n### ${section.title}\n${section.description}\n`
        if (section.keyPoints?.length) {
            sectionsText += `Key points to cover:\n${section.keyPoints.map((p) => `- ${p}`).join('\n')}\n`
        }
        if (section.subsections?.length) {
            sectionsText += `Subsections:\n${section.subsections.map((s) => `- ${s.title}${s.description ? `: ${s.description}` : ''}`).join('\n')}\n`
        }
    }
    return sectionsText
}

/**
 * Build the user prompt for agentic generation
 */
function buildAgenticPrompt(
    options: GenerateBlogPostContentAgenticOptions,
    internalPagesContext: string
): string {
    const {
        title,
        topic,
        primaryKeyword,
        secondaryKeywords,
        targetAudience,
        uniqueAngle,
        outline,
        estimatedWordCount,
    } = options

    const sectionsText = formatSectionsText(outline.sections)

    return `Write a complete blog post based on the following brief.

**IMPORTANT: Use the research tools to find and cite statistics and facts. Do not make up numbers.**

---

**Title:** ${title}

**Topic:** ${topic}

**Primary Keyword:** ${primaryKeyword}

**Secondary Keywords:** ${secondaryKeywords?.join(', ') || 'None'}

**Target Audience:** ${targetAudience || 'Women 25-55 considering cosmetic procedures'}

**Unique Angle:** ${uniqueAngle || 'Comprehensive, expert perspective'}

**Target Word Count:** ${estimatedWordCount || 1500} words

---

# INTERNAL LINKING RESOURCES

${internalPagesContext}

---

# OUTLINE TO FOLLOW

**TL;DR Points:**
${outline.tldr.map((p) => `- ${p}`).join('\n')}

**Introduction:**
Hook: ${outline.introduction.hook}
Preview: ${outline.introduction.preview}

**Sections:**
${sectionsText}

**FAQ Section (add after main sections):**
Include 3-5 frequently asked questions about ${topic}. Use format:
**Q: Question?**
Answer paragraph.

**Conclusion:**
Summary points: ${outline.conclusion.summaryPoints.join('; ')}
Next steps: ${outline.conclusion.nextSteps}

---

# YOUR TASK

1. **Research first**: Before writing sections that need statistics, use \`perplexity_search\` to find current data and sources.

2. **Write with citations**: Include source links for any statistics or facts you cite.

3. **Follow the outline**: Write the complete blog post following the structure above.

4. **Internal links**: Include 3-5 internal links from the provided resources.

**Content Requirements:**
- Start with **TL;DR** section with key takeaways
- Primary keyword "${primaryKeyword}" in first 100 words, at least one H2, and conclusion
- Keep paragraphs short (3-4 sentences max)
- Target approximately ${estimatedWordCount || 1500} words
- Include FAQ section with 3-5 Q&A pairs

**Do NOT include:**
- The title (H1) - it's handled separately
- Actual CTA blocks - just end naturally
- Author bylines or dates
- Medical disclaimers (handled elsewhere)

Write the complete blog post now, using the research tools as needed:`
}

/**
 * Default maxSteps for agentic content generation
 * Increased to 20 to allow for complex multi-research content
 */
const DEFAULT_MAX_STEPS = 20

/**
 * Minimum word count expected for a blog post
 * If below this, generation likely failed
 */
const MINIMUM_WORD_COUNT = 200

/**
 * Generate blog post content using agentic approach with research tools
 *
 * The AI has access to Perplexity and Google Search tools and decides
 * when to use them during content generation. This enables:
 * - Real-time fact-checking during writing
 * - Automatic source citation
 * - More accurate and up-to-date content
 *
 * @param options - Generation options including outline and preferences
 * @returns Complete content with metadata, FAQs, and sources list
 *
 * @example
 * ```typescript
 * const result = await generateBlogPostContentAgentic({
 *   title: 'BBL Recovery Guide: Week by Week',
 *   topic: 'Brazilian Butt Lift Recovery',
 *   primaryKeyword: 'bbl recovery',
 *   outline: {
 *     tldr: ['Recovery takes 6-8 weeks', 'Avoid sitting directly for 2 weeks'],
 *     introduction: { hook: '...', preview: '...' },
 *     sections: [...],
 *     conclusion: { summaryPoints: [...], nextSteps: '...' },
 *   },
 * })
 *
 * console.log(result.content) // Full markdown content
 * console.log(result.sources) // All sources used during writing
 * console.log(result.pipelineMetadata.toolCallCount) // Number of searches made
 * ```
 */
export async function generateBlogPostContentAgentic(
    options: GenerateBlogPostContentAgenticOptions
): Promise<GenerateBlogPostContentAgenticResult> {
    const startTime = Date.now()

    const {
        title,
        primaryKeyword,
        modelId = DEFAULT_CONTENT_MODEL,
        temperature = 0.7,
        maxSteps = DEFAULT_MAX_STEPS,
        onStepFinish,
    } = options

    // Log generation start
    console.log('[Agentic Blog] ========================================')
    console.log('[Agentic Blog] Starting agentic blog post generation')
    console.log(`[Agentic Blog] Title: "${title}"`)
    console.log(`[Agentic Blog] Primary keyword: "${primaryKeyword}"`)
    console.log(`[Agentic Blog] Model: ${modelId}`)
    console.log(`[Agentic Blog] Max steps: ${maxSteps}`)
    console.log(
        `[Agentic Blog] Target word count: ${options.estimatedWordCount || 1500}`
    )
    console.log('[Agentic Blog] ========================================')

    // Create source collector to track all sources used
    const sourceContext = createSourceCollector()

    // Create research tools with source tracking
    const tools = createResearchTools(sourceContext)

    // Get internal pages context for natural linking
    const internalPagesContext = getInternalPagesContext()

    // Build the prompt
    const prompt = buildAgenticPrompt(options, internalPagesContext)

    // Track tool calls and steps
    let toolCallCount = 0
    let stepCount = 0

    // Generate content with tools
    const contentGenStart = Date.now()

    console.log('[Agentic Blog] Starting AI generation with tools...')

    // Use AI SDK generateText directly with tools defined using tool() helper
    // This ensures proper inputSchema format for multi-step tool calling
    // AI SDK v5+ uses stopWhen: stepCountIs(n) instead of maxSteps
    const result = await generateText({
        model: openai(modelId),
        system: AGENTIC_SYSTEM_PROMPT,
        prompt,
        temperature,
        tools,
        stopWhen: stepCountIs(maxSteps),
        experimental_telemetry: telemetryConfig,
        onStepFinish: (event) => {
            stepCount++

            // Log step details
            const hasToolCalls = (event.toolCalls?.length ?? 0) > 0
            const textLength = event.text?.length ?? 0

            if (hasToolCalls) {
                toolCallCount += event.toolCalls?.length ?? 0
                console.log(
                    `[Agentic Blog] Step ${stepCount}: Tool call (${event.toolCalls?.length} tools)`
                )

                // Log each tool call
                for (const toolCall of event.toolCalls) {
                    // Tool call input is in the 'input' property for AI SDK tools
                    const toolInput = 'input' in toolCall ? toolCall.input : {}
                    console.log(
                        `[Agentic Blog]   - ${toolCall.toolName}: ${JSON.stringify(toolInput).substring(0, 100)}...`
                    )
                }
            } else {
                console.log(
                    `[Agentic Blog] Step ${stepCount}: Text generation (${textLength} chars)${event.finishReason ? ` [${event.finishReason}]` : ''}`
                )
            }

            // Forward to user callback
            onStepFinish?.({
                stepType: hasToolCalls ? 'tool_call' : 'text',
                toolCalls: event.toolCalls,
                text: event.text,
            })
        },
    })

    const contentGenTimeMs = Date.now() - contentGenStart

    // Log generation result details
    console.log('[Agentic Blog] ----------------------------------------')
    console.log('[Agentic Blog] Generation complete')
    console.log(`[Agentic Blog] Finish reason: ${result.finishReason}`)
    console.log(`[Agentic Blog] Total steps: ${stepCount}`)
    console.log(`[Agentic Blog] Tool calls made: ${toolCallCount}`)
    console.log(
        `[Agentic Blog] Sources collected: ${sourceContext.sources.length}`
    )
    console.log(`[Agentic Blog] Text length: ${result.text.length} chars`)
    console.log(`[Agentic Blog] Generation time: ${contentGenTimeMs}ms`)

    // Validate result
    const finalContent = result.text
    const wordCount = finalContent
        .split(/\s+/)
        .filter((w) => w.length > 0).length

    console.log(`[Agentic Blog] Word count: ${wordCount}`)

    // Check for empty or insufficient content
    if (!finalContent || finalContent.trim().length === 0) {
        const errorMsg = `Content generation failed: Empty result. Finish reason: ${result.finishReason}, Steps: ${stepCount}/${maxSteps}`
        console.error(`[Agentic Blog] ERROR: ${errorMsg}`)
        throw new Error(errorMsg)
    }

    if (wordCount < MINIMUM_WORD_COUNT) {
        const warningMsg = `Content generation produced only ${wordCount} words (minimum: ${MINIMUM_WORD_COUNT}). Finish reason: ${result.finishReason}`
        console.warn(`[Agentic Blog] WARNING: ${warningMsg}`)

        // If we exhausted all steps without generating enough content, throw an error
        // Check if stepCount reached maxSteps (indicates we hit the limit)
        if (stepCount >= maxSteps) {
            throw new Error(
                `Content generation incomplete: maxSteps (${maxSteps}) exhausted with only ${wordCount} words. Increase maxSteps or simplify the outline.`
            )
        }
    }

    // Check finish reason for potential issues
    // Cast to string for comparison as finish reason types vary across AI SDK versions
    const finishReason = String(result.finishReason)
    if (
        finishReason === 'tool_calls' ||
        finishReason === 'tool-calls' ||
        finishReason.includes('tool')
    ) {
        console.warn(
            '[Agentic Blog] WARNING: Generation stopped after tool call. This may indicate incomplete content.'
        )
    }

    // Extract metadata and FAQs in parallel
    console.log('[Agentic Blog] Extracting metadata and FAQs...')
    const metadataStart = Date.now()

    const [metadata, faqResult] = await Promise.all([
        extractMetadata({
            content: finalContent,
            primaryKeyword,
            title,
        }),
        extractFaqs({
            content: finalContent,
            primaryKeyword,
        }),
    ])

    const metadataTimeMs = Date.now() - metadataStart

    // Generate FAQ Schema
    const faqSchema = generateFaqSchema(faqResult.faqs)

    // Return complete result
    const totalTimeMs = Date.now() - startTime

    console.log('[Agentic Blog] ========================================')
    console.log('[Agentic Blog] Blog post generation complete!')
    console.log(`[Agentic Blog] Final word count: ${wordCount}`)
    console.log(`[Agentic Blog] FAQs extracted: ${faqResult.faqs.length}`)
    console.log(`[Agentic Blog] Total time: ${totalTimeMs}ms`)
    console.log('[Agentic Blog] ========================================')

    return {
        content: finalContent,
        wordCount,
        metaDescription: metadata.metaDescription,
        excerpt: metadata.excerpt,
        suggestedTags: metadata.suggestedTags,
        readingTimeMinutes: metadata.readingTimeMinutes,
        suggestedCategory: metadata.suggestedCategory,
        faqs: faqResult.faqs,
        faqSchema,
        sources: sourceContext.sources,
        pipelineMetadata: {
            totalTimeMs,
            toolCallCount,
            contentGenTimeMs,
            metadataTimeMs,
        },
    }
}
