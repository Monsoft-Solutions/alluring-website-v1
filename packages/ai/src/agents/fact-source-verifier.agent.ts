/**
 * Fact & Source Verification Agent
 *
 * Reviews blog post content for unverified claims and statistics.
 * Uses Perplexity AI to find authoritative sources for citations.
 * Returns issues in the standard AgentReview format for orchestrator processing.
 *
 * @module @workspace/ai/agents/fact-source-verifier
 */
import { generateText, Output, isStepCount } from 'ai'
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
const DEFAULT_MODEL_ID = 'claude-opus-5'

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
                .nullable()
                .describe(
                    'The original claim text. Set to null if not applicable.'
                ),
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

## Workflow: Research First, Analyze Later

**IMPORTANT: Do NOT use the think tool between searches. Complete ALL research first.**

### Step 1: Initial Planning (Think Tool)
Use the \`think\` tool ONCE at the start to:
1. List all claims that need verification
2. Identify which claims are already cited (skip these)
3. Plan all search queries you'll need to execute

### Step 2: Batch Research (Perplexity Search)
Execute ALL \`perplexity_search\` calls in sequence (preferably in parallel) WITHOUT using the think tool between them.
- Search for each uncited claim
- Gather all sources and data
- Do NOT stop to analyze after each search

### Step 3: Final Analysis (Think Tool)
After ALL searches are complete, use the \`think\` tool ONCE to:
1. Review all gathered sources together
2. Evaluate which sources are most authoritative for each claim
3. Check if data is recent enough (prefer statistics from last 3 years)
4. Plan the exact citation format for each uncited claim
5. Determine the final score based on overall citation coverage

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

Follow this exact workflow - research first, analyze later:

1. **THINK (once):** Use the \`think\` tool to identify all claims needing verification (statistics, medical facts, outcomes, timelines, costs). Note which are already cited. Plan all your search queries.

2. **SEARCH (batch):** Execute ALL \`perplexity_search\` calls with \`focus: "medical"\` for each uncited claim. Do NOT use the think tool between searches - complete all research first.

3. **THINK (once):** After ALL searches are complete, use the \`think\` tool to analyze all gathered sources together. Evaluate authority, recency, and plan exact citations for each claim.

4. **REPORT:** Generate the final verification report with:
   - A score (0-100) based on citation coverage
   - Issues for each uncited claim with the exact markdown citation to add
   - A summary of your findings

Begin by using the think tool to identify all claims and plan your search queries.`

    // Track search count for logging
    let searchCount = 0
    let thinkCount = 0

    const result = await generateText({
        model: getModel(modelId),
        output: Output.object({ schema: verificationResultSchema }),
        instructions: UNIFIED_FACT_VERIFICATION_PROMPT,
        prompt: userPrompt,
        maxOutputTokens: 16000,
        stopWhen: isStepCount(MAX_SEARCH_STEPS),
        tools: {
            perplexity_search: perplexitySearchTool,
            think: thinkTool,
        },
        telemetry: telemetryConfig,
        onStepEnd: (event) => {
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
