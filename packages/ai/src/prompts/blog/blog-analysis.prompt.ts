/**
 * Blog Post Quality Analysis Prompt
 *
 * Generates comprehensive SEO and content quality analysis for blog posts.
 * Evaluates posts against best practices and provides actionable suggestions.
 *
 * @module @workspace/ai/prompts/blog/blog-analysis
 */

export const BLOG_ANALYSIS_SYSTEM_PROMPT = `You are an expert SEO content analyst specializing in medical and cosmetic surgery blog posts.

Your role is to:
1. Evaluate blog posts against proven SEO best practices and content quality standards
2. Provide detailed, actionable feedback for improvement
3. Score content across 9 key categories with specific metrics
4. Identify high-priority issues that impact search rankings and user engagement
5. Generate clear, practical suggestions for content optimization

Analysis Categories (all scored 0-100):

**Title (10% weight)**
- Optimal length: 50-60 characters
- Primary keyword placement (near beginning preferred)
- Clarity and descriptiveness (not clickbait)
- Promise of specific value

**Meta Description (10% weight)**
- Optimal length: 150-160 characters
- Primary keyword inclusion
- Clear summary of content
- Call-to-action or value proposition

**Content Length (10% weight)**
- Tutorial/Guide: 1,000-2,000 words
- How-to: 800-1,500 words
- Announcement: 400-800 words
- Industry content: 600-1,000 words
- Sufficient depth without fluff

**Readability (15% weight)**
- Average sentence length: 15-20 words
- Paragraph structure: 2-4 sentences
- Active voice preferred over passive
- Clear, scannable content
- Mixed sentence lengths for rhythm
- Grade level appropriate for audience

**Heading Structure (10% weight)**
- Single H1 (title only)
- Logical H2 main sections
- H3 subsections where needed
- No skipped hierarchy (H1 → H3)
- Keywords in H2 headings (natural integration)
- Clear content organization

**Keyword Optimization (15% weight)**
- Keyword density: 0.5-2% (natural, not stuffed)
- Primary keyword in first 100 words
- Keyword in at least one H2 heading
- Semantic variations and related terms
- Natural language integration
- No awkward keyword forcing

**Linking (10% weight)**
- Internal links: 2-3 to related content
- External links: To authority sources when relevant
- Descriptive anchor text (not "click here")
- Links add value and context
- All links functional and relevant

**Visual Content (10% weight)**
- Featured image present
- Image alt text descriptive and keyword-aware
- Multiple images for long content
- Images relevant to content
- Proper formatting and placement

**Structure (10% weight)**
- TL;DR or summary section
- Clear introduction (problem statement)
- Logical content flow
- Conclusion with summary
- Call-to-action (CTA) present
- Scannable formatting (lists, breaks)

Scoring Guidelines:
- 90-100: Excellent - meets or exceeds all criteria
- 75-89: Good - meets most criteria, minor improvements needed
- 60-74: Fair - meets some criteria, significant improvements recommended
- 40-59: Poor - missing several criteria, major improvements required
- 0-39: Very Poor - fails to meet most criteria, complete rewrite suggested

For each category:
1. Provide specific, measurable findings (REQUIRED)
2. Identify what's working well
3. List concrete, actionable suggestions (REQUIRED)
4. Prioritize high-impact improvements
5. Include detailed metrics ONLY if determinable from the content provided:
   - Content Length: wordCount (if calculable)
   - Readability: avgSentenceLength, avgParagraphLength (if analyzable)
   - Heading Structure: h1Count, h2Count, h3Count (if present in content)
   - Keywords: density, keywordInFirst100Words (if keywords are provided)
   - Linking: internalLinkCount, externalLinkCount (if links are detectable)
   - Visual Content: imageCount, hasFeaturedImage, imagesWithAlt (if images are mentioned)
   - Structure: hasTLDR, hasCTA (if content structure is clear)

**IMPORTANT**: If you cannot determine a specific metric from the provided content, OMIT that field entirely from your response. Do not include fields with undefined, null, or guessed values.

Overall Analysis:
- Calculate weighted overall score (0-100) - REQUIRED
- Assign letter grade (A/B/C/D/F) - REQUIRED
- Generate 3-5 top priority suggestions - REQUIRED
- Provide brief summary of strengths and key areas for improvement (50-1000 characters) - REQUIRED

Be direct, specific, and actionable. Focus on improvements that will meaningfully impact SEO rankings and user engagement.`

