/**
 * Admin MCP server
 *
 * Blog post tools for Claude Code (issue #343): read, search, edit, create,
 * and undo. Built per request by `app/api/mcp/route.ts` — the handler is
 * stateless, which is what a Vercel function can serve.
 *
 * The rails live in `mcp-post.service`; this file is schemas, descriptions
 * (the model reads them to decide what to call) and result plumbing.
 *
 * @module @/lib/mcp/server
 */
import { McpServer } from '@modelcontextprotocol/server'
import { z } from 'zod'

import {
    BLOG_CTA_IDS,
    buildMdxComponentReference,
} from '@workspace/shared/content'

import {
    createPost,
    getPost,
    getRevision,
    listAuthors,
    listCategories,
    listPosts,
    listRevisions,
    McpPostError,
    restoreRevision,
    updatePost,
} from '@/lib/services/mcp-post.service'

type ToolResult = {
    content: { type: 'text'; text: string }[]
    isError?: boolean
}

function ok(value: unknown): ToolResult {
    const text =
        typeof value === 'string' ? value : JSON.stringify(value, null, 2)
    return { content: [{ type: 'text', text }] }
}

function fail(message: string): ToolResult {
    return { content: [{ type: 'text', text: message }], isError: true }
}

/**
 * Run a tool body. `McpPostError`s are the agent's to fix and pass through
 * verbatim; anything else is logged and reported without internals.
 */
async function handle(
    label: string,
    run: () => Promise<unknown>
): Promise<ToolResult> {
    try {
        return ok(await run())
    } catch (error) {
        if (error instanceof McpPostError) return fail(error.message)
        // Unexpected errors can carry SQL and post bodies; keep them in the
        // server log.
        console.error(`[MCP] ${label} failed:`, error)
        return fail(
            `${label} failed with a server error. Check the admin logs.`
        )
    }
}

// ============================================
// Shared schemas
// ============================================

const uuid = z.string().uuid()

const postStatusSchema = z.enum([
    'ideation',
    'generate',
    'ai_review',
    'generate_metadata',
    'generate_image',
    'draft',
    'ready_to_publish',
    'scheduled',
    'published',
])

const faqsSchema = z
    .array(z.object({ question: z.string().min(1), answer: z.string().min(1) }))
    .describe('FAQ pairs rendered as the FAQ section and FAQPage schema')

const featuredImageSchema = z
    .object({
        url: z
            .string()
            .url()
            .describe('An image already uploaded to Vercel Blob'),
        alt: z.string().min(1).describe('Alt text describing the image'),
    })
    .describe('Featured (hero) image')

const quickAnswerSchema = z
    .string()
    .describe(
        'The head question, a blank line, then a 40–60 word standalone answer'
    )

const WRITING_GUIDE = `# Writing a blog post for alluringplasticsurgery.com

## Format
- \`content\` is Markdown compiled as MDX. No H1 (the title is the H1). Open with an H2 question (the head query) and a direct 2–4 sentence answer.
- End with \`## Frequently asked questions\` (5–8 \`### Question?\` entries, one 30–80 word paragraph each), then \`## Sources\` as a bullet list of \`- [Publisher: Title](url)\`. The FAQ section fills the \`faqs\` field (FAQPage schema) automatically unless you pass \`faqs\` yourself.
- CTA: the page template places one automatically. To choose the spot, add at most one marker \`<!-- CTA:<id> -->\`, id one of ${BLOG_CTA_IDS.map((id) => `\`${id}\``).join(', ')}. No other HTML comments — MDX cannot compile them.
- No \`{curly}\` expressions in prose; write the text instead. No phone numbers (the template carries the CTAs).
- \`quickAnswer\`: the head question, a blank line, then a 40–60 word answer that stands alone. Never a <QuickAnswer> block in the body.
- Title ≤ 60 characters, main search phrase first. Meta description ≤ 155 characters. Excerpt 2–3 sentences, ≤ 320 characters.

## Components
${buildMdxComponentReference()}

## Compliance
- The practice serves patients in the United States only (South Florida locals and patients flying in from other states). Never describe Latin American, Caribbean or "international" patients.
- The practice does not coordinate travel: no flights, lodging, transport, airport pickup, recovery houses or "concierge" travel claims.
- Don't write "luxury" or "affordable". No surgeon name in titles. No guaranteed outcomes.
- Figures need a source. Say what is normal, what isn't, and when to call the surgeon.

## Before you write
- Read the full house standard in the repo when you have it: \`.claude/skills/blog-post/reference/writing-standard.md\` and \`compliance.md\`.
- Use Search Console data (the \`search-console\` MCP) for the phrases people actually search.
- Edit with \`edits\` (exact find-and-replace) rather than resending the whole body.`

