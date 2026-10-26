/**
 * MCP Post Service
 *
 * The database side of the admin MCP server (issue #343): read, edit and
 * create blog posts on behalf of Claude, with the same safety rails the
 * admin and the `blog/tools` kit apply.
 *
 * Every write to an existing post:
 *   1. refuses refresh working copies and posts the pipeline is processing
 *   2. rejects content the blog renderer cannot render (MDX validator) and
 *      claim tokens (`[[price:bbl]]`, #354) that would render as nothing, in
 *      every field a reader sees
 *   3. snapshots a `blog_post_revision` (reason `mcp-edit`) in the same
 *      transaction, so `rollbackRevision` can undo it
 *   4. dismisses the post's open refresh candidates — refresh runs in `auto`
 *      mode and would otherwise overwrite a hand edit
 *   5. revalidates the web app's cache when the post is live
 *
 * Errors the agent can act on are thrown as `McpPostError`; the server turns
 * them into tool errors.
 *
 * @module @/lib/services/mcp-post.service
 */
import {
    and,
    asc,
    count,
    desc,
    eq,
    ilike,
    inArray,
    isNull,
    or,
    sql,
    type SQL,
} from 'drizzle-orm'
import { revalidateTag } from 'next/cache'

import { validateGeneratedMdx } from '@workspace/ai/functions/validate-generated-mdx.function'
import { db } from '@workspace/db/client'
import {
    author,
    blogCategory,
    blogPost,
    blogPostCategory,
    blogPostRevision,
    contentRefresh,
    images,
    type BlogPost,
} from '@workspace/db/schema/blog'
import { getBlogPostUrl } from '@workspace/shared'
import { CACHE_TAGS } from '@workspace/shared/cache'
import type { PricingSnapshot } from '@workspace/shared/claims/pricing'
import type { FaqItem } from '@workspace/shared/schemas/blog'

import {
    applyContentEdits,
    type ContentEdit,
} from '@/lib/mcp/content-edit.util'
import {
    estimateReadingTime,
    getSlugProblem,
    fieldValuesEqual,
    getWriteBlocker,
    parseFaqSection,
    type OpenRefreshStatus,
} from '@/lib/mcp/post-guards.util'
import { getPricingSnapshot } from '@/lib/queries/pricing.query'
import { dismissRefreshCandidate } from '@/lib/services/content-refresh.service'
import { evaluateSingleTopic } from '@/lib/services/ideation-gate.service'
import { rollbackRevision } from '@/lib/services/refresh-execution.service'
import {
    findClaimTokenErrors,
    type ClaimTokenFields,
} from '@/lib/utils/claim-token-fields.util'
import { buildRevisionValues } from '@/lib/utils/refresh-merge.util'
import { revalidateWebAppCache } from '@/lib/utils/revalidate-web.util'

/** A failure the agent can fix; becomes an MCP tool error. */
export class McpPostError extends Error {}

type PostStatus = NonNullable<BlogPost['status']>

const OPEN_REFRESH_STATUSES: OpenRefreshStatus[] = [
    'pending',
    'in_progress',
    'ready_for_review',
]

// ============================================
// Reads
// ============================================

export type ListPostsInput = {
    status?: PostStatus | 'all'
    query?: string
    limit: number
    offset: number
    orderBy: 'publishedAt' | 'contentUpdatedAt' | 'views' | 'title'
}

/**
 * Public path for a post, or null while it has no slug. An unpublished post
 * gets the path it will publish at: new posts live under /blog.
 */
function postPath(post: Pick<BlogPost, 'slug' | 'publishedAt'>): string | null {
    if (!post.slug) return null
    return post.publishedAt
        ? getBlogPostUrl(post.slug, post.publishedAt)
        : `/blog/${post.slug}`
}

/**
 * Posts matching a status and a free-text query (title, slug, primary
 * keyword or body). Refresh working copies are hidden — they are not posts.
 */
