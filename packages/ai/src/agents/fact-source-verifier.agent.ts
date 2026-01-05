/**
 * Fact & Source Verification Agent
 *
 * Reviews blog post content for unverified claims and statistics.
 * Uses Google Search to find authoritative sources for citations.
 * Returns issues in the standard AgentReview format for orchestrator processing.
 *
 * @module @workspace/ai/agents/fact-source-verifier
 */
import { generateText, stepCountIs } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

import { coreGenerateObject } from '../core'
import {
    createSourceCollector,
    createGoogleSearchTool,
} from '../tools/research-tools.tool'
import {
    getTrustedDomains,
    TIER1_SOURCES,
    TIER2_SOURCES,
} from '../config/trusted-sources.config'
import { telemetryConfig } from '../telemetry'
import type {
    AgentReview,
    ReviewAgentOptions,
    ReviewIssue,
} from './types.agent'

/**
 * Default model for fact verification
 */
const DEFAULT_MODEL_ID = 'gpt-4.1'

/**
 * Maximum number of search steps allowed
 */
const MAX_SEARCH_STEPS = 15

/**
 * Schema for identified claims needing verification
 */
const claimIdentificationSchema = z.object({
    claims: z.array(
        z.object({
            claim: z.string().describe('The exact claim text from the content'),
            claimType: z
                .enum([
                    'statistic',
                    'medical-fact',
                    'outcome',
                    'timeline',
                    'cost',
                ])
                .describe('Category of the claim'),
            hasCitation: z
                .boolean()
                .describe('Whether the claim already has a source link'),
            context: z
                .string()
                .describe('Brief context of where this claim appears'),
            searchQuery: z
                .string()
                .describe(
                    'Suggested search query to verify this claim from authoritative sources'
                ),
        })
    ),
    totalClaims: z.number().describe('Total number of claims identified'),
    citedClaims: z
        .number()
        .describe('Number of claims that already have citations'),
})

/**
 * Schema for verification results
 */