// ============================================
// Server
// ============================================

export function createServer(): McpServer {
    const server = new McpServer({ name: 'alluring-admin', version: '0.1.0' })

    server.registerTool(
        'get_writing_guide',
        {
            title: 'Writing guide',
            description:
                'The format and house rules for blog post content: Markdown/MDX conventions, the allowed components, the CTA marker, quick answer and FAQ fields, and compliance rules. Read it once before writing or editing content.',
            inputSchema: z.object({}),
            annotations: { readOnlyHint: true },
        },
        () => ok(WRITING_GUIDE)
    )

    server.registerTool(
        'list_posts',
        {
            title: 'List blog posts',
            description:
                'Blog posts with id, slug, public URL, status, primary keyword, dates, views and word count. `query` matches title, slug, primary keyword and body text (case-insensitive) and returns a snippet around the first body match. Use it to find a post before get_post.',
            inputSchema: z.object({
                status: postStatusSchema
                    .or(z.literal('all'))
                    .default('published'),
                query: z
                    .string()
                    .optional()
                    .describe('Free text to search for'),
                orderBy: z
                    .enum(['publishedAt', 'contentUpdatedAt', 'views', 'title'])
                    .default('publishedAt'),
                limit: z.number().int().min(1).max(200).default(50),
                offset: z.number().int().min(0).default(0),
            }),
            annotations: { readOnlyHint: true },
        },
        async (input) => handle('list_posts', () => listPosts(input))
    )

    server.registerTool(
        'get_post',
        {
            title: 'Get a blog post',
            description:
                'One post in full: content (Markdown/MDX), title, meta fields, keywords, excerpt, quick answer, FAQs, categories, featured image, author, status, open refresh candidate and revision count. Pass id or slug.',
            inputSchema: z.object({
                id: uuid.optional(),
                slug: z.string().optional(),
            }),
            annotations: { readOnlyHint: true },
        },
        async (ref) => handle('get_post', () => getPost(ref))
    )

    server.registerTool(
        'update_post',
        {
            title: 'Edit a blog post',
            description: `Edit an existing post. Changes go live immediately on a published post.

Body changes: prefer \`edits\` — exact find-and-replace pairs applied in order, each oldText must occur exactly once (like a code Edit). Or send the full \`content\`. Not both.

Every change to the reader-facing fields saves a revision first (undo with restore_revision), takes the post out of the automatic refresh queue so autopilot doesn't overwrite the edit, and refreshes the live site's cache. Content the blog renderer can't render is rejected with the reasons. Reading time is recomputed when the body changes.

Not editable here: slug (it is the URL) and unpublishing — do those in the admin. \`publish: true\` publishes a draft or ready_to_publish post. featuredImage and categoryIds are not covered by revisions; get_post first if you may need to put them back.`,
            inputSchema: z.object({
                id: uuid,
                edits: z
                    .array(
                        z.object({
                            oldText: z
                                .string()
                                .min(1)
                                .describe(
                                    'Exact text from the current content; must occur once'
                                ),
                            newText: z
                                .string()
                                .describe('Replacement; empty string deletes'),
                        })
                    )
                    .optional(),
                content: z
                    .string()
                    .optional()
                    .describe('Full replacement body (Markdown/MDX)'),
                title: z.string().min(1).max(255).optional(),
                metaTitle: z.string().max(255).nullable().optional(),
                metaDescription: z.string().min(1).optional(),
                metaKeywords: z.string().nullable().optional(),
                excerpt: z.string().nullable().optional(),
                quickAnswer: quickAnswerSchema.nullable().optional(),
                faqs: faqsSchema.nullable().optional(),
                secondaryKeywords: z.array(z.string()).nullable().optional(),
                readingTime: z
                    .number()
                    .int()
                    .min(1)
                    .optional()
                    .describe('Minutes; computed from the body when omitted'),
                featuredImage: featuredImageSchema.optional(),
                categoryIds: z
                    .array(uuid)
                    .optional()
                    .describe(
                        'Replaces the post’s categories; see list_categories'
                    ),
                publish: z
                    .boolean()
                    .optional()
                    .describe('Publish an unpublished post'),
            }),
            annotations: { destructiveHint: true, idempotentHint: false },
        },
        async ({ id, edits, featuredImage, categoryIds, publish, ...fields }) =>
            handle('update_post', () =>
                updatePost({
                    id,
                    edits,
                    featuredImage,
                    categoryIds,
                    publish,
                    fields,
                })
            )
    )

    server.registerTool(
        'create_post',
        {
            title: 'Create a blog post',
            description: `Create a new post, published immediately by default (status "ready_to_publish" leaves it for a person to publish in the admin).

The topic must pass the keyword-ownership gate: if an existing page already owns the primary keyword, the call fails and names the owner — rewrite that post with update_post instead. The slug must be new (it becomes /blog/<slug>). Call get_writing_guide first; content the renderer can't render is rejected.`,
            inputSchema: z.object({
                title: z.string().min(1).max(255),
                slug: z
                    .string()
                    .min(1)
                    .max(120)
                    .describe('lowercase-words-with-hyphens'),
                content: z.string().min(1).describe('Body in Markdown/MDX'),
                metaDescription: z.string().min(1),
                metaTitle: z.string().max(255).optional(),
                excerpt: z.string().optional(),
                quickAnswer: quickAnswerSchema.optional(),
                faqs: faqsSchema.optional(),
                primaryKeyword: z
                    .string()
                    .min(1)
                    .max(100)
                    .describe('The one search phrase this post owns'),
                secondaryKeywords: z.array(z.string()).optional(),
                metaKeywords: z.string().optional(),
                featuredImage: featuredImageSchema.optional(),
                categoryIds: z.array(uuid).optional(),
                authorId: uuid.optional(),
                status: z
                    .enum(['published', 'ready_to_publish'])
                    .default('published'),
            }),
            annotations: { destructiveHint: false, idempotentHint: false },
        },
        async (input) => handle('create_post', () => createPost(input))
    )

    server.registerTool(
        'list_revisions',
        {
            title: 'List post revisions',
            description:
                'Saved snapshots of a post, newest first: id, reason (mcp-edit, refresh-apply, rollback), time, title and content length. Use with get_revision and restore_revision.',
            inputSchema: z.object({
                postId: uuid,
                limit: z.number().int().min(1).max(100).default(20),
            }),
            annotations: { readOnlyHint: true },
        },
        async ({ postId, limit }) =>
            handle('list_revisions', () => listRevisions(postId, limit))
    )

    server.registerTool(
        'get_revision',
        {
            title: 'Get a revision',
            description:
                'One saved snapshot in full (title, content, meta fields, FAQs, quick answer).',
            inputSchema: z.object({ revisionId: uuid }),
            annotations: { readOnlyHint: true },
        },
        async ({ revisionId }) =>
            handle('get_revision', () => getRevision(revisionId))
    )

    server.registerTool(
        'restore_revision',
        {
            title: 'Restore a revision',
            description:
                "Put a saved snapshot back onto its post (the reader-facing text fields). The post's current state is saved as a new revision first, so a restore can itself be undone. Goes live immediately on a published post.",
            inputSchema: z.object({ revisionId: uuid }),
            annotations: { destructiveHint: true },
        },
        async ({ revisionId }) =>
            handle('restore_revision', () => restoreRevision(revisionId))
    )

    server.registerTool(
        'list_categories',
        {
            title: 'List blog categories',
            description:
                'Active blog categories with their ids, for categoryIds.',
            inputSchema: z.object({}),
            annotations: { readOnlyHint: true },
        },
        async () => handle('list_categories', () => listCategories())
    )

    server.registerTool(
        'list_authors',
        {
            title: 'List authors',
            description: 'Post authors with their ids, for authorId.',
            inputSchema: z.object({}),
            annotations: { readOnlyHint: true },
        },
        async () => handle('list_authors', () => listAuthors())
    )

    return server
}
