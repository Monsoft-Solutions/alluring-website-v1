/**
 * Generate Blog Topics Prompt
 *
 * AI prompt for generating blog post topic ideas based on procedure focus,
 * content type, and target audience.
 *
 * @module @workspace/ai/prompts/blog/generate-topics
 */

export const GENERATE_TOPICS_SYSTEM_PROMPT = `You are an expert content strategist specializing in cosmetic and plastic surgery marketing.

Your role is to:
1. Generate compelling, SEO-optimized blog topic ideas for a luxury plastic surgery clinic
2. Focus on topics that address patient concerns, questions, and decision-making journey
3. Create ideas that balance educational value with commercial intent
4. Target keywords with strong search potential in the cosmetic surgery niche

Business Context:
- Business: Alluring Plastic Surgery - luxury cosmetic surgery clinic in Miami, FL
- Target Audience: Women 25-55, value quality, seek affordability, 60%+ mobile users
- Brand Voice: Clear, direct, technical but accessible, confident but not arrogant
- Tagline: "Luxury Surgeries Made Affordable"

Content Strategy:
- Mix of informational content (recovery guides, what-to-expect) and commercial content (cost guides, comparison)
- Focus on Miami-specific searches when relevant
- Address common patient fears and questions
- Showcase expertise without being salesy

Keyword Focus Areas by Procedure:
- BBL: "bbl before and after", "bbl miami", "bbl recovery", "bbl cost miami"
- Mommy Makeover: "mommy makeover miami", "mommy makeover cost", "mommy makeover recovery"
- Tummy Tuck: "tummy tuck miami", "tummy tuck before after", "tummy tuck recovery"
- Breast Procedures: "breast augmentation miami", "breast lift miami", "breast augmentation financing"
- Liposuction: "liposuction miami", "lipo before after", "liposuction vs coolsculpting"
- General: "plastic surgery miami", "cosmetic surgery financing", "plastic surgery recovery"

Output Requirements:
- Generate 5-8 unique topic ideas
- Each topic should have clear SEO potential
- Include a mix of informational and commercial intent
- Topics should be specific enough to write, not too broad
- Consider what questions patients commonly ask`

type SelectedKeywords = {
    primary: string | null
    secondary: string[]
}

/**
 * Context hints for enhanced topic generation
 */
type ContextHints = {
    /** Procedure slug for context lookup */
    procedureSlug?: string
    /** Search intent filter */
    searchIntent?: 'informational' | 'commercial' | 'transactional' | 'mixed'
    /** Target audience description */
    targetAudience?: string
    /** Unique angle or perspective */
    uniqueAngle?: string
    /** Preferred content type */
    contentType?: string
}

/**
 * Procedure-specific context for AI enrichment
 */
type ProcedureContext = {
    name: string
    slug: string
    relatedKeywords: string[]
    commonPainPoints: string[]
    targetAudienceHints: string[]
}

/** Live Search Console demand seed (mirrors GscTopicSeed in functions) */
type GscSeed = {
    query: string
    impressions: number
    clicks: number
    ctr: number
    position: number
    source: 'opportunity' | 'gap' | 'decay'
}

type GenerateTopicsInput = {
    procedureFocus?: string
    contentType?: string
    targetAudience?: string
    existingTopics?: string[]
    additionalContext?: string
    selectedKeywords?: SelectedKeywords
    gscSeeds?: GscSeed[]
    contextHints?: ContextHints
    procedureContext?: ProcedureContext
}

/** One prompt line per seed: metrics + label */
function formatGscSeed(seed: GscSeed): string {
    const ctrPct = (seed.ctr * 100).toFixed(1)
    return `- "${seed.query}" [${seed.source}] — ${seed.impressions.toLocaleString('en-US')} impressions, ${seed.clicks} clicks, CTR ${ctrPct}%, position ${seed.position.toFixed(1)}`
}

/**
 * Get search intent guidance text for the prompt
 */
function getSearchIntentGuidance(intent: ContextHints['searchIntent']): string {
    switch (intent) {
        case 'informational':
            return `
**Search Intent Focus: INFORMATIONAL**
Generate topics that are purely educational:
- Recovery guides and timelines
- What-to-expect articles
- How-to guides and tutorials
- FAQ-style content answering patient questions
- Safety and preparation information
Avoid commercial or sales-focused angles.`

        case 'commercial':
            return `
**Search Intent Focus: COMMERCIAL**
Generate topics for research-phase patients:
- Cost breakdowns and pricing guides
- Procedure comparison articles (e.g., "BBL vs Hip Dips")
- "Best of" and review-style content
- Surgeon selection guides
- Financing and payment option guides
Focus on helping patients make informed decisions.`

        case 'transactional':
            return `
**Search Intent Focus: TRANSACTIONAL**
Generate topics for ready-to-book patients:
- Consultation preparation guides
- "What to ask your surgeon" content
- Booking and scheduling information
- Pre-surgery checklist content
- Miami-specific location content
Focus on moving patients toward action.`

        case 'mixed':
        default:
            return `
**Search Intent Focus: BALANCED MIX**
Generate a diverse mix of topics:
- 2-3 informational (educational, recovery, how-to)
- 2-3 commercial (cost, comparison, research)
- 1-2 transactional (booking, consultation, action-oriented)`
    }
}

/**
 * Generate the user prompt for topic ideation
 */
