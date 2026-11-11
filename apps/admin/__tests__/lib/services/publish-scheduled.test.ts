/**
 * Tests for the publish-scheduled cron job (#374).
 *
 * The database is mocked: these cover what the job asks the database for
 * (the WHERE rendered to SQL) and what it does with the answer (status,
 * published_at, cache tags, outcome). The end-to-end publish was verified
 * against a real database clone; see the PR.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PgDialect } from 'drizzle-orm/pg-core'
import type { SQL } from 'drizzle-orm'

const mocks = vi.hoisted(() => ({
    updateSet: vi.fn(),
    updateWhere: vi.fn(),
    returning: vi.fn(),
    selectWhere: vi.fn(),
    revalidateWebAppCache: vi.fn(),
    revalidatePath: vi.fn(),
    revalidateTag: vi.fn(),
}))

vi.mock('@workspace/db/client', () => ({
    db: {
        update: () => ({
            set: (values: unknown) => {
                mocks.updateSet(values)
                return {
                    where: (condition: unknown) => {
                        mocks.updateWhere(condition)
                        return { returning: mocks.returning }
                    },
                }
            },
        }),
        select: () => ({
            from: () => ({ where: mocks.selectWhere }),
        }),
    },
}))

vi.mock('next/cache', () => ({
    revalidatePath: mocks.revalidatePath,
    revalidateTag: mocks.revalidateTag,
}))

vi.mock('@/lib/utils/revalidate-web.util', async () => {
    const { CACHE_TAGS } = await import('@workspace/shared/cache')
    return {
        CACHE_TAGS,
        revalidateWebAppCache: mocks.revalidateWebAppCache,
    }
})

import {
    publishableScheduledCondition,
    runPublishScheduledJob,
} from '@/lib/services/publish-scheduled.service'

const NOW = new Date('2026-11-12T14:02:00.000Z')

function render(condition: SQL) {
    return new PgDialect().sqlToQuery(condition)
}

beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mocks.returning.mockResolvedValue([])
    mocks.selectWhere.mockResolvedValue([{ held: 0, noScheduledAt: 0 }])
    mocks.revalidateWebAppCache.mockResolvedValue(true)
})

describe('publishableScheduledCondition', () => {
    const { sql, params } = render(publishableScheduledCondition(NOW))

    it('only takes scheduled rows whose scheduled_at has passed', () => {
        expect(sql).toContain('"blog_post"."status" = $')
        expect(params).toContain('scheduled')
        expect(sql).toContain('"blog_post"."scheduled_at" is not null')
        expect(sql).toMatch(/"blog_post"\."scheduled_at" <= \$\d+/)
        // Compared with the JS Date (UTC wall time), never the DB's now()
        expect(params).toContain(NOW.toISOString())
        expect(sql).not.toMatch(/now\(\)/i)
    })

    it('needs a slug and content, and skips refresh working copies', () => {
        expect(sql).toContain('"blog_post"."slug" is not null')
        expect(sql).toContain('"blog_post"."content" is not null')
        expect(sql).toContain('"blog_post"."refresh_of_post_id" is null')
    })

    it('skips a row that is mid-pipeline', () => {
        expect(sql).toMatch(
            /"blog_post"\."processing_status" is null or "blog_post"\."processing_status" <> \$\d+/
        )
        expect(params).toContain('processing')
    })
})

describe('runPublishScheduledJob', () => {
    it('publishes with status published and published_at = now', async () => {
        mocks.returning.mockResolvedValue([{ id: 'p1', slug: 'post-one' }])

        await runPublishScheduledJob(NOW)

        expect(mocks.updateSet).toHaveBeenCalledWith({
            status: 'published',
            publishedAt: NOW,
        })
        const where = mocks.updateWhere.mock.calls[0]![0] as SQL
        expect(render(where).sql).toBe(
            render(publishableScheduledCondition(NOW)).sql
        )
    })

    it('reports nothing-due and clears no cache when no post is due', async () => {
        const result = await runPublishScheduledJob(NOW)

        expect(result).toEqual({
            outcome: 'nothing-due',
            published: 0,
            slugs: [],
            held: 0,
            noScheduledAt: 0,
        })
        expect(mocks.revalidateWebAppCache).not.toHaveBeenCalled()
        expect(mocks.revalidateTag).not.toHaveBeenCalled()
        expect(mocks.revalidatePath).not.toHaveBeenCalled()
    })

    it('clears the blog list, sitemap and every published post tag', async () => {
        mocks.returning.mockResolvedValue([
            { id: 'p1', slug: 'post-one' },
            { id: 'p2', slug: 'post-two' },
        ])

        const result = await runPublishScheduledJob(NOW)

        expect(result).toEqual({
            outcome: 'published',
            published: 2,
            slugs: ['post-one', 'post-two'],
            held: 0,
            noScheduledAt: 0,
        })
        expect(mocks.revalidateWebAppCache).toHaveBeenCalledTimes(1)
        expect(mocks.revalidateWebAppCache).toHaveBeenCalledWith([
            'blog-posts',
            'sitemap-urls',
            'blog-post-post-one',
            'blog-post-post-two',
        ])
        // The admin's own copy of the sitemap URL registry
        expect(mocks.revalidateTag).toHaveBeenCalledWith('sitemap-urls', {
            expire: 0,
        })
        expect(mocks.revalidatePath).toHaveBeenCalledWith('/blog/pipeline')
        expect(mocks.revalidatePath).toHaveBeenCalledWith('/blog/posts')
    })

    it('surfaces a failed website revalidation in the outcome and the log', async () => {
        mocks.returning.mockResolvedValue([{ id: 'p1', slug: 'post-one' }])
        mocks.revalidateWebAppCache.mockResolvedValue(false)

        const result = await runPublishScheduledJob(NOW)

        expect(result.outcome).toBe('published-revalidation-failed')
        expect(result.slugs).toEqual(['post-one'])
        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining(
                'bash blog/tools/revalidate.sh blog-posts sitemap-urls blog-post-post-one'
            )
        )
    })

    it('reports due posts it held back and scheduled posts with no time', async () => {
        mocks.selectWhere.mockResolvedValue([{ held: 1, noScheduledAt: 2 }])

        const result = await runPublishScheduledJob(NOW)

        expect(result).toMatchObject({
            outcome: 'nothing-due',
            held: 1,
            noScheduledAt: 2,
        })
        expect(console.warn).toHaveBeenCalledTimes(2)
    })

    it('sends at most 10 tags per revalidate request', async () => {
        mocks.returning.mockResolvedValue(
            Array.from({ length: 9 }, (_, i) => ({
                id: `p${i}`,
                slug: `post-${i}`,
            }))
        )

        const result = await runPublishScheduledJob(NOW)

        expect(result.outcome).toBe('published')
        const batches = mocks.revalidateWebAppCache.mock.calls.map(
            (call) => call[0] as string[]
        )
        expect(batches.map((batch) => batch.length)).toEqual([10, 1])
        expect(batches.flat()).toHaveLength(11)
    })

    it('retries a failed revalidate request once', async () => {
        mocks.returning.mockResolvedValue([{ id: 'p1', slug: 'post-one' }])
        mocks.revalidateWebAppCache
            .mockResolvedValueOnce(false)
            .mockResolvedValueOnce(true)

        const result = await runPublishScheduledJob(NOW)

        expect(result.outcome).toBe('published')
        expect(mocks.revalidateWebAppCache).toHaveBeenCalledTimes(2)
    })
})