export async function listPosts(input: ListPostsInput) {
    const conditions: SQL[] = [isNull(blogPost.refreshOfPostId)]
    if (input.status && input.status !== 'all') {
        conditions.push(eq(blogPost.status, input.status))
    }
    const term = input.query?.trim()
    if (term) {
        const pattern = `%${term.replace(/[\\%_]/g, '\\$&')}%`
        conditions.push(
            or(
                ilike(blogPost.title, pattern),
                ilike(blogPost.slug, pattern),
                ilike(blogPost.primaryKeyword, pattern),
                ilike(blogPost.content, pattern)
            )!
        )
    }
    const where = and(...conditions)

    const order = {
        publishedAt: desc(
            sql`coalesce(${blogPost.publishedAt}, ${blogPost.createdAt})`
        ),
        contentUpdatedAt: desc(
            sql`coalesce(${blogPost.contentUpdatedAt}, ${blogPost.createdAt})`
        ),
        views: desc(blogPost.views),
        title: asc(blogPost.title),
    }[input.orderBy]

    const [rows, [total]] = await Promise.all([
        db
            .select({
                id: blogPost.id,
                slug: blogPost.slug,
                title: blogPost.title,
                status: blogPost.status,
                primaryKeyword: blogPost.primaryKeyword,
                publishedAt: blogPost.publishedAt,
                contentUpdatedAt: blogPost.contentUpdatedAt,
                views: blogPost.views,
                wordCount: sql<number>`coalesce(array_length(regexp_split_to_array(trim(${blogPost.content}), '\\s+'), 1), 0)`,
                snippet: term
                    ? sql<
                          string | null
                      >`case when strpos(lower(${blogPost.content}), lower(${term})) > 0
                        then substr(${blogPost.content}, greatest(strpos(lower(${blogPost.content}), lower(${term})) - 80, 1), 200)
                        end`
                    : sql<null>`null`,
            })
            .from(blogPost)
            .where(where)
            .orderBy(order)
            .limit(input.limit)
            .offset(input.offset),
        db.select({ value: count() }).from(blogPost).where(where),
    ])

    return {
        total: total?.value ?? 0,
        offset: input.offset,
        posts: rows.map((row) => ({
            ...row,
            url: postPath(row),
            snippet: row.snippet ?? undefined,
        })),
    }
}

/** Find a post by id or slug. */
async function findPost(ref: { id?: string; slug?: string }) {
    if (!ref.id && !ref.slug) throw new McpPostError('Pass id or slug.')
    const [post] = await db
        .select()
        .from(blogPost)
        .where(ref.id ? eq(blogPost.id, ref.id) : eq(blogPost.slug, ref.slug!))
        .limit(1)
    if (!post)
        throw new McpPostError(
            `No post with ${ref.id ? `id ${ref.id}` : `slug "${ref.slug}"`}.`
        )
    return post
}

async function getOpenRefresh(postId: string) {
    const [row] = await db
        .select({ id: contentRefresh.id, status: contentRefresh.status })
        .from(contentRefresh)
        .where(
            and(
                eq(contentRefresh.blogPostId, postId),
                inArray(contentRefresh.status, OPEN_REFRESH_STATUSES)
            )
        )
        .limit(1)
    return row ? { id: row.id, status: row.status as OpenRefreshStatus } : null
}

/** Everything a writer needs about one post: reader fields, taxonomy, image, state. */
export async function getPost(ref: { id?: string; slug?: string }) {
    const post = await findPost(ref)

    const [
        categories,
        featuredImage,
        postAuthor,
        openRefresh,
        [revisionCount],
    ] = await Promise.all([
        db
            .select({
                id: blogCategory.id,
                name: blogCategory.name,
                slug: blogCategory.slug,
            })
            .from(blogPostCategory)
            .innerJoin(
                blogCategory,
                eq(blogCategory.id, blogPostCategory.categoryId)
            )
            .where(eq(blogPostCategory.blogPostId, post.id)),
        post.featuredImageId
            ? db
                  .select({ id: images.id, url: images.url, alt: images.alt })
                  .from(images)
                  .where(eq(images.id, post.featuredImageId))
                  .then((rows) => rows[0] ?? null)
            : null,
        post.authorId
            ? db
                  .select({ id: author.id, name: author.name })
                  .from(author)
                  .where(eq(author.id, post.authorId))
                  .then((rows) => rows[0] ?? null)
            : null,
        getOpenRefresh(post.id),
        db
            .select({ value: count() })
            .from(blogPostRevision)
            .where(eq(blogPostRevision.blogPostId, post.id)),
    ])

    return {
        id: post.id,
        slug: post.slug,
        url: postPath(post),
        status: post.status,
        title: post.title,
        metaTitle: post.metaTitle,
        metaDescription: post.metaDescription,
        metaKeywords: post.metaKeywords,
        primaryKeyword: post.primaryKeyword,
        secondaryKeywords: post.secondaryKeywords,
        excerpt: post.excerpt,
        quickAnswer: post.quickAnswer,
        faqs: post.faqs,
        readingTime: post.readingTime,
        publishedAt: post.publishedAt,
        contentUpdatedAt: post.contentUpdatedAt,
        views: post.views,
        author: postAuthor,
        categories,
        featuredImage,
        pipelineProcessingStatus: post.pipelineProcessingStatus,
        refreshOfPostId: post.refreshOfPostId,
        openRefresh,
        revisionCount: revisionCount?.value ?? 0,
        content: post.content,
    }
}