export function getGenerateTopicsPrompt(input: GenerateTopicsInput): string {
    const {
        procedureFocus,
        contentType,
        targetAudience,
        existingTopics,
        additionalContext,
        selectedKeywords,
        gscSeeds,
        contextHints,
        procedureContext,
    } = input

    // Check if we have keywords from Google Search Console
    const hasSelectedKeywords =
        selectedKeywords &&
        (selectedKeywords.primary || selectedKeywords.secondary.length > 0)

    // Determine effective values (contextHints takes precedence over legacy fields)
    const effectiveProcedure =
        procedureContext?.name || procedureFocus || 'General plastic surgery'
    const effectiveContentType =
        contextHints?.contentType || contentType || 'Any type'
    const effectiveAudience =
        contextHints?.targetAudience ||
        targetAudience ||
        'Women 25-55 considering cosmetic procedures in Miami'

    let prompt = `Generate blog topic ideas for the following context:

**Procedure Focus:** ${effectiveProcedure}

**Content Type Preference:** ${effectiveContentType}

**Target Audience:** ${effectiveAudience}
`

    // Add procedure-specific context if available
    if (procedureContext) {
        prompt += `
**PROCEDURE-SPECIFIC INTELLIGENCE:**
The following data is based on real patient concerns and search behavior for ${procedureContext.name}:

*Related Keywords to Target:*
${procedureContext.relatedKeywords.map((k) => `- "${k}"`).join('\n')}

*Common Patient Pain Points & Concerns:*
${procedureContext.commonPainPoints.map((p) => `- ${p}`).join('\n')}

*Target Audience Segments:*
${procedureContext.targetAudienceHints.map((a) => `- ${a}`).join('\n')}

Use this intelligence to generate highly relevant, patient-focused topics that address real concerns.
`
    }

    // Add search intent guidance
    if (contextHints?.searchIntent) {
        prompt += getSearchIntentGuidance(contextHints.searchIntent)
        prompt += '\n'
    }

    // Add unique angle if provided
    if (contextHints?.uniqueAngle) {
        prompt += `
**Unique Angle/Perspective:**
${contextHints.uniqueAngle}
Incorporate this perspective into the generated topics where appropriate.
`
    }

    // Add selected keywords from Google Search Console
    if (hasSelectedKeywords) {
        prompt += `
**IMPORTANT - Real Search Keywords from Google Search Console:**
These are actual search queries that people are using to find the website. Generate topics that target these specific keywords:
`
        if (selectedKeywords.primary) {
            prompt += `
- **Primary Keyword (main focus):** "${selectedKeywords.primary}"
`
        }
        if (selectedKeywords.secondary.length > 0) {
            prompt += `
- **Secondary Keywords (related terms):**
${selectedKeywords.secondary.map((k) => `  - "${k}"`).join('\n')}
`
        }
        prompt += `
Each generated topic MUST incorporate at least one of these keywords. The primary keyword should be the main focus of at least 2-3 topics.
`
    }

    // Live Search Console demand seeds (headless/autopilot sourcing)
    if (gscSeeds && gscSeeds.length > 0) {
        prompt += `
**LIVE SEARCH DEMAND FROM GOOGLE SEARCH CONSOLE (strongest signal — prioritize):**
Real queries from the last weeks, labeled by opportunity type:
- [opportunity] = high impressions but low CTR — searchers see the site and don't click
- [gap] = no dedicated page ranks for it — unclaimed demand
- [decay] = rankings recently dropped — content needs freshness

${gscSeeds.map(formatGscSeed).join('\n')}

Ground your topics in these seeds:
- Prefer seeds with high impressions and weak positions (11-30) — those are winnable with a dedicated post.
- For every topic derived from a seed, set sourceQuery to the EXACT seed query string.
- Topics not derived from any seed must set sourceQuery to null.
`
    }

    if (existingTopics && existingTopics.length > 0) {
        prompt += `
**Existing Topics to Avoid (don't duplicate these):**
${existingTopics.map((t) => `- ${t}`).join('\n')}
`
    }

    if (additionalContext) {
        prompt += `
**Additional Context:**
${additionalContext}
`
    }

    prompt += `
**Your Task:**
Generate 5-8 unique blog topic ideas. For each topic, provide:

1. **Title**: A compelling, SEO-friendly title (50-60 characters ideal)
2. **Primary Keyword**: The main keyword to target${hasSelectedKeywords ? ' (use the provided keywords when possible)' : ''}${procedureContext ? ' (incorporate procedure-specific keywords)' : ''}
3. **Search Intent**: Informational, Commercial, or Transactional
4. **Brief Description**: 1-2 sentences explaining what the post will cover
5. **Unique Angle**: What makes this perspective different from existing content
6. **Target Audience**: Specific description of who this content is for
7. **Pain Points**: 2-4 key concerns, questions, or problems this content addresses

Focus on topics that:
- Address real patient questions and concerns${procedureContext ? ' (use the pain points provided)' : ''}
- Have strong search potential
- Can showcase expertise and build trust
- Are specific enough to write actionable content
- Align with the "Luxury Made Affordable" brand positioning${hasSelectedKeywords ? '\n- Incorporate the provided Google Search Console keywords' : ''}${contextHints?.searchIntent && contextHints.searchIntent !== 'mixed' ? `\n- Match the ${contextHints.searchIntent} search intent focus` : ''}

Generate the topics now:`

    return prompt
}
