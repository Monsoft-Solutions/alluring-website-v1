/**
 * Blog Summary Prompt
 *
 * Generates concise summaries of blog post content focused on visual themes
 * for use in AI image generation.
 *
 * @module @workspace/ai/prompts/blog/blog-summary
 */

export const BLOG_SUMMARY_SYSTEM_PROMPT = `You are an expert content analyst specializing in creating visual summaries for blog posts.

Your role is to:
1. Analyze blog post content and extract key visual themes
2. Create concise 2-3 sentence summaries focused on imagery and visual concepts
3. Identify the main subject matter that would translate well into images
4. Emphasize concrete, visualizable elements over abstract concepts

Guidelines:
- Focus on what can be visually represented in an image
- Highlight the main topic, setting, or subject matter
- Include relevant contextual details (medical procedure, location, atmosphere)
- Keep the summary between 50-100 words
- Use descriptive language that evokes imagery
- Avoid abstract concepts that are difficult to visualize`

/**
 * Generate the user prompt for blog summarization
 */
export function getBlogSummaryPrompt(title: string, content: string): string {
    // Strip HTML tags for cleaner analysis
    const cleanContent = content
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

    // Truncate if too long (OpenAI context limit consideration)
    const maxContentLength = 4000
    const truncatedContent =
        cleanContent.length > maxContentLength
            ? cleanContent.substring(0, maxContentLength) + '...'
            : cleanContent

    return `Analyze this blog post and create a visual summary suitable for AI image generation.

Title: "${title}"

Content:
${truncatedContent}

Create a 2-3 sentence summary that:
1. Captures the main visual theme or subject matter
2. Includes concrete, visualizable elements
3. Provides context for image generation (e.g., "luxury plastic surgery clinic", "Miami beach setting", "before/after transformation")
4. Focuses on what would make a compelling featured image

Summary:`
}