export async function listRevisions(postId: string, limit: number) {
    const rows = await db
        .select({
            id: blogPostRevision.id,
            reason: blogPostRevision.reason,
            createdAt: blogPostRevision.createdAt,
            title: blogPostRevision.title,
            contentLength: sql<number>`length(${blogPostRevision.content})`,
        })
        .from(blogPostRevision)
        .where(eq(blogPostRevision.blogPostId, postId))
        .orderBy(desc(blogPostRevision.createdAt))
        .limit(limit)
    return rows
}

export async function getRevision(revisionId: string) {
    const [revision] = await db
        .select()
        .from(blogPostRevision)
        .where(eq(blogPostRevision.id, revisionId))
        .limit(1)
    if (!revision) throw new McpPostError(`No revision with id ${revisionId}.`)
    return revision
}

export async function listCategories() {
    return db
        .select({
            id: blogCategory.id,
            name: blogCategory.name,
            slug: blogCategory.slug,
        })
        .from(blogCategory)
        .where(eq(blogCategory.isActive, true))
        .orderBy(asc(blogCategory.sortOrder), asc(blogCategory.name))
}

export async function listAuthors() {
    return db
        .select({ id: author.id, name: author.name })
        .from(author)
        .orderBy(asc(author.name))
}

// ============================================
// Shared write helpers
// ============================================

/** Reject content the renderer would crash on or silently strip. */
function assertRenderable(content: string, pricing: PricingSnapshot) {
    const result = validateGeneratedMdx(content, { pricing })
    if (!result.clean) {
        const problems = result.actions
            .map((action) => `- ${action.kind}: ${action.detail}`)
            .join('\n')
        throw new McpPostError(
            `The content would not render as written. Fix these and resend (get_writing_guide lists the allowed components):\n${problems}`
        )
    }
}

/**
 * Reject a claim token in a non-body field that would render as nothing, or
 * an Alluring price typed instead of a token (#354). The body goes through
 * `assertRenderable`, which reports both among the other MDX hazards.
 */
function assertClaimTokens(
    fields: Omit<ClaimTokenFields, 'content'>,
    pricing: PricingSnapshot
): void {
    const problems = findClaimTokenErrors(
        { ...fields, content: undefined },
        pricing
    )
    if (problems.length > 0) {
        throw new McpPostError(
            `Some claim tokens would render as nothing, or a price is typed instead of a token. Fix these and resend (get_writing_guide lists every valid token):\n${problems.map((problem) => `- ${problem}`).join('\n')}`
        )
    }
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]

/**
 * The `images` row for a URL (`images.url` is unique). An existing row is
 * reused as it is: image rows are shared between posts, so rewriting its alt
 * text would change other posts' pages too.
 */
async function resolveImageId(
    exec: Tx | typeof db,
    url: string,
    alt: string
): Promise<string> {
    const [existing] = await exec
        .select({ id: images.id })
        .from(images)
        .where(eq(images.url, url))
        .limit(1)
    if (existing) return existing.id
    const [created] = await exec
        .insert(images)
        .values({ url, alt, title: alt })
        .returning({ id: images.id })
    return created!.id
}

async function assertCategoriesExist(categoryIds: string[]) {
    if (categoryIds.length === 0) return
    const found = await db
        .select({ id: blogCategory.id })
        .from(blogCategory)
        .where(inArray(blogCategory.id, categoryIds))
    const missing = categoryIds.filter(
        (id) => !found.some((row) => row.id === id)
    )
    if (missing.length)
        throw new McpPostError(
            `Unknown category ids: ${missing.join(', ')}. See list_categories.`
        )
}

