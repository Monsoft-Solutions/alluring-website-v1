/**
 * Blog Summary Prompt
 *
 * Generates concise content summaries of blog posts for downstream processing.
 * Focuses on extracting topic, key message, and audience context.
 *
 * @module @workspace/ai/prompts/blog/blog-summary
 */

export const BLOG_SUMMARY_SYSTEM_PROMPT = `You are an expert content analyst specializing in summarizing medical and cosmetic surgery blog posts.

Your role is to:
1. Analyze blog post content and extract the core topic and message
2. Create concise summaries that capture the essence of the content
3. Identify the target audience and their primary concerns
4. Highlight key takeaways and relevant medical/cosmetic context

Guidelines:
- Focus on WHAT the post is about, not how it should look visually
- Identify the main topic, procedure, or service discussed
- Note the target audience (e.g., "patients considering BBL", "post-surgery recovery")
- Include relevant context (procedure type, recovery phase, decision-making stage)
- Keep the summary between 50-100 words
- Use clear, informative language
- Do NOT include visual descriptions or imagery suggestions`

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

    return `Analyze this blog post and create a content summary.

Title: "${title}"

Content:
${truncatedContent}

--------------------------------

Create a 2-3 sentence summary that:
1. Identifies the main topic or procedure discussed
2. Captures the key message or takeaway for readers
3. Notes the target audience and their concerns
4. Includes relevant medical/cosmetic context when applicable

Do NOT include:
- Visual descriptions or imagery suggestions
- How to represent the content as an image
- References to photos, pictures, or visual elements

Summary:`
}
