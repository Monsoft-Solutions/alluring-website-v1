import { readdirSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import {
    getPageContext,
    getPageType,
    getProcedure,
} from '@/lib/analytics/page-context'

const APP_DIR = path.resolve(__dirname, '../../../app')

/** Every `page.tsx` under app/, as a route with `[param]` segments. */
function listRoutes(dir: string, prefix = ''): string[] {
    const routes: string[] = []
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.isFile() && entry.name === 'page.tsx') {
            routes.push(prefix || '/')
        }
        if (!entry.isDirectory()) continue
        // Route groups `(x)` and private folders `_x` add no URL segment.
        if (entry.name.startsWith('_') || entry.name === 'api') continue
        const segment = /^\(.*\)$/.test(entry.name) ? '' : `/${entry.name}`
        routes.push(
            ...listRoutes(path.join(dir, entry.name), `${prefix}${segment}`)
        )
    }
    return routes
}

describe('getPageType', () => {
    it.each([
        ['/', 'home'],
        ['/procedures', 'procedure_index'],
        ['/procedures/brazilian-butt-lift-bbl-miami', 'procedure'],
        ['/blog', 'blog_index'],
        ['/blog/categories/bbl', 'blog_index'],
        ['/how-to-reduce-tightness-after-tummy-tuck', 'blog_post'],
        ['/dr-karlinsky', 'surgeon'],
        ['/gallery/bbl', 'gallery'],
        ['/lp/request-consultation', 'lp'],
        ['/lp/request-consultation/thank-you', 'thank_you'],
        ['/landing/procedure/liposuction-miami', 'landing'],
        ['/thank-you', 'thank_you'],
        ['/miami-plastic-surgery-specials', 'specials'],
        ['/promotions/love-your-body', 'specials'],
        ['/plastic-surgery-financing-miami', 'financing'],
        ['/contact-us', 'consultation'],
        ['/free-consultation/miami', 'consultation'],
        ['/reviews/page/2', 'reviews'],
        ['/instagram/abc123', 'social'],
    ])('%s → %s', (pathname, expected) => {
        expect(getPageType(pathname)).toBe(expected)
    })

    it('ignores the query string, hash and trailing slash', () => {
        expect(getPageType('/contact-us/?utm_source=google#form')).toBe(
            'consultation'
        )
    })

    it('classifies every route in app/', () => {
        const unclassified = listRoutes(APP_DIR)
            .map((route) => route.replace(/\[\.{0,3}[^\]]+\]/g, 'sample'))
            .filter((route) => getPageType(route) === 'other')
        expect(unclassified).toEqual([])
    })

    // Blog posts are the root fallback, so a new static page with no entry
    // would silently count as a post. Static routes must be listed.
    it('never files a static route as a blog post', () => {
        const misfiled = listRoutes(APP_DIR)
            .filter((route) => !route.includes('['))
            .filter((route) => getPageType(route) === 'blog_post')
        expect(misfiled).toEqual([])
    })
})

describe('getProcedure', () => {
    it.each([
        ['/procedures/brazilian-butt-lift-bbl-miami', 'bbl'],
        ['/bbl-compression-garment-timeline', 'bbl'],
        ['/mommy-makeover-tummy-tuck-recovery', 'mommy_makeover'],
        ['/procedures/liposuction-miami', 'liposuction'],
        ['/lipo-360-cost', 'liposuction'],
        ['/breast-lift-with-implants', 'breast_lift'],
        [
            '/how-often-to-massage-breast-after-augmentation',
            'breast_augmentation',
        ],
        ['/best-age-breast-augmentation-miami', 'breast_augmentation'],
        ['/breast-reduction-recovery', 'breast_reduction'],
        ['/procedures/facelift-miami', 'facelift'],
        ['/eyelid-surgery-recovery', 'blepharoplasty'],
        ['/how-to-reduce-pubic-swelling-after-tummy-tuck', 'tummy_tuck'],
        ['/safe-plastic-surgery-miami', 'none'],
        ['/', 'none'],
    ])('%s → %s', (pathname, expected) => {
        expect(getProcedure(pathname)).toBe(expected)
    })
})

describe('getPageContext', () => {
    it('joins type and procedure into the content group', () => {
        expect(getPageContext('/procedures/liposuction-miami')).toEqual({
            page_type: 'procedure',
            procedure: 'liposuction',
            content_group: 'procedure:liposuction',
        })
    })

    it('uses the bare type when there is no procedure', () => {
        expect(getPageContext('/about').content_group).toBe('about')
    })
})