/** Refresh the live site: post page, blog lists, and the sitemap. */
async function revalidateLivePost(slug: string | null) {
    if (slug) {
        await revalidateWebAppCache([
            CACHE_TAGS.BLOG_POSTS,
            CACHE_TAGS.blogPostBySlug(slug),
        ])
    } else {
        await revalidateWebAppCache([CACHE_TAGS.BLOG_POSTS])
    }
    revalidateTag(CACHE_TAGS.SITEMAP_URLS as string, { expire: 0 })
}

// ============================================
// Update
// ============================================

/** Reader-facing fields `update_post` may set. All are captured by revisions. */
export type PostFieldUpdates = {
    title?: string
    content?: string
    metaTitle?: string | null
    metaDescription?: string
    metaKeywords?: string | null
    excerpt?: string | null
    quickAnswer?: string | null
    faqs?: FaqItem[] | null
    secondaryKeywords?: string[] | null
    readingTime?: number
}

export type UpdatePostInput = {
    id: string
    fields: PostFieldUpdates
    edits?: ContentEdit[]
    featuredImage?: { url: string; alt: string }
    categoryIds?: string[]
    publish?: boolean
}

export async function updatePost(input: UpdatePostInput) {
    if (input.edits?.length && input.fields.content !== undefined) {
        throw new McpPostError('Send either content or edits, not both.')
    }
    if (input.categoryIds) await assertCategoriesExist(input.categoryIds)
    const pricing = await getPricingSnapshot()
    assertClaimTokens(input.fields, pricing)

    // Read, check and write under a row lock: Claude Code sends tool calls in
    // parallel, and two edits computed from the same read would silently drop
    // one of them — from the post and from the revision log.
    const outcome = await db.transaction(async (tx) => {
        const [post] = await tx
            .select()
            .from(blogPost)
            .where(eq(blogPost.id, input.id))
            .for('update')
        if (!post) throw new McpPostError(`No post with id ${input.id}.`)

        const [openRefresh] = await tx
            .select({ id: contentRefresh.id, status: contentRefresh.status })
            .from(contentRefresh)
            .where(
                and(
                    eq(contentRefresh.blogPostId, post.id),
                    inArray(contentRefresh.status, OPEN_REFRESH_STATUSES)
                )
            )
            .limit(1)
        const blocker = getWriteBlocker(
            post,
            (openRefresh?.status as OpenRefreshStatus | undefined) ?? null
        )
        if (blocker) throw new McpPostError(blocker)

        const fields: PostFieldUpdates = { ...input.fields }
        if (input.edits?.length) {
            const edited = applyContentEdits(post.content ?? '', input.edits)
            if (!edited.ok) throw new McpPostError(edited.error)
            fields.content = edited.content
        }
        if (fields.content !== undefined) {
            if (!fields.content.trim())
                throw new McpPostError('Content cannot be empty.')
            assertRenderable(fields.content, pricing)
            if (fields.readingTime === undefined) {
                fields.readingTime = estimateReadingTime(fields.content)
            }
            // Keep the FAQPage schema in step with the body's FAQ section.
            if (fields.faqs === undefined) {
                const parsed = parseFaqSection(fields.content)
                if (parsed.length) fields.faqs = parsed
            }
        }

        // Only fields that actually change — keeps the revision log honest.
        const changes = Object.fromEntries(
            Object.entries(fields).filter(
                ([key, value]) =>
                    value !== undefined &&
                    !fieldValuesEqual(key, value, post[key as keyof BlogPost])
            )
        ) as PostFieldUpdates
        const changedFields = Object.keys(changes)

        const wasLive = post.status === 'published'
        if (input.publish && wasLive) {
            throw new McpPostError(
                'This post is already published; omit publish.'
            )
        }
        const publishNow = input.publish === true
        if (publishNow) {
            const final = { ...post, ...changes }
            const missing = (
                ['slug', 'content', 'metaDescription'] as const
            ).filter((key) => !final[key]?.trim())
            if (missing.length)
                throw new McpPostError(
                    `Cannot publish without: ${missing.join(', ')}.`
                )
            if (post.status && PIPELINE_STAGES.includes(post.status)) {
                throw new McpPostError(
                    `The post is in the pipeline's "${post.status}" stage. Let it reach draft or ready_to_publish first, or move it in the admin.`
                )
            }
        }

        const featuredImageId = input.featuredImage
            ? await resolveImageId(
                  tx,
                  input.featuredImage.url,
                  input.featuredImage.alt
              )
            : undefined
        const imageChanged =
            featuredImageId !== undefined &&
            featuredImageId !== post.featuredImageId

        if (
            !changedFields.length &&
            !publishNow &&
            !imageChanged &&
            !input.categoryIds
        ) {
            return {
                post,
                changed: [] as string[],
                revisionId: null,
                wasLive,
                publishNow,
                openRefresh: undefined,
            }
        }

        let revisionId: string | null = null
        if (changedFields.length) {
            const [revision] = await tx
                .insert(blogPostRevision)
                .values(buildRevisionValues(post, 'mcp-edit'))
                .returning({ id: blogPostRevision.id })
            revisionId = revision?.id ?? null
        }

        await tx
            .update(blogPost)
            .set({
                ...changes,
                ...(imageChanged ? { featuredImageId } : {}),
                ...(publishNow
                    ? {
                          status: 'published' as const,
                          publishedAt: post.publishedAt ?? new Date(),
                      }
                    : {}),
            })
            .where(eq(blogPost.id, post.id))

        if (input.categoryIds) {
            await tx
                .delete(blogPostCategory)
                .where(eq(blogPostCategory.blogPostId, post.id))
            if (input.categoryIds.length) {
                await tx.insert(blogPostCategory).values(
                    input.categoryIds.map((categoryId) => ({
                        blogPostId: post.id,
                        categoryId,
                    }))
                )
            }
        }

        return {
            post,
            changed: [
                ...changedFields,
                ...(imageChanged ? ['featuredImage'] : []),
                ...(input.categoryIds ? ['categories'] : []),
                ...(publishNow ? ['status'] : []),
            ],
            revisionId,
            wasLive,
            publishNow,
            openRefresh,
        }
    })

    const { post } = outcome
    if (!outcome.changed.length) {
        return {
            changed: [],
            revisionId: null,
            status: post.status,
            url: postPath(post),
        }
    }

    // After the commit: dismissing deletes a ready_for_review working copy,
    // and a failure here must not undo the edit.
    let refreshDismissed = false
    if (outcome.openRefresh) {
        refreshDismissed = (
            await dismissRefreshCandidate(outcome.openRefresh.id)
        ).success
    }

    const [updated] = await db
        .select({
            slug: blogPost.slug,
            publishedAt: blogPost.publishedAt,
            status: blogPost.status,
        })
        .from(blogPost)
        .where(eq(blogPost.id, post.id))
    if (outcome.wasLive || outcome.publishNow) {
        await revalidateLivePost(updated?.slug ?? null)
    }

    return {
        changed: outcome.changed,
        revisionId: outcome.revisionId,
        refreshDismissed,
        status: updated?.status ?? post.status,
        url: updated ? postPath(updated) : postPath(post),
    }
}

