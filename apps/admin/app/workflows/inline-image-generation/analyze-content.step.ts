/**
 * Analyze Content Step
 *
 * Durable workflow step that analyzes blog content and generates image prompts.
 * This step fetches the blog post, runs the AI analysis pipeline, and returns
 * opportunities with generated prompts ready for image generation.
 *
 * @module @admin/app/workflows/inline-image-generation/analyze-content
 */

import { db } from '@workspace/db/client'
import { blogPost } from '@workspace/db/schema/blog'
import { eq } from 'drizzle-orm'

import { runAutoInlineImagePipeline } from '@workspace/ai/pipelines'
import type {
    GeneratedInlineImage,
    InlineImageAnalysis,
    InlineImageTypeValue,
    PhotoStyleValue,
} from '@workspace/ai'

export type AnalyzeContentStepInput = {
    postId: string
    maxImages: number
}

export type AnalyzeContentStepResult = {
    success: boolean
    postTitle?: string
    /** Post slug, forwarded so generated images get SEO-friendly storage paths */
    postSlug?: string
    /** Primary keyword, forwarded for alt text generation */
    primaryKeyword?: string
    analysis?: InlineImageAnalysis
    opportunities: Array<{
        opportunityId: string
        prompt: string
        imageType: InlineImageTypeValue
        photoStyle?: PhotoStyleValue
        insertAfterText: string
        altText: string
    }>
    error?: string
}

/**
 * Analyzes blog content and generates image prompts for identified opportunities.
 *
 * This is a durable step that will be retried automatically on failure.
 */
export async function analyzeContentStep(
    input: AnalyzeContentStepInput
): Promise<AnalyzeContentStepResult> {
    'use step'

    const { postId, maxImages } = input

    console.log(`[Workflow Step] Analyzing content for post: ${postId}`)

    // Fetch post from database
    const [post] = await db
        .select({
            id: blogPost.id,
            title: blogPost.title,
            slug: blogPost.slug,
            content: blogPost.content,
            primaryKeyword: blogPost.primaryKeyword,
        })
        .from(blogPost)
        .where(eq(blogPost.id, postId))
        .limit(1)

    if (!post) {
        return {
            success: false,
            opportunities: [],
            error: 'Post not found',
        }
    }

    if (!post.content || post.content.length < 100) {
        return {
            success: false,
            postTitle: post.title,
            opportunities: [],
            error: 'Post content too short (minimum 100 characters)',
        }
    }

    const postSlug = post.slug || undefined
    const primaryKeyword = post.primaryKeyword || undefined

    // Run the AI analysis pipeline
    const pipelineResult = await runAutoInlineImagePipeline({
        content: post.content,
        title: post.title,
        blogPostId: postId,
        maxImages,
    })

    if (!pipelineResult.success || !pipelineResult.analysis) {
        return {
            success: false,
            postTitle: post.title,
            opportunities: [],
            error: pipelineResult.error || 'Analysis failed',
        }
    }

    // Extract pending images with prompts
    const pendingImages = pipelineResult.generatedImages.filter(
        (img): img is GeneratedInlineImage & { prompt: string } =>
            img.status === 'pending' && !!img.prompt
    )

    if (pendingImages.length === 0) {
        return {
            success: true,
            postTitle: post.title,
            postSlug,
            primaryKeyword,
            analysis: pipelineResult.analysis,
            opportunities: [],
        }
    }

    // Map to simplified opportunity structure for the workflow
    const opportunities = pendingImages.map((img) => ({
        opportunityId: img.opportunityId,
        prompt: img.prompt,
        imageType: img.imageType,
        photoStyle: img.photoStyle,
        insertAfterText: img.insertAfterText,
        altText: img.altText || img.opportunityId,
    }))

    console.log(
        `[Workflow Step] Found ${opportunities.length} opportunities for post: "${post.title}"`
    )

    return {
        success: true,
        postTitle: post.title,
        postSlug,
        primaryKeyword,
        analysis: pipelineResult.analysis,
        opportunities,
    }
}
