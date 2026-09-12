/**
 * Tests for the keyword ownership registry (@workspace/shared/seo).
 *
 * The integrity suite is the real guard: it fails CI when an edit
 * introduces a double-owned query cluster or a dangling reference.
 */
import { describe, expect, it } from 'vitest'

import {
    BLOG_POST_ENTRIES,
    findSimilarOwnedQueries,
    getKeywordRegistry,
    getRegistryIntegrityIssues,
    normalizeQuery,
    resolveCanonicalOwner,
    resolveQueryOwner,
} from '@workspace/shared/seo'

describe('registry integrity', () => {
    it('has no invariant violations', () => {
        expect(getRegistryIntegrityIssues()).toEqual([])
    })

    it('contains every published post exactly once (143 posts as of seed)', () => {
        const liveBlog = BLOG_POST_ENTRIES.filter(
            (e) => e.status === 'live' && e.slug
        )
        // 156 at seed, less the two BBL recovery posts retired in #229 and
        // the eleven January-batch BBL posts folded in #231 (five comparison
        // posts into /blog/tummy-tuck-vs-bbl-miami, six "mom" posts into the
        // procedure page).
        expect(liveBlog.length).toBe(143)
        expect(new Set(liveBlog.map((e) => e.slug)).size).toBe(liveBlog.length)
    })

    it('derives blog URLs from the publish-date rule', () => {
        const legacy = BLOG_POST_ENTRIES.find(
            (e) => e.slug === 'how-long-to-recover-from-bbl'
        )
        const modern = BLOG_POST_ENTRIES.find(
            (e) => e.slug === 'bbl-recovery-time-miami'
        )
        expect(legacy?.url).toBe('/how-long-to-recover-from-bbl')
        expect(modern?.url).toBe('/blog/bbl-recovery-time-miami')
    })
})

describe('resolveQueryOwner', () => {
    it("resolves 'bbl cost miami' to /bbl-cost-miami (issue #129 acceptance)", () => {
        const result = resolveQueryOwner('bbl cost miami')
        expect(result?.owner.url).toBe('/bbl-cost-miami')
    })

    it('is normalization-insensitive', () => {
        expect(resolveQueryOwner('  BBL Cost, Miami? ')?.owner.url).toBe(
            '/bbl-cost-miami'
        )
    })

    it('resolves procedure head terms to procedure pages', () => {
        expect(resolveQueryOwner('tummy tuck miami')?.owner.url).toBe(
            '/procedures/tummy-tuck-miami'
        )
        expect(resolveQueryOwner('brazilian butt lift miami')?.owner.url).toBe(
            '/procedures/brazilian-butt-lift-bbl-miami'
        )
    })

    it('resolves blog long-tail to the owning post', () => {
        const result = resolveQueryOwner('tummy tuck drains')
        expect(result?.owner.slug).toBe(
            'tummy-tuck-drains-what-they-are-how-long-they-stay'
        )
    })

    it('follows duplicateOf to the canonical cluster owner', () => {
        const result = resolveQueryOwner('bbl recovery mistakes miami')
        expect(result?.owner.slug).toBe('bbl-recovery-mistakes-miami')
        expect(result?.canonicalOwner.url).toBe(
            '/blog/miami-bbl-recovery-guide'
        )
    })

    it('routes every BBL comparison query to the single comparison post (#231)', () => {
        for (const query of [
            'bbl vs tummy tuck',
            'liposuction vs bbl',
            'bbl vs butt implants',
            'bbl vs mommy makeover',
        ]) {
            expect(resolveQueryOwner(query)?.owner.slug).toBe(
                'tummy-tuck-vs-bbl-miami'
            )
        }
    })

    it('marks the folded January-batch posts retired with their 308 target (#231)', () => {
        const carrier = '/blog/tummy-tuck-vs-bbl-miami'
        const procedure = '/procedures/brazilian-butt-lift-bbl-miami'
        const folded: Array<[string, string]> = [
            ['liposuction-vs-bbl-miami', carrier],
            ['bbl-vs-butt-implants-miami', carrier],
            ['mommy-makeover-vs-bbl-miami', carrier],
            ['combine-bbl-tummy-tuck-miami', carrier],
            ['breast-aug-vs-bbl-miami-moms', carrier],
            ['bbl-miami-results-timeline', procedure],
            ['bbl-myths-miami-moms', procedure],
            ['bbl-before-after-miami-mom', procedure],
            ['bbl-miami-post-pregnancy-guide', procedure],
            ['bbl-safety-miami', procedure],
            ['bbl-miami-post-pregnancy-quiz', procedure],
        ]
        for (const [slug, redirectsTo] of folded) {
            const entry = BLOG_POST_ENTRIES.find((e) => e.slug === slug)
            expect(entry?.status, slug).toBe('retired')
            expect(entry?.redirectsTo, slug).toBe(redirectsTo)
        }
    })

    it('keeps the folded safety and results intent on the procedure page (#231)', () => {
        for (const query of [
            'bbl safety',
            'bbl risks',
            'bbl results',
            'am i a candidate for a bbl',
        ]) {
            expect(resolveQueryOwner(query)?.canonicalOwner.url, query).toBe(
                '/procedures/brazilian-butt-lift-bbl-miami'
            )
        }
    })

    it('gives money pages precedence over blog posts on shared queries', () => {
        // The live post affordable-plastic-surgery-miami targets a query
        // owned by the planned cost hub — the hub wins
        const result = resolveQueryOwner('affordable plastic surgery miami')
        expect(result?.owner.url).toBe('/plastic-surgery-cost-miami')
    })

    it('returns null for unclaimed clusters', () => {
        expect(resolveQueryOwner('rhinoplasty recovery timeline')).toBeNull()
    })
})

describe('findSimilarOwnedQueries', () => {
    it('catches persona-variants of an owned query', () => {
        const matches = findSimilarOwnedQueries('bbl recovery time', {
            threshold: 0.5,
        })
        expect(
            matches.some((m) => m.owner.slug === 'bbl-recovery-time-miami')
        ).toBe(true)
    })

    it('returns nothing for unrelated queries', () => {
        expect(
            findSimilarOwnedQueries('best sunscreen for florida beaches')
        ).toEqual([])
    })

    it('scores in [0,1] and sorts best first', () => {
        const matches = findSimilarOwnedQueries('tummy tuck recovery', {
            threshold: 0.3,
        })
        expect(matches.length).toBeGreaterThan(0)
        for (const m of matches) {
            expect(m.score).toBeGreaterThan(0)
            expect(m.score).toBeLessThanOrEqual(1)
        }
        const scores = matches.map((m) => m.score)
        expect([...scores].sort((a, b) => b - a)).toEqual(scores)
    })
})

describe('normalizeQuery', () => {
    it('lowercases, strips punctuation, collapses whitespace', () => {
        expect(normalizeQuery('  How Much is a BBL?! ')).toBe(
            'how much is a bbl'
        )
    })

    it('keeps Spanish characters', () => {
        expect(normalizeQuery('Cirugía Plástica')).toBe('cirugía plástica')
    })
})

describe('resolveCanonicalOwner', () => {
    it('is identity for canonical entries', () => {
        const owner = getKeywordRegistry().find(
            (e) => e.url === '/procedures/tummy-tuck-miami'
        )!
        expect(resolveCanonicalOwner(owner)).toBe(owner)
    })
})