/** Statuses where the pipeline still owns the post. */
const PIPELINE_STAGES: PostStatus[] = [
    'ideation',
    'generate',
    'ai_review',
    'generate_metadata',
    'generate_image',
]

// ============================================
// Restore
// ============================================

export async function restoreRevision(revisionId: string) {
    const revision = await getRevision(revisionId)
    const post = await findPost({ id: revision.blogPostId })
    const openRefresh = await getOpenRefresh(post.id)
    const blocker = getWriteBlocker(post, openRefresh?.status ?? null)
    if (blocker) throw new McpPostError(blocker)

    // rollbackRevision locks the row, snapshots the current state first
    // (reason `rollback`) and revalidates the site.
    const result = await rollbackRevision(revisionId)
    if (!result.success)
        throw new McpPostError(result.error ?? 'Restore failed.')

    if (openRefresh) await dismissRefreshCandidate(openRefresh.id)
    return { restored: revisionId, postId: post.id, url: postPath(post) }
}

// ============================================
// Create
// ============================================

export type CreatePostInput = {
    title: string
    slug: string
    content: string
    metaDescription: string
    metaTitle?: string
    excerpt?: string
    quickAnswer?: string
    faqs?: FaqItem[]
    primaryKeyword: string
    secondaryKeywords?: string[]
    metaKeywords?: string
    featuredImage?: { url: string; alt: string }
    categoryIds?: string[]
    authorId?: string
    status: 'published' | 'ready_to_publish'
}

