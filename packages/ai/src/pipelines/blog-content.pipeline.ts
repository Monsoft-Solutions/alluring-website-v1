/**
 * Blog Content Pipeline
 *
 * Orchestrates the full blog content generation process:
 * 1. Research phase - Web search for up-to-date information
 * 2. Content generation - AI-powered content writing with tools
 * 3. Review phase - Parallel execution of review agents
 * 4. Orchestration - Final revisions based on reviews
 *
 * @module @workspace/ai/pipelines/blog-content
 */
import { searchWeb } from '../tools/web-search-tavily.tool'
import { getInternalLinks } from '../tools/internal-links.tool'
import { getExternalSources } from '../tools/external-sources.tool'
import {
    runInternalLinksReviewer,
    runExternalLinksReviewer,
    runWritingQualityReviewer,
    runAISlopDetector,
    runOrchestrator,
} from '../agents'
import { generateBlogPostContent } from '../functions/generate-blog-post-content.function'
import { extractFaqs } from '../functions/extract-faqs.function'
import type {
    BlogContentPipelineOptions,
    BlogContentPipelineResult,
    ResearchResult,
    FaqItem,
} from './types.pipeline'
import type { AgentReview } from '../agents/types.agent'

/**
 * Run the research phase
 */
async function runResearchPhase(
    topic: string,
    primaryKeyword?: string,
    onProgress?: BlogContentPipelineOptions['onProgress']
): Promise<ResearchResult[]> {
    onProgress?.('research', 10, 'Starting research phase...')

    const searchQueries = [
        primaryKeyword || topic,
        `${topic} latest research`,
        `${topic} statistics 2025`,
    ]

    const results: ResearchResult[] = []

    for (let i = 0; i < searchQueries.length; i++) {
        const query = searchQueries[i] ?? topic
        onProgress?.(
            'research',
            10 + (i / searchQueries.length) * 40,
            `Searching: ${query}`,
            {
                type: 'research-query',
                query,
                queryIndex: i,
                totalQueries: searchQueries.length,
            }
        )

        try {
            const searchResult = await searchWeb(query, {
                maxResults: 3,
                searchDepth: 'basic',
                medicalOnly: true,
            })

            results.push({
                query: searchResult.query,
                findings: searchResult.results,
                summary: searchResult.summary,
            })

            // Send findings to the client
            onProgress?.(
                'research',
                10 + ((i + 1) / searchQueries.length) * 80,
                `Found ${searchResult.results.length} sources for: ${query}`,
                {
                    type: 'research-finding',
                    query: searchResult.query,
                    findings: searchResult.results.slice(0, 3),
                    summary: searchResult.summary,
                }
            )
        } catch (error) {
            console.error(`Research failed for query: ${query}`, error)
            // Continue with other queries
        }
    }

    onProgress?.('research', 100, 'Research complete')
    return results
}

/**
 * Run the content generation phase
 */
