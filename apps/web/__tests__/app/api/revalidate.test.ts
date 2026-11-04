import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const SECRET = 'test-revalidation-secret'

const { revalidatePath, revalidateTag } = vi.hoisted(() => ({
    revalidatePath: vi.fn(),
    revalidateTag: vi.fn(),
}))
vi.mock('next/cache', () => ({ revalidatePath, revalidateTag }))
vi.mock('@/env', () => ({
    env: { REVALIDATION_SECRET: 'test-revalidation-secret' },
}))

const { POST } = await import('@/app/api/revalidate/route')
const { BLOG_SITEMAP_PATH } = await import(
    '@/lib/cache/blog-sitemap-path.constant'
)

const post = (body: { secret: string; tags: string[] }) =>
    POST(
        new NextRequest('http://localhost:3000/api/revalidate', {
            method: 'POST',
            body: JSON.stringify(body),
        })
    )

describe('POST /api/revalidate', () => {
    beforeEach(() => {
        revalidatePath.mockReset()
        revalidateTag.mockReset()
    })

    it('points at the real blog sitemap route', () => {
        // A moved route would otherwise leave revalidatePath a silent no-op.
        const routeFile = join(
            process.cwd(),
            'app',
            BLOG_SITEMAP_PATH,
            'route.ts'
        )
        expect(existsSync(routeFile)).toBe(true)
    })

    it('expires the blog sitemap path when sitemap-urls is sent', async () => {
        const response = await post({
            secret: SECRET,
            tags: ['blog-posts', 'sitemap-urls', 'blog-post-some-slug'],
        })

        expect(response.status).toBe(200)
        expect(revalidatePath).toHaveBeenCalledTimes(1)
        expect(revalidatePath).toHaveBeenCalledWith('/sitemap/blog.xml')
        expect(revalidateTag).toHaveBeenCalledTimes(3)
        expect(revalidateTag).toHaveBeenCalledWith('sitemap-urls', {
            expire: 0,
        })
    })

    it('leaves the sitemap alone for other tags', async () => {
        const response = await post({
            secret: SECRET,
            tags: ['blog-posts', 'blog-post-some-slug'],
        })

        expect(response.status).toBe(200)
        expect(revalidatePath).not.toHaveBeenCalled()
        expect(revalidateTag).toHaveBeenCalledTimes(2)
    })

    it('rejects a wrong secret without revalidating anything', async () => {
        const response = await post({
            secret: 'wrong',
            tags: ['sitemap-urls'],
        })

        expect(response.status).toBe(401)
        expect(revalidatePath).not.toHaveBeenCalled()
        expect(revalidateTag).not.toHaveBeenCalled()
    })

    it('rejects an unknown tag without revalidating anything', async () => {
        const response = await post({
            secret: SECRET,
            tags: ['sitemap-urls', 'not-a-real-tag'],
        })

        expect(response.status).toBe(400)
        expect(revalidatePath).not.toHaveBeenCalled()
        expect(revalidateTag).not.toHaveBeenCalled()
    })
})