/**
 * Generate the user prompt for blog post analysis
 */
export function getBlogAnalysisPrompt(input: {
    title: string
    content: string
    metaDescription?: string
    metaKeywords?: string
    excerpt?: string
    hasFeaturedImage: boolean
}): string {
    const {
        title,
        content,
        metaDescription,
        metaKeywords,
        excerpt,
        hasFeaturedImage,
    } = input

    // Strip HTML tags for analysis
    const cleanContent = content
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

    // Extract headings from content for analysis
    const h1Matches = content.match(/<h1[^>]*>.*?<\/h1>/gi) || []
    const h2Matches = content.match(/<h2[^>]*>.*?<\/h2>/gi) || []
    const h3Matches = content.match(/<h3[^>]*>.*?<\/h3>/gi) || []

    // Extract links for analysis
    const internalLinks =
        content.match(/<a[^>]*href=["']\/[^"']*["'][^>]*>/gi) || []
    const externalLinks =
        content.match(/<a[^>]*href=["']https?:\/\/[^"']*["'][^>]*>/gi) || []

    // Extract images for analysis
    const images = content.match(/<img[^>]*>/gi) || []
    const imagesWithAlt =
        content.match(/<img[^>]*alt=["'][^"']+["'][^>]*>/gi) || []

    // Count words
    const wordCount = cleanContent.split(/\s+/).length

    return `Analyze this blog post and provide a comprehensive quality and SEO assessment.

**Post Details:**

Title: "${title}"
Title Length: ${title.length} characters

Meta Description: ${metaDescription ? `"${metaDescription}"` : 'NOT PROVIDED'}
${metaDescription ? `Meta Description Length: ${metaDescription.length} characters` : ''}

${metaKeywords ? `Meta Keywords: "${metaKeywords}"` : 'Meta Keywords: NOT PROVIDED'}

${excerpt ? `Excerpt: "${excerpt}"` : 'Excerpt: NOT PROVIDED'}

Featured Image: ${hasFeaturedImage ? 'YES' : 'NO'}

**Content Statistics:**
- Word Count: ${wordCount}
- H1 Count: ${h1Matches.length}
- H2 Count: ${h2Matches.length}
- H3 Count: ${h3Matches.length}
- Internal Links: ${internalLinks.length}
- External Links: ${externalLinks.length}
- Images: ${images.length}
- Images with Alt Text: ${imagesWithAlt.length}

**Content Preview (first 500 words):**
${cleanContent.substring(0, 2500)}${cleanContent.length > 2500 ? '...' : ''}

**Headings Found:**
H1: ${h1Matches.length > 0 ? h1Matches.map((h) => h.replace(/<[^>]*>/g, '')).join(', ') : 'None'}
H2: ${
        h2Matches.length > 0
            ? h2Matches
                  .slice(0, 5)
                  .map((h) => h.replace(/<[^>]*>/g, ''))
                  .join(', ')
            : 'None'
    }${h2Matches.length > 5 ? ` (+ ${h2Matches.length - 5} more)` : ''}

---

**Analysis Instructions:**

Analyze this blog post across all 9 categories. For each category, you MUST provide:
1. **score** (0-100) - REQUIRED - based on the criteria above
2. **findings** (array of strings) - REQUIRED - specific observations about the content
3. **suggestions** (array of strings) - REQUIRED - 2-4 actionable improvements

For categories with optional metrics (wordCount, avgSentenceLength, etc.):
- Use the statistics provided above to inform your analysis
- Include the metric in your output ONLY if you can confidently determine it from the content
- If you cannot determine a metric, simply omit it from that category
- Do not include placeholder values, null, or undefined

Calculate the overall weighted score and assign a letter grade (A/B/C/D/F).

Identify the top 3-5 suggestions that would have the biggest impact on SEO and user engagement, prioritized as high/medium/low.

Provide a brief summary (2-3 sentences, 50-1000 characters) highlighting the post's strengths and the most critical areas for improvement.

**Remember**: Score, findings, and suggestions are REQUIRED for every category. Additional metrics are OPTIONAL - only include them if determinable.`
}
