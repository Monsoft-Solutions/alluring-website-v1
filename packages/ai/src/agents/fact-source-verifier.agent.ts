/**
 * Fact & Source Verification Agent
 *
 * Reviews blog post content for unverified claims and statistics.
 * Uses Perplexity AI to find authoritative sources for citations.
 * Returns issues in the standard AgentReview format for orchestrator processing.
 *
 * @module @workspace/ai/agents/fact-source-verifier
 */
import { generateText, Output, stepCountIs } from 'ai'
import { z } from 'zod'

import { getModel } from '../models/model-resolver.util'
import {
    createSourceCollector,
    createPerplexitySearchTool,
} from '../tools/research-tools.tool'
import { createThinkTool } from '../tools/think.tool'
import { TIER1_SOURCES, TIER2_SOURCES } from '../config/trusted-sources.config'
import { telemetryConfig } from '../telemetry'
import type {
    AgentReview,
    ReviewAgentOptions,
    ReviewIssue,
} from './types.agent'

/**
 * Default model for fact verification
 */
const DEFAULT_MODEL_ID = 'claude-sonnet-4-5'

/**
 * Maximum number of search steps allowed
 */
const MAX_SEARCH_STEPS = 15

/**
 * Schema for verification results
 */
const verificationResultSchema = z.object({
    score: z
        .number()
        .describe(
            'Score for source citation quality (0-100). 100 = all claims cited'
        ),
    issues: z.array(
        z.object({
            severity: z.enum(['critical', 'warning', 'suggestion']),
            location: z.string().describe('The claim location/context'),
            description: z
                .string()
                .describe('Description of the citation issue'),
            suggestedFix: z
                .string()
                .describe(
                    'The exact markdown citation to add, e.g., [According to ASPS](https://...)'
                ),
            originalText: z
                .string()
                .optional()
                .describe('The original claim text'),
        })
    ),
    summary: z
        .string()
        .describe(
            'Summary of the fact verification review. The maximum length is 500 characters.'
        ),
    verifiedClaims: z
        .number()
        .describe('Number of claims successfully verified with sources'),
    unverifiedClaims: z
        .number()
        .describe('Number of claims that could not be verified'),
})

/**
 * Build trusted source context for the prompt
 */
function buildTrustedSourceContext(): string {
    const tier1 = TIER1_SOURCES.map((s) => `- ${s.name} (${s.domain})`).join(
        '\n'
    )
    const tier2 = TIER2_SOURCES.map((s) => `- ${s.name} (${s.domain})`).join(
        '\n'
    )

    return `### Tier 1 (Highest Priority)
${tier1}

### Tier 2 (High Priority)
${tier2}

Prefer Tier 1 sources when available. Only use consumer health sites if no better source exists.`
}

/**
 * Unified system prompt for fact verification
 * Combines claim identification, research, and verification into a single flow
 */
const UNIFIED_FACT_VERIFICATION_PROMPT = `You are a medical fact-checker for a luxury plastic surgery clinic's blog content. Your task is to identify claims that need citations, verify them using Perplexity search, and generate a verification report.

## Your Process

1. **Identify claims** that need source citations
2. **Use the think tool** to analyze claims and plan your search strategy
3. **Use perplexity_search** to find authoritative sources
4. **Generate issues** with specific citation fixes for uncited claims

## What Needs Verification

**Statistics and Numbers:**
- Percentages (e.g., "90% of patients...")
- Specific numbers (e.g., "over 300,000 procedures...")
- Rates or ratios (e.g., "1 in 3,000 mortality rate...")
- Time periods (e.g., "recovery takes 6-8 weeks")

**Medical Facts:**
- Risks and complications
- Safety information

**Cost Information:**
- Price ranges
- Cost comparisons
- Financial statistics

**Outcome Claims:**
- Patient satisfaction rates
- Success rates
- Longevity of results

## Already Has Citation (Skip These)

A claim HAS a citation if it includes:
- A markdown link: [text](url)
- A direct URL reference
- Attribution like "According to [Organization]..." with a link

## Skip These Entirely

- General knowledge statements
- Descriptions of the clinic's own services
- Subjective opinions clearly marked as such
- Vague statements without specific claims

## Using the Think Tool

Before searching, use the \`think\` tool to:
1. List all claims that need verification
2. Identify which claims are already cited (skip these)
3. Prioritize which claims are most important to verify
4. Plan search queries for each uncited claim

After receiving search results, use the \`think\` tool to:
1. Evaluate which source is most authoritative
2. Check if data is recent enough (prefer statistics from last 3 years)
3. Plan the exact citation format to suggest

## Using Perplexity Search

Use \`perplexity_search\` with \`focus: "medical"\` for health-related claims.

**Search Strategy:**
- Use specific medical terminology
- Search for the exact claim or statistic
- Include organization names if looking for specific data
- Today's date is ${new Date().toISOString().split('T')[0]}

## Trusted Sources (Priority Order)

${buildTrustedSourceContext()}

## Citation Format

Create citations as markdown links:
- \`[descriptive anchor text](https://link-to-the-source)\`

Good examples:
- \`[according to the American Society of Plastic Surgeons](https://www.plasticsurgery.org/...)\`
- \`[Mayo Clinic recommends](https://www.mayoclinic.org/...)\`

## Scoring Guide

- 90-100: All or nearly all claims have authoritative citations
- 70-89: Most claims cited, some minor gaps
- 50-69: About half the claims cited
- 30-49: Few claims cited
- 0-29: Very few or no citations

## Issue Severity

- **critical**: Important medical facts or statistics without any citation
- **warning**: Claims that should have citations but are less critical
- **suggestion**: Claims where citations would help but aren't essential

## Output Requirements

For each issue, provide:
1. The exact location/context of the claim
2. A clear description of why it needs a citation
3. The original claim text
4. A complete suggestedFix with the exact markdown citation to add

If all claims are already cited, return a score of 100 with no issues.`