async function runContentGenerationPhase(
    options: BlogContentPipelineOptions,
    research: ResearchResult[],
    onProgress?: BlogContentPipelineOptions['onProgress']
) {
    onProgress?.('content-generation', 10, 'Starting content generation...')

    const { idea, outline } = options

    // Get internal link suggestions
    onProgress?.(
        'link-integration',
        20,
        'Finding internal link opportunities...'
    )
    const internalLinkSuggestions = getInternalLinks(
        idea.primaryKeyword || idea.title,
        {
            maxResults: 10,
        }
    )

    // Get external source suggestions
    onProgress?.(
        'link-integration',
        30,
        'Finding external source opportunities...'
    )
    const externalSourceSuggestions = getExternalSources(
        idea.primaryKeyword || idea.title,
        {
            maxResults: 5,
        }
    )

    // Build enhanced outline with research and link suggestions
    const enhancedOutline = {
        ...outline,
        seoNotes: {
            ...outline.seoNotes,
            internalLinks: internalLinkSuggestions.suggestions
                .slice(0, 5)
                .map((l) => `${l.title}: ${l.url}`),
            externalSources: externalSourceSuggestions.suggestions
                .slice(0, 3)
                .map((s) => `${s.source.name} (${s.source.domain})`),
        },
    }

    // Build research context for the AI
    const researchContext = research
        .flatMap((r) =>
            r.findings.map(
                (f) => `- ${f.title}: ${f.snippet} (Source: ${f.url})`
            )
        )
        .slice(0, 10)
        .join('\n')

    onProgress?.('content-generation', 50, 'Generating content with AI...')

    // Generate content
    const result = await generateBlogPostContent({
        title: idea.title,
        topic: idea.topic || idea.title,
        primaryKeyword: idea.primaryKeyword || '',
        secondaryKeywords: idea.secondaryKeywords,
        targetAudience: idea.targetAudience,
        uniqueAngle: idea.uniqueAngle,
        outline: {
            tldr: enhancedOutline.tldr,
            introduction: enhancedOutline.introduction,
            sections: enhancedOutline.sections.map((s) => ({
                title: s.title,
                description: s.description,
                keyPoints: s.keyPoints,
                subsections: s.subsections,
            })),
            conclusion: enhancedOutline.conclusion,
        },
        estimatedWordCount: idea.estimatedWordCount,
        modelId: options.contentModelId,
    })

    onProgress?.('content-generation', 100, 'Content generation complete')

    // Extract FAQs from the generated content for FAQ Schema
    const faqResult = await extractFaqs({
        content: result.content,
        primaryKeyword: idea.primaryKeyword,
    })

    // Add link suggestions context to content (AI should have incorporated them)
    // This is additional metadata for the review phase
    return {
        content: result.content,
        wordCount: result.wordCount,
        metaDescription: result.metaDescription,
        excerpt: result.excerpt,
        suggestedTags: result.suggestedTags,
        faqs: faqResult.faqs as FaqItem[],
        linkSuggestions: {
            internal: internalLinkSuggestions,
            external: externalSourceSuggestions,
        },
        researchContext,
    }
}

/**
 * Run the review phase (parallel execution)
 * Each agent emits its result via onProgress when complete
 */
async function runReviewPhase(
    content: string,
    title: string,
    primaryKeyword?: string,
    secondaryKeywords?: string[],
    reviewModelId?: string,
    onProgress?: BlogContentPipelineOptions['onProgress']
): Promise<AgentReview[]> {
    onProgress?.(
        'review-internal-links',
        10,
        'Starting parallel review phase...'
    )

    const reviewOptions = {
        content,
        title,
        primaryKeyword,
        secondaryKeywords,
        modelId: reviewModelId,
    }

    // Run all reviews in parallel, emitting results as each completes
    const [
        internalLinksReview,
        externalLinksReview,
        writingQualityReview,
        aiSlopReview,
    ] = await Promise.all([
        runInternalLinksReviewer(reviewOptions).then((result) => {
            onProgress?.(
                'review-internal-links',
                100,
                'Internal links review complete',
                {
                    type: 'review-result',
                    agentName: result.agentName,
                    score: result.score,
                    summary: result.summary,
                    issueCount: result.issues.length,
                }
            )
            return result
        }),
        runExternalLinksReviewer(reviewOptions).then((result) => {
            onProgress?.(
                'review-external-links',
                100,
                'External links review complete',
                {
                    type: 'review-result',
                    agentName: result.agentName,
                    score: result.score,
                    summary: result.summary,
                    issueCount: result.issues.length,
                }
            )
            return result
        }),
        runWritingQualityReviewer(reviewOptions).then((result) => {
            onProgress?.(
                'review-writing-quality',
                100,
                'Writing quality review complete',
                {
                    type: 'review-result',
                    agentName: result.agentName,
                    score: result.score,
                    summary: result.summary,
                    issueCount: result.issues.length,
                }
            )
            return result
        }),
        runAISlopDetector(reviewOptions).then((result) => {
            onProgress?.('review-ai-slop', 100, 'AI slop detection complete', {
                type: 'review-result',
                agentName: result.agentName,
                score: result.score,
                summary: result.summary,
                issueCount: result.issues.length,
            })
            return result
        }),
    ])

    return [
        internalLinksReview,
        externalLinksReview,
        writingQualityReview,
        aiSlopReview,
    ]
}

