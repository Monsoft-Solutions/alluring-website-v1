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

type GenerateTopicsInput = {
    procedureFocus?: string
    contentType?: string
    targetAudience?: string
    existingTopics?: string[]
    additionalContext?: string
    selectedKeywords?: SelectedKeywords
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
    } = input

    // Check if we have keywords from Google Search Console
    const hasSelectedKeywords =
        selectedKeywords &&
        (selectedKeywords.primary || selectedKeywords.secondary.length > 0)

    let prompt = `Generate blog topic ideas for the following context:

**Procedure Focus:** ${procedureFocus || 'General plastic surgery (any procedure)'}

**Content Type Preference:** ${contentType || 'Any type (tutorials, guides, FAQs, comparisons, etc.)'}

**Target Audience:** ${targetAudience || 'Women 25-55 considering cosmetic procedures in Miami'}
`

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
2. **Primary Keyword**: The main keyword to target${hasSelectedKeywords ? ' (use the provided keywords when possible)' : ''}
3. **Search Intent**: Informational, Commercial, or Transactional
4. **Brief Description**: 1-2 sentences explaining what the post will cover
5. **Unique Angle**: What makes this perspective different from existing content
6. **Target Audience**: Specific description of who this content is for (e.g., "Women 30-45 in Miami considering their first BBL surgery")
7. **Pain Points**: 2-4 key concerns, questions, or problems this content addresses for the target audience

Focus on topics that:
- Address real patient questions and concerns
- Have strong search potential
- Can showcase expertise and build trust
- Are specific enough to write actionable content
- Align with the "Luxury Made Affordable" brand positioning${hasSelectedKeywords ? '\n- Incorporate the provided Google Search Console keywords' : ''}

Generate the topics now:`

    return prompt
}