export async function createPost(input: CreatePostInput) {
    const slugProblem = getSlugProblem(input.slug)
    if (slugProblem) throw new McpPostError(slugProblem)

    const [taken] = await db
        .select({ id: blogPost.id })
        .from(blogPost)
        .where(eq(blogPost.slug, input.slug))
        .limit(1)
    if (taken)
        throw new McpPostError(
            `Slug "${input.slug}" is already used by post ${taken.id}.`
        )

    // The gate's live overlay only sees published posts; an unpublished post
    // (pipeline idea, staged MCP post) already claiming the keyword counts too.
    const [sameKeyword] = await db
        .select({
            id: blogPost.id,
            slug: blogPost.slug,
            status: blogPost.status,
        })
        .from(blogPost)
        .where(
            and(
                sql`lower(trim(${blogPost.primaryKeyword})) = lower(trim(${input.primaryKeyword}))`,
                isNull(blogPost.refreshOfPostId)
            )
        )
        .limit(1)
    if (sameKeyword) {
        throw new McpPostError(
            `Post ${sameKeyword.id} (${sameKeyword.slug ?? 'no slug yet'}, ${sameKeyword.status}) already has primary keyword "${input.primaryKeyword}". Edit that post instead, or pick another keyword.`
        )
    }

    // The keyword-ownership gate: no new post without a `new` verdict.
    const gate = await evaluateSingleTopic({
        title: input.title,
        primaryKeyword: input.primaryKeyword,
        secondaryKeywords: input.secondaryKeywords ?? null,
    })
    if (gate.verdict !== 'new') {
        const owner = gate.owningSlug
            ? ` Rewrite the owning post (slug "${gate.owningSlug}") with update_post instead.`
            : ''
        throw new McpPostError(
            `Keyword gate: ${gate.verdict}. ${gate.reason}${gate.owningUrl ? ` (owner: ${gate.owningUrl})` : ''}.${owner}`
        )
    }

    const pricing = await getPricingSnapshot()
    assertRenderable(input.content, pricing)
    assertClaimTokens(input, pricing)
    if (input.categoryIds) await assertCategoriesExist(input.categoryIds)
    if (input.authorId) {
        const [found] = await db
            .select({ id: author.id })
            .from(author)
            .where(eq(author.id, input.authorId))
            .limit(1)
        if (!found)
            throw new McpPostError(
                `Unknown author id ${input.authorId}. See list_authors.`
            )
    }

    const featuredImageId = input.featuredImage
        ? await resolveImageId(
              db,
              input.featuredImage.url,
              input.featuredImage.alt
          )
        : null

    const isPublished = input.status === 'published'
    const bodyFaqs = parseFaqSection(input.content)
    const id = await db.transaction(async (tx) => {
        const [created] = await tx
            .insert(blogPost)
            .values({
                title: input.title,
                slug: input.slug,
                content: input.content,
                metaDescription: input.metaDescription,
                metaTitle: input.metaTitle ?? null,
                metaKeywords: input.metaKeywords ?? null,
                primaryKeyword: input.primaryKeyword,
                secondaryKeywords: input.secondaryKeywords ?? null,
                excerpt: input.excerpt ?? null,
                quickAnswer: input.quickAnswer ?? null,
                faqs: input.faqs ?? (bodyFaqs.length ? bodyFaqs : null),
                readingTime: estimateReadingTime(input.content),
                authorId: input.authorId ?? null,
                featuredImageId,
                status: input.status,
                // Created by a person's request, not autopilot ideation.
                ideaApproval: 'approved',
                publishedAt: isPublished ? new Date() : null,
            })
            .returning({ id: blogPost.id, publishedAt: blogPost.publishedAt })

        if (input.categoryIds?.length) {
            await tx.insert(blogPostCategory).values(
                input.categoryIds.map((categoryId) => ({
                    blogPostId: created!.id,
                    categoryId,
                }))
            )
        }
        return created!
    })

    if (isPublished) await revalidateLivePost(input.slug)

    return {
        id: id.id,
        status: input.status,
        url: postPath({ slug: input.slug, publishedAt: id.publishedAt }),
        gateWarnings: gate.warnings,
        registryReminder:
            'Add this post to packages/shared/src/seo/keyword-ownership-blog.constant.ts and bump the live-post count in apps/admin/__tests__/lib/seo/keyword-ownership.test.ts in the next code PR.',
    }
}
