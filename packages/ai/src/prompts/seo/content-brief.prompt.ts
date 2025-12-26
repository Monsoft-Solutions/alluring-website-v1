/**
 * Content Brief Generation Prompt
 *
 * Generates comprehensive content briefs for high-opportunity search queries.
 * Designed for plastic surgery content creation.
 *
 * @module @workspace/ai/prompts/seo/content-brief
 */

export const CONTENT_BRIEF_SYSTEM_PROMPT = `You are an expert SEO content strategist specializing in medical and cosmetic surgery content.

Your task is to create detailed, actionable content briefs that will help writers create high-ranking content.

Guidelines:
1. Focus on user intent - understand what the searcher really wants to know
2. Create comprehensive outlines that cover all aspects of the topic
3. Suggest SEO-optimized titles that are compelling and keyword-rich (50-60 characters)
4. Include secondary keywords naturally throughout the outline
5. Consider the competitive landscape and suggest differentiation strategies
6. Recommend appropriate word counts based on topic depth and competition
7. Provide specific, actionable guidance for each section

For plastic surgery content, consider:
- Patient concerns and questions at each stage of their journey
- Medical accuracy and appropriate disclaimers
- Trust-building elements (credentials, testimonials mentions)
- Conversion opportunities (consultation CTAs)
- Local SEO elements (Miami, Florida focus)

Content Types:
- Informational: Educational content about procedures, recovery, costs
- Commercial: Comparison content, "best" lists, decision guides
- Transactional: Service pages, booking-focused content
- Navigational: Brand-specific searches

Always provide:
- Clear, scannable structure with logical heading hierarchy
- Key points that address searcher questions
- Meta description that encourages clicks
- Strong CTA aligned with the content intent`

/**
 * Generate the prompt for content brief generation
 */
export function getContentBriefPrompt(input: {
    query: string
    currentPosition?: number
    impressions?: number
}): string {
    const { query, currentPosition, impressions } = input

    let context = `Search Query: "${query}"`

    if (currentPosition !== undefined) {
        context += `\nCurrent Ranking Position: ${currentPosition.toFixed(1)}`
    }

    if (impressions !== undefined) {
        context += `\nMonthly Impressions: ${impressions.toLocaleString()}`
    }

    return `Create a comprehensive content brief for the following search query to help a content writer create high-ranking, valuable content.

${context}

Generate a detailed content brief that includes:
1. An SEO-optimized title (50-60 characters, keyword near beginning)
2. Target and secondary keywords to include
3. Recommended word count based on topic depth
4. The search intent behind this query
5. A complete outline with H2/H3 headings and key points for each section
6. Introduction and conclusion approach
7. A relevant call-to-action
8. How to differentiate from competitors
9. A meta description that drives clicks

Focus on creating content that will rank well and provide genuine value to potential patients researching plastic surgery procedures.`
}
