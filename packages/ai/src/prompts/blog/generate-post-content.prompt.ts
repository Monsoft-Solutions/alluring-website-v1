/**
 * Generate Blog Post Content Prompt
 *
 * AI prompt for generating full blog post content from an idea and outline.
 * Follows brand guidelines, SEO best practices, and content structure.
 *
 * @module @workspace/ai/prompts/blog/generate-post-content
 */

export const GENERATE_POST_CONTENT_SYSTEM_PROMPT = `You are an expert content writer for a luxury plastic surgery clinic in Miami, FL.

Your role is to write high-quality, SEO-optimized blog posts that:
1. Educate patients about cosmetic procedures
2. Build trust through expertise and transparency
3. Drive organic traffic through natural keyword integration
4. Follow the brand voice and content guidelines exactly

Business Context:
- Business: Alluring Plastic Surgery - luxury cosmetic surgery clinic
- Location: Miami, FL (serves locals + medical tourists from Latin America/Caribbean)
- Tagline: "Luxury Surgeries Made Affordable"
- Target Audience: Women 25-55, value quality, seek affordability

Brand Voice Guidelines:

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

Content Structure Requirements:

1. **TL;DR Section**: Start with key takeaways (2-3 bullet points)

2. **Introduction (100-150 words)**:
   - State the problem/question clearly
   - Include primary keyword naturally
   - Preview what reader will learn
   - Set expectations

3. **Body Sections**:
   - Use H2 for main sections
   - Use H3 for subsections
   - Keep paragraphs short (3-4 sentences max)
   - Use bullet points for lists
   - Include relevant statistics when available

4. **Conclusion**:
   - Summarize key points
   - Provide clear next steps
   - End with a natural CTA opportunity (don't write the CTA itself)

SEO Writing Guidelines:
- Primary keyword in first 100 words
- Primary keyword in at least one H2
- Natural keyword density (don't stuff)
- Use semantic variations
- Write for humans first, search engines second

Formatting:
- Use markdown format
- H1 is the title (don't include in content, it's separate)
- Start content with TL;DR section
- Use ** for bold important terms
- Use \`code\` format only for technical terms if relevant

Medical Content Note:
- Be informative but not prescriptive
- Always suggest consulting with a board-certified surgeon
- Don't make specific medical claims or guarantees
- Focus on general information and what to expect`

type GeneratePostContentInput = {
    title: string
    topic: string
    primaryKeyword: string
    secondaryKeywords?: string[]
    targetAudience?: string
    uniqueAngle?: string
    outline: {
        tldr: string[]
        introduction: { hook: string; preview: string }
        sections: Array<{
            title: string
            description: string
            keyPoints?: string[]
            subsections?: Array<{ title: string; description?: string }>
        }>
        conclusion: {
            summaryPoints: string[]
            nextSteps: string
        }
    }
    estimatedWordCount?: number
}

/**
 * Generate the user prompt for content creation
 */
export function getGeneratePostContentPrompt(
    input: GeneratePostContentInput
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
    } = input

    let sectionsText = ''
    for (const section of outline.sections) {
        sectionsText += `\n### ${section.title}\n${section.description}\n`
        if (section.keyPoints?.length) {
            sectionsText += `Key points to cover:\n${section.keyPoints.map((p) => `- ${p}`).join('\n')}\n`
        }
        if (section.subsections?.length) {
            sectionsText += `Subsections:\n${section.subsections.map((s) => `- ${s.title}${s.description ? `: ${s.description}` : ''}`).join('\n')}\n`
        }
    }

    return `Write a complete blog post based on the following brief:

**Title:** ${title}

**Topic:** ${topic}

**Primary Keyword:** ${primaryKeyword}

**Secondary Keywords:** ${secondaryKeywords?.join(', ') || 'None'}

**Target Audience:** ${targetAudience || 'Women 25-55 considering cosmetic procedures'}

**Unique Angle:** ${uniqueAngle || 'Comprehensive, expert perspective'}

**Target Word Count:** ${estimatedWordCount || 1500} words

---

**OUTLINE TO FOLLOW:**

**TL;DR Points:**
${outline.tldr.map((p) => `- ${p}`).join('\n')}

**Introduction:**
Hook: ${outline.introduction.hook}
Preview: ${outline.introduction.preview}

**Sections:**
${sectionsText}

**Conclusion:**
Summary points: ${outline.conclusion.summaryPoints.join('; ')}
Next steps: ${outline.conclusion.nextSteps}

---

**Your Task:**
Write the complete blog post following the outline above. 

Requirements:
1. Start with the TL;DR section (use **TL;DR** as the header)
2. Follow the section structure exactly as outlined
3. Include the primary keyword "${primaryKeyword}" naturally in:
   - First 100 words
   - At least one H2 heading
   - Conclusion
4. Write in markdown format
5. Keep paragraphs short (3-4 sentences)
6. Use bullet points where appropriate
7. Maintain the brand voice throughout
8. Target approximately ${estimatedWordCount || 1500} words

Do NOT include:
- The title (H1) - it's handled separately
- Actual CTA blocks - just end naturally
- Author bylines or dates
- Medical disclaimers (handled elsewhere)

Write the complete blog post now:`
}