const verificationResultSchema = z.object({
    score: z
        .number()
        .min(0)
        .max(100)
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
 * System prompt for claim identification phase
 */
const CLAIM_IDENTIFICATION_PROMPT = `You are a fact-checker for medical content. Your task is to identify claims that need source citations.

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

## Already Has Citation

A claim HAS a citation if it includes:
- A markdown link: [text](url)
- A direct URL reference
- Attribution like "According to [Organization]..." with a link

## Skip These

- General knowledge statements
- Descriptions of the clinic's own services
- Subjective opinions clearly marked as such
- Vague statements without specific claims

For each claim, suggest a search query that would find authoritative sources (ASPS, Mayo Clinic, medical journals, etc.).`

/**
 * System prompt for research and verification phase
 */
const FACT_VERIFICATION_RESEARCH_PROMPT = `You are a medical fact-checker with access to Google Search. Your task is to verify claims and find authoritative sources.

## Your Process

For each uncited claim, you will:
1. Use google_search to find authoritative sources
2. Prioritize sources in this order:
   - Tier 1: ASPS, FDA, NIH, CDC, PubMed
   - Tier 2: Mayo Clinic, Cleveland Clinic, Johns Hopkins
   - Tier 3: Healthline, WebMD (only if no better source)
3. Find the most credible source that supports (or corrects) the claim
4. Format a proper markdown citation

## Search Strategy

- **IMPORTANT**: Use the \`sites\` parameter in google_search to search across all trusted domains at once
- Do NOT manually add "site:" to your query string
- Pass the trusted domains array to the \`sites\` parameter
- This ensures results come from authoritative sources only
- Include medical terms in search queries
- Add organization names (ASPS, Mayo Clinic) to queries
- Use specific medical terminology
- Search for recent data when statistics are involved

Example tool call:
{
  "query": "mommy makeover recovery time",
  "sites": ["plasticsurgery.org", "mayoclinic.org", "fda.gov", ...],
  "maxResults": 5
}

## Citation Format

Create citations in this format:
- [descriptive anchor text](https://link-to-the-source)

## Important Notes

- If you cannot find a source, mark the claim as unverifiable
- If the claim appears inaccurate, note the correct information
- Always prefer peer-reviewed or official organization sources
- Today's date is ${new Date().toISOString().split('T')[0]}

Search for authoritative sources for each claim and compile your findings.`

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

    // Add domains array for tool use
    const allDomains = getTrustedDomains()
    const domainsArray = JSON.stringify(allDomains)

    return `## Trusted Sources for Citations

### Tier 1 (Highest Priority)
${tier1}

### Tier 2 (High Priority)
${tier2}

### Domains for Search Tool

When using google_search, pass these domains to the \`sites\` parameter:
${domainsArray}

This will search across ALL trusted sources simultaneously.

Prefer Tier 1 sources when available. Only use consumer health sites if no better source exists.`
}

/**
 * Run the fact and source verification agent
 *
 * This agent runs in two phases:
 * 1. Identify claims that need verification (no tool use)
 * 2. Research using Google Search to find sources (with tools)
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

    // Phase 1: Identify claims that need verification
    const identificationPrompt = `Analyze this blog post and identify all claims that need source citations:

**Title:** ${title}
**Primary Keyword:** ${primaryKeyword || 'Not specified'}

**Content:**
${content}

---

Identify all statistics, medical facts, outcome claims, timeline claims, and cost claims.
For each, note whether it already has a citation and suggest a search query to verify it.`

    const identificationResult = await coreGenerateObject({
        modelId,
        schema: claimIdentificationSchema,
        system: CLAIM_IDENTIFICATION_PROMPT,
        prompt: identificationPrompt,
        temperature,
    })

    const claims = identificationResult.object.claims
    const uncitedClaims = claims.filter((c) => !c.hasCitation)

    console.log(
        `[Fact Verifier] Found ${claims.length} claims, ${uncitedClaims.length} need sources`
    )

    // If all claims are cited, return perfect score
    if (uncitedClaims.length === 0) {
        const processingTimeMs = Date.now() - startTime
        return {
            agentName: 'fact-source-verifier',
            score: 100,
            issues: [],
            summary: `All ${claims.length} factual claims in the content have proper source citations.`,
            processingTimeMs,
            modelId,
        }
    }

    // Phase 2: Research uncited claims using Google Search
    const sourceContext = createSourceCollector()
    const googleSearchTool = createGoogleSearchTool(sourceContext)

    const trustedSourceContext = buildTrustedSourceContext()

    const researchPrompt = `Research and find authoritative sources for these uncited claims from the blog post "${title}":

${trustedSourceContext}

**Use these domains with the google_search \`sites\` parameter:**
${JSON.stringify(getTrustedDomains())}

---

## Claims Needing Sources

${uncitedClaims
    .map(
        (c, i) => `${i + 1}. **Claim:** "${c.claim}"
   - Type: ${c.claimType}
   - Context: ${c.context}
   - Suggested query: ${c.searchQuery}`
    )
    .join('\n\n')}

---

For each claim:
1. Use google_search to find an authoritative source
2. Verify the claim is accurate
3. Note the source URL and how to cite it

Search for sources now.`

    // Run research with tool calling
    let researchOutput = ''
    let searchCount = 0

    try {
        const researchResult = await generateText({
            model: openai(modelId),
            system: FACT_VERIFICATION_RESEARCH_PROMPT,
            prompt: researchPrompt,
            tools: { google_search: googleSearchTool },
            stopWhen: stepCountIs(MAX_SEARCH_STEPS),
            experimental_telemetry: telemetryConfig,
            temperature,
            onStepFinish: (event) => {
                if (event.toolCalls && event.toolCalls.length > 0) {
                    searchCount += event.toolCalls.length
                    console.log(
                        `[Fact Verifier] Searches performed: ${searchCount}`
                    )
                }
            },
        })

        researchOutput = researchResult.text
    } catch (error) {
        console.error('[Fact Verifier] Research phase error:', error)
        researchOutput =
            'Research phase encountered an error. Some claims may not have been verified.'
    }

    console.log(
        `[Fact Verifier] Research complete. Total searches: ${searchCount}`
    )
    console.log(
        `[Fact Verifier] Sources found: ${sourceContext.sources.length}`
    )

    // Phase 3: Generate final verification results
    const verificationPrompt = `Based on the research, generate the final verification report.

**Original Claims Needing Sources:**
${uncitedClaims.map((c, i) => `${i + 1}. "${c.claim}" (${c.claimType})`).join('\n')}

**Research Results:**
${researchOutput}

**Sources Found:**
${sourceContext.sources.map((s) => `- ${s.title}: ${s.url}`).join('\n') || 'None found'}

---

Generate a verification report with:
1. A score (0-100) based on citation coverage
2. Issues for each uncited claim with suggested citations
3. A summary of the verification

Scoring Guide:
- 90-100: All or nearly all claims have authoritative citations
- 70-89: Most claims cited, some minor gaps
- 50-69: About half the claims cited
- 30-49: Few claims cited
- 0-29: Very few or no citations

For issues:
- critical: Important medical facts or statistics without any citation
- warning: Claims that should have citations but are less critical
- suggestion: Claims where citations would help but aren't essential

For each issue, provide a complete suggestedFix with the exact markdown citation to add.`

    const verificationResult = await coreGenerateObject({
        modelId,
        schema: verificationResultSchema,
        system: `You are compiling a fact verification report. Generate issues with specific, actionable citation suggestions.`,
        prompt: verificationPrompt,
        temperature,
    })

    const processingTimeMs = Date.now() - startTime

    console.log(
        `[Fact Verifier] Complete. Score: ${verificationResult.object.score}/100, Issues: ${verificationResult.object.issues.length}`
    )

    return {
        agentName: 'fact-source-verifier',
        score: verificationResult.object.score,
        issues: verificationResult.object.issues as ReviewIssue[],
        summary: verificationResult.object.summary,
        processingTimeMs,
        modelId,
    }
}
