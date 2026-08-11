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

    it('contains every published post exactly once (156 posts as of seed)', () => {
        const liveBlog = BLOG_POST_ENTRIES.filter(
            (e) => e.status === 'live' && e.slug
        )
        expect(liveBlog.length).toBe(156)
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
        expect(result?.canonicalOwner.url).toBe('/blog/bbl-recovery-time-miami')
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
