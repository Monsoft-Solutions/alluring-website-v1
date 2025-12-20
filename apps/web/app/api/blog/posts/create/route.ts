import { db } from '@workspace/db/client'
import {
    type CreateResourceInput,
    blogCategory,
    blogPost,
    blogPostCategory,
    blogPostTag,
    blogTag,
    createResourceSchema,
    images,
} from '@workspace/db/schema/blog'
import type { ExtractTablesWithRelations } from 'drizzle-orm'
import { inArray } from 'drizzle-orm'
import type { PgTransaction } from 'drizzle-orm/pg-core'
import type { PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js'
import { type NextRequest, NextResponse } from 'next/server'

import { uploadImageToBlob as uploadImageToBlobFormUrl } from '@/lib/api/upload-image.util'
import { withApiAuth } from '@/lib/api/withApiAuth.middleware'

// Type alias for Drizzle transaction
type DbTransaction = PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import('@workspace/db/schema/blog'),
    ExtractTablesWithRelations<typeof import('@workspace/db/schema/blog')>
>

/**
 * POST /api/blog/posts/create
 * Creates a new blog post with optional featured image
 *
 * Required authorization: Bearer token via Authorization header
 *
 * Request body: CreateResourceInput (validated against createResourceSchema)
 * Response: 201 Created with { id, slug, featuredImageUrl }
 */
async function postHandler(request: NextRequest) {
    try {
        // Parse request body
        const body = await request.json()

        // Validate against schema
        const validationResult = createResourceSchema.safeParse(body)
        if (!validationResult.success) {
            const errors = validationResult.error.flatten()
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: errors.fieldErrors,
                },
                { status: 400 }
            )
        }

        const data: CreateResourceInput = validationResult.data

        // Handle image upload if provided
        const featuredImageId = await handleImageUpload(data)
        if (featuredImageId instanceof NextResponse) {
            return featuredImageId
        }

        const { imageId, imageUrl } = featuredImageId || {}

        // Validate categories and tags exist
        const categoryValidation = await validateCategoryIds(data.categoryIds)
        if (categoryValidation instanceof NextResponse) {
            return categoryValidation
        }

        const tagValidation = await validateTagIds(data.tagIds)
        if (tagValidation instanceof NextResponse) {
            return tagValidation
        }

        // Parse and validate date
        const publishedAtValidation = validatePublishedDate(data.date)
        if (publishedAtValidation instanceof NextResponse) {
            return publishedAtValidation
        }

        // Create blog post with categories and tags in transaction
        const createdPost = await createBlogPostInTransaction(
            data,
            imageId,
            publishedAtValidation
        )

        return NextResponse.json(
            {
                id: createdPost.id,
                slug: createdPost.slug,
                featuredImageUrl: imageUrl,
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('Error creating blog post:', error)
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json(
            {
                error: 'Failed to create blog post',
                details: errorMessage,
            },
            { status: 500 }
        )
    }
}

/**
 * Handle featured image upload if provided
 * Returns image ID and URL, or NextResponse error
 */
async function handleImageUpload(
    data: CreateResourceInput
): Promise<{ imageId: string; imageUrl: string } | null | NextResponse> {
    if (!data.featuredImage?.url) {
        return null
    }

    try {
        const filename = `blog-${data.slug}-featured-${Date.now()}.jpg`
        const uploadResult = await uploadImageToBlobFormUrl(
            data.featuredImage.url,
            filename
        )

        // Create image record in database
        const [imageRecord] = await db
            .insert(images)
            .values({
                url: uploadResult.url,
                alt: `Featured image for ${data.title}`,
                title: data.title,
                originalFilename: uploadResult.originalFilename,
                mimeType: uploadResult.mimeType,
            })
            .returning({ id: images.id })

        if (!imageRecord?.id) {
            throw new Error('Failed to create image record')
        }

        return {
            imageId: imageRecord.id,
            imageUrl: uploadResult.url,
        }
    } catch (imageError) {
        console.error('Image upload failed:', imageError)
        return NextResponse.json(
            {
                error: 'Failed to upload featured image',
                details:
                    imageError instanceof Error
                        ? imageError.message
                        : 'Unknown error',
            },
            { status: 400 }
        )
    }
}

/**
 * Validate that all provided category IDs exist in the database
 */
async function validateCategoryIds(
    categoryIds: string[]
): Promise<NextResponse | null> {
    if (categoryIds.length === 0) {
        return null
    }

    const existingCategories = await db
        .select({ id: blogCategory.id })
        .from(blogCategory)
        .where(inArray(blogCategory.id, categoryIds))

    if (existingCategories.length !== categoryIds.length) {
        const existingIds = existingCategories.map((c) => c.id)
        const missingIds = categoryIds.filter((id) => !existingIds.includes(id))
        return NextResponse.json(
            {
                error: 'Invalid category IDs',
                details: `The following category IDs do not exist: ${missingIds.join(', ')}`,
            },
            { status: 400 }
        )
    }

    return null
}

/**
 * Validate that all provided tag IDs exist in the database
 */
async function validateTagIds(tagIds: string[]): Promise<NextResponse | null> {
    if (tagIds.length === 0) {
        return null
    }

    const existingTags = await db
        .select({ id: blogTag.id })
        .from(blogTag)
        .where(inArray(blogTag.id, tagIds))

    if (existingTags.length !== tagIds.length) {
        const existingIds = existingTags.map((t) => t.id)
        const missingIds = tagIds.filter((id) => !existingIds.includes(id))
        return NextResponse.json(
            {
                error: 'Invalid tag IDs',
                details: `The following tag IDs do not exist: ${missingIds.join(', ')}`,
            },
            { status: 400 }
        )
    }

    return null
}

/**
 * Validate and parse the published date
 * Returns the parsed Date or NextResponse error
 */
function validatePublishedDate(date: string): Date | NextResponse {
    const publishedAt = new Date(date)
    if (isNaN(publishedAt.getTime())) {
        return NextResponse.json(
            {
                error: 'Invalid date format',
                details: 'Date must be a valid ISO date string',
            },
            { status: 400 }
        )
    }
    return publishedAt
}

/**
 * Create blog post with categories and tags in a database transaction
 */
async function createBlogPostInTransaction(
    data: CreateResourceInput,
    featuredImageId: string | undefined,
    publishedAt: Date
) {
    const readingTime = data.readingTime ? parseInt(data.readingTime, 10) : null

    return db.transaction(async (tx) => {
        // Create blog post
        const [post] = await tx
            .insert(blogPost)
            .values({
                slug: data.slug,
                title: data.title,
                metaDescription: data.metaDescription,
                metaTitle: data.metaTitle,
                metaKeywords: data.metaKeywords,
                excerpt: data.excerpt,
                content: data.content,
                status: data.status,
                publishedAt:
                    data.status === 'published' ? publishedAt : undefined,
                readingTime,
                authorId: data.authorId,
                featuredImageId,
            })
            .returning({ id: blogPost.id, slug: blogPost.slug })

        if (!post) {
            throw new Error('Failed to create blog post')
        }

        // Insert category associations
        await createCategoryAssociations(tx, post.id, data.categoryIds)

        // Insert tag associations
        await createTagAssociations(tx, post.id, data.tagIds)

        return post
    })
}

/**
 * Create blog post to category associations in transaction
 */
async function createCategoryAssociations(
    tx: DbTransaction,
    postId: string,
    categoryIds: string[]
) {
    if (categoryIds.length === 0) {
        return
    }

    // Deduplicate categoryIds to avoid unique constraint violations
    const uniqueCategoryIds = Array.from(new Set(categoryIds))

    // Return early if deduplication yields empty array
    if (uniqueCategoryIds.length === 0) {
        return
    }

    const categoryAssociations = uniqueCategoryIds.map(
        (categoryId: string) => ({
            blogPostId: postId,
            categoryId,
        })
    )

    await tx.insert(blogPostCategory).values(categoryAssociations)
}

/**
 * Create blog post to tag associations in transaction
 */
async function createTagAssociations(
    tx: DbTransaction,
    postId: string,
    tagIds: string[]
) {
    if (tagIds.length === 0) {
        return
    }

    const tagAssociations = tagIds.map((tagId: string) => ({
        blogPostId: postId,
        tagId,
    }))

    await tx.insert(blogPostTag).values(tagAssociations)
}

export const POST = withApiAuth(postHandler)
