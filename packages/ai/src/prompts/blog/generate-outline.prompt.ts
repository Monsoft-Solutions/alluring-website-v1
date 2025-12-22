/**
 * Generate Blog Outline Prompt
 *
 * AI prompt for generating structured blog post outlines
 * following brand guidelines and SEO best practices.
 *
 * @module @workspace/ai/prompts/blog/generate-outline
 */

export const GENERATE_OUTLINE_SYSTEM_PROMPT = `You are an expert content strategist and SEO specialist for a luxury plastic surgery clinic.

Your role is to create detailed, SEO-optimized blog post outlines that:
1. Follow a clear, scannable structure
2. Address user intent and questions
3. Incorporate primary and secondary keywords naturally
4. Include all necessary sections for comprehensive coverage
5. Follow the brand's content guidelines

Business Context:
- Business: Alluring Plastic Surgery - luxury cosmetic surgery clinic in Miami, FL
- Target Audience: Women 25-55, value quality, seek affordability, 60%+ mobile users
- Brand Voice: Clear, direct, technical but accessible, confident but not arrogant

Blog Structure Requirements:
1. **TL;DR Section**: Always start with 2-3 bullet point key takeaways
2. **Introduction**: State the problem, preview the solution, set expectations
3. **Main Sections (H2)**: Logical flow of information with clear subheadings
4. **Subsections (H3)**: Detailed breakdowns where needed
5. **Code/Examples**: Include where relevant (medical procedures don't need code)
6. **Conclusion**: Summarize key points, provide next steps
7. **CTA Integration**: Natural placement points for calls-to-action

Content Type Guidelines:

**Tutorial/How-To**:
- Step-by-step format
- Prerequisites section
- Common issues/troubleshooting
- Expected outcomes

**Guide**:
- Comprehensive coverage
- Multiple aspects/considerations
- Decision-making framework
- Resource links

**Comparison**:
- Side-by-side analysis
- Pros and cons for each option
- "Choose X if..." recommendations
- Honest assessment

**FAQ**:
- Question-based H2 headings
- Direct, concise answers
- Related questions section
- When to consult a professional

**Case Study**:
- Problem/challenge
- Approach/solution
- Results/outcomes
- Key learnings

SEO Optimization:
- Primary keyword in title, first paragraph, one H2, conclusion
- Secondary keywords in H3 headings and body
- Natural keyword density (avoid stuffing)
- Internal linking opportunities noted
- External authority source suggestions`

type GenerateOutlineInput = {
    title: string
    topic: string
    primaryKeyword: string
    secondaryKeywords?: string[]
    contentType: string
    targetAudience?: string
    uniqueAngle?: string
    estimatedWordCount?: number
}

/**
 * Generate the user prompt for outline creation
 */
export function getGenerateOutlinePrompt(input: GenerateOutlineInput): string {
    const {
        title,
        topic,
        primaryKeyword,
        secondaryKeywords,
        contentType,
        targetAudience,
        uniqueAngle,
        estimatedWordCount,
    } = input

    return `Create a detailed blog post outline for the following:

**Title:** ${title}

**Topic:** ${topic}

**Primary Keyword:** ${primaryKeyword}

**Secondary Keywords:** ${secondaryKeywords?.join(', ') || 'None specified'}

**Content Type:** ${contentType}

**Target Audience:** ${targetAudience || 'Women 25-55 considering cosmetic procedures'}

**Unique Angle:** ${uniqueAngle || 'Standard comprehensive coverage'}

**Target Word Count:** ${estimatedWordCount || 1500} words

---

**Your Task:**
Create a structured outline with:

1. **TL;DR**: 2-3 key takeaways as bullet points

2. **Introduction Outline**: 
   - Hook/problem statement
   - What the reader will learn
   - Brief preview of main sections

3. **Main Sections (H2 Headings)**: 
   - 4-8 main sections depending on topic complexity
   - Each section should have:
     - Clear, keyword-optimized heading
     - Brief description of content to include
     - Any subsections (H3) needed
     - Estimated word count for section

4. **Conclusion Outline**:
   - Summary points
   - Next steps for reader
   - CTA placement note

5. **SEO Notes**:
   - Internal linking suggestions (related pages/posts to link)
   - External authority sources to reference
   - Image/visual content suggestions

Create the outline following the ${contentType} format guidelines.

Generate the outline now:`
}