/**
 * Run the fact and source verification agent
 *
 * This agent uses a single generateText call with Perplexity search and Think tools
 * to identify claims, verify them, and generate a comprehensive verification report.
 *
 * @param options - Review agent options
 * @returns Agent review with issues for uncited claims
 */
export async function runFactSourceVerifier(
    options: ReviewAgentOptions
): Promise<AgentReview> {
    const startTime = Date.now()
    const {
        content,
        title,
        primaryKeyword,
        modelId = DEFAULT_MODEL_ID,
        temperature = 0.3,
    } = options

    console.log('[Fact Verifier] Starting fact and source verification...')

    // Create source collector and tools
    const sourceContext = createSourceCollector()
    const perplexitySearchTool = createPerplexitySearchTool(sourceContext)
    const thinkTool = createThinkTool()

    // Build the user prompt
    const userPrompt = `Analyze this blog post for claims that need source citations, verify them using Perplexity search, and generate a verification report.

**Title:** ${title}
**Primary Keyword:** ${primaryKeyword || 'Not specified'}

---

**Content to Verify:**

${content}

---

**Instructions:**

1. First, use the \`think\` tool to identify all claims that need verification (statistics, medical facts, outcomes, timelines, costs). Note which ones already have citations.

2. For each uncited claim, use \`perplexity_search\` with \`focus: "medical"\` to find authoritative sources.

3. Use the \`think\` tool again to evaluate the sources found and determine the best citations to suggest.

4. Generate the final verification report with:
   - A score (0-100) based on citation coverage
   - Issues for each uncited claim with the exact markdown citation to add
   - A summary of your findings

Begin by analyzing the content for claims that need verification.`

    // Track search count for logging
    let searchCount = 0
    let thinkCount = 0

    const result = await generateText({
        model: getModel(modelId),
        output: Output.object({ schema: verificationResultSchema }),
        system: UNIFIED_FACT_VERIFICATION_PROMPT,
        prompt: userPrompt,
        temperature,
        stopWhen: stepCountIs(MAX_SEARCH_STEPS),
        tools: {
            perplexity_search: perplexitySearchTool,
            think: thinkTool,
        },
        experimental_telemetry: telemetryConfig,
        onStepFinish: (event) => {
            if (event.toolCalls && event.toolCalls.length > 0) {
                for (const toolCall of event.toolCalls) {
                    if (toolCall.toolName === 'perplexity_search') {
                        searchCount++
                        const toolInput =
                            'input' in toolCall
                                ? (toolCall.input as Record<string, unknown>)
                                : {}
                        const query =
                            typeof toolInput?.query === 'string'
                                ? toolInput.query
                                : 'unknown query'
                        console.log(
                            `[Fact Verifier] Search ${searchCount}: "${query}"`
                        )
                    } else if (toolCall.toolName === 'think') {
                        thinkCount++
                        console.log(`[Fact Verifier] Think step ${thinkCount}`)
                    }
                }
            }
        },
    })

    const processingTimeMs = Date.now() - startTime

    console.log(
        `[Fact Verifier] Complete. Score: ${result.output.score}/100, Issues: ${result.output.issues.length}`
    )
    console.log(
        `[Fact Verifier] Searches: ${searchCount}, Think steps: ${thinkCount}, Sources: ${sourceContext.sources.length}`
    )
    console.log(`[Fact Verifier] Processing time: ${processingTimeMs}ms`)

    return {
        agentName: 'fact-source-verifier',
        score: result.output.score,
        issues: result.output.issues as ReviewIssue[],
        summary: result.output.summary,
        processingTimeMs,
        modelId,
    }
}