/**
 * Run the full blog content pipeline
 *
 * @param options Pipeline options
 * @returns Full pipeline result
 *
 * @example
 * ```typescript
 * const result = await runBlogContentPipeline({
 *   idea: {
 *     title: 'BBL Recovery Guide',
 *     topic: 'Brazilian Butt Lift Recovery',
 *     primaryKeyword: 'bbl recovery',
 *   },
 *   outline: {
 *     tldr: ['Recovery takes 6-8 weeks'],
 *     introduction: { hook: '...', preview: '...' },
 *     sections: [...],
 *     conclusion: { summaryPoints: [...], nextSteps: '...' },
 *   },
 *   onProgress: (step, progress, message) => {
 *     console.log(`${step}: ${progress}% - ${message}`)
 *   },
 * })
 * ```
 */
export async function runBlogContentPipeline(
    options: BlogContentPipelineOptions
): Promise<BlogContentPipelineResult> {
    const startTime = Date.now()
    const {
        idea,
        onProgress,
        skipResearch = false,
        skipReview = false,
    } = options

    const timeBreakdown = {
        research: 0,
        contentGeneration: 0,
        review: 0,
        orchestration: 0,
    }

    try {
        // Phase 1: Research
        let research: ResearchResult[] = []
        if (!skipResearch) {
            const researchStart = Date.now()
            research = await runResearchPhase(
                idea.topic || idea.title,
                idea.primaryKeyword,
                onProgress
            )
            timeBreakdown.research = Date.now() - researchStart
        }

        // Phase 2: Content Generation
        const contentStart = Date.now()
        const contentResult = await runContentGenerationPhase(
            options,
            research,
            onProgress
        )
        timeBreakdown.contentGeneration = Date.now() - contentStart

        // Phase 3: Review (parallel)
        let reviews: AgentReview[] = []
        if (!skipReview) {
            const reviewStart = Date.now()
            reviews = await runReviewPhase(
                contentResult.content,
                idea.title,
                idea.primaryKeyword,
                idea.secondaryKeywords,
                options.reviewModelId,
                onProgress
            )
            timeBreakdown.review = Date.now() - reviewStart
        }

        // Phase 4: Orchestration
        onProgress?.('orchestration', 10, 'Starting orchestration phase...')
        const orchestrationStart = Date.now()

        const orchestratorResult = await runOrchestrator({
            originalContent: contentResult.content,
            title: idea.title,
            primaryKeyword: idea.primaryKeyword,
            reviews,
        })

        timeBreakdown.orchestration = Date.now() - orchestrationStart
        onProgress?.('orchestration', 100, 'Orchestration complete')

        // Complete
        onProgress?.('complete', 100, 'Pipeline complete!')

        const totalProcessingTimeMs = Date.now() - startTime

        return {
            success: true,
            research,
            initialContent: {
                content: contentResult.content,
                wordCount: contentResult.wordCount,
                metaDescription: contentResult.metaDescription,
                excerpt: contentResult.excerpt,
                suggestedTags: contentResult.suggestedTags,
                faqs: contentResult.faqs,
            },
            reviews,
            orchestratorResult,
            totalProcessingTimeMs,
            timeBreakdown,
        }
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown error'
        onProgress?.('complete', 0, `Pipeline failed: ${errorMessage}`)

        return {
            success: false,
            error: errorMessage,
            research: [],
            initialContent: {
                content: '',
                wordCount: 0,
                metaDescription: '',
                excerpt: '',
            },
            reviews: [],
            orchestratorResult: {
                revisedContent: '',
                changesSummary: '',
                changes: [],
                overallScore: 0,
                agentReviews: [],
                processingTimeMs: 0,
            },
            totalProcessingTimeMs: Date.now() - startTime,
            timeBreakdown,
        }
    }
}
