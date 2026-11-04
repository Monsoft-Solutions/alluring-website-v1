/**
 * Tests for the ideation gate (issue #130 acceptance).
 */
import { describe, expect, it } from 'vitest'

import {
    evaluateTopicCandidate,
    findSimilarOwnedQueries,
    type OwnedPage,
} from '@workspace/shared/seo'

describe('evaluateTopicCandidate', () => {
    it("rejects 'bbl cost miami' as owned by the BBL procedure page (acceptance)", () => {
        const verdict = evaluateTopicCandidate({
            title: 'BBL Cost in Miami: Complete 2026 Guide',
            primaryKeyword: 'bbl cost miami',
        })
        expect(verdict.verdict).toBe('reject')
        expect(verdict.owningUrl).toBe(
            '/procedures/brazilian-butt-lift-bbl-miami'
        )
    })

    it("yields 'refresh' pointing at the post for an existing post's topic (acceptance)", () => {
        const verdict = evaluateTopicCandidate({
            title: 'Tummy Tuck Drains Explained',
            primaryKeyword: 'tummy tuck drains',
        })
        expect(verdict.verdict).toBe('refresh')
        expect(verdict.owningSlug).toBe(
            'tummy-tuck-drains-what-they-are-how-long-they-stay'
        )
    })

    it('follows duplicate clusters to the canonical owner on refresh', () => {
        const verdict = evaluateTopicCandidate({
            title: 'How to Choose Plastic Surgeons in Miami',
            primaryKeyword: 'choose plastic surgeons miami',
        })
        expect(verdict.verdict).toBe('refresh')
        expect(verdict.owningUrl).toBe(
            '/how-to-choose-the-best-plastic-surgeon-in-miami-10-things-to-look-for'
        )
    })

    it('rejects retired topics', () => {
        const verdict = evaluateTopicCandidate({
            title: 'Facelift Cost in Miami',
            primaryKeyword: 'facelift cost miami',
        })
        expect(verdict.verdict).toBe('reject')
    })

    it('sends BBL recovery topics to the one recovery page as refresh', () => {
        for (const primaryKeyword of [
            'bbl recovery timeline',
            '6 weeks post op bbl',
        ]) {
            const verdict = evaluateTopicCandidate({
                title: 'BBL Recovery Week by Week',
                primaryKeyword,
            })
            expect(verdict.verdict, primaryKeyword).toBe('refresh')
            expect(verdict.owningUrl, primaryKeyword).toBe(
                '/how-long-to-recover-from-bbl'
            )
        }
    })

    it('rejects a folded recovery post and points at the page it redirects to', () => {
        const verdict = evaluateTopicCandidate({
            title: 'BBL Recovery Mistakes to Avoid',
            primaryKeyword: 'bbl recovery mistakes miami',
        })
        expect(verdict.verdict).toBe('reject')
        expect(verdict.owningUrl).toBe('/how-long-to-recover-from-bbl')
    })

    it('rejects near-duplicates of owned queries by similarity', () => {
        // 'tummy tuck recovery time' is a strict token-subset of the owned
        // 'tummy tuck recovery time miami' — no exact match, high overlap
        const verdict = evaluateTopicCandidate({
            title: 'Tummy Tuck Recovery Time',
            primaryKeyword: 'tummy tuck recovery time',
        })
        expect(verdict.verdict).not.toBe('new')
        expect(verdict.owningUrl).toBeDefined()
    })

    it('passes genuinely new topics with claimed queries', () => {
        const verdict = evaluateTopicCandidate({
            title: 'Can You Fly After Rhinoplasty? What Surgeons Recommend',
            primaryKeyword: 'flying after rhinoplasty',
            secondaryKeywords: ['rhinoplasty air travel'],
        })
        expect(verdict.verdict).toBe('new')
        expect(verdict.claimedQueries).toContain('flying after rhinoplasty')
        expect(verdict.claimedQueries).toContain('rhinoplasty air travel')
        expect(verdict.warnings).toEqual([])
    })

    it('warns when a secondary keyword is owned elsewhere', () => {
        const verdict = evaluateTopicCandidate({
            title: 'Packing List for Your Rhinoplasty Trip',
            primaryKeyword: 'rhinoplasty packing list',
            secondaryKeywords: ['bbl cost miami'],
        })
        expect(verdict.verdict).toBe('new')
        expect(verdict.warnings.length).toBe(1)
        expect(verdict.warnings[0]).toContain(
            '/procedures/brazilian-butt-lift-bbl-miami'
        )
        expect(verdict.claimedQueries).not.toContain('bbl cost miami')
    })

    it('falls back to the title when no primary keyword is given', () => {
        const verdict = evaluateTopicCandidate({
            title: 'bbl cost miami',
        })
        expect(verdict.verdict).toBe('reject')
        expect(verdict.owningUrl).toBe(
            '/procedures/brazilian-butt-lift-bbl-miami'
        )
    })

    it('considers live overlay entries not in the checked-in registry', () => {
        const overlay: OwnedPage[] = [
            {
                url: '/blog/brand-new-post',
                slug: 'brand-new-post',
                kind: 'blog',
                intent: 'informational',
                status: 'live',
                primaryKeyword: 'brand new topic keyword',
                ownsQueries: [],
            },
        ]
        const verdict = evaluateTopicCandidate(
            {
                title: 'Brand New Topic Keyword Guide',
                primaryKeyword: 'brand new topic keyword',
            },
            { extraEntries: overlay }
        )
        expect(verdict.verdict).toBe('refresh')
        expect(verdict.owningUrl).toBe('/blog/brand-new-post')
    })
})

describe('gate regressions — synonym-titled and containment matches (prod 2026-08-12)', () => {
    // /why-do-bbl-stink ranks for "bbl smell" but its slug carries only
    // "stink". These candidates sailed through as 'new' in production before
    // title queries + containment scoring; its registry entry now also owns
    // the smell queries outright.
    it("routes 'bbl smell' to the existing stink post as refresh", () => {
        const verdict = evaluateTopicCandidate({
            title: "BBL Smell After Surgery: What's Normal & What's Not",
            primaryKeyword: 'bbl smell',
        })
        expect(verdict.verdict).toBe('refresh')
        expect(verdict.owningSlug).toBe('why-do-bbl-stink')
    })

    it('folds plurals: "do bbls smell" also resolves to the stink post', () => {
        const verdict = evaluateTopicCandidate({
            title: "Do BBLs Really Smell? The Truth Surgeons Won't Tell You",
            primaryKeyword: 'do bbls smell',
        })
        expect(verdict.verdict).toBe('refresh')
        expect(verdict.owningSlug).toBe('why-do-bbl-stink')
    })

    it('rejects a surgeon-profile topic that competes with the surgeon page', () => {
        const verdict = evaluateTopicCandidate({
            title: "Meet Dr. Karlinsky: Miami's Trusted Plastic Surgeon",
            primaryKeyword: 'dr. karlinsky',
        })
        expect(verdict.verdict).toBe('reject')
        expect(verdict.owningUrl).toBe('/dr-karlinsky')
    })
})

describe('gate regressions — shared generic words are not overlap (#357)', () => {
    /** The owned queries a candidate would collide with at the gate's reject threshold */
    const collisions = (query: string) =>
        findSimilarOwnedQueries(query, { threshold: 0.7, limit: 50 }).map(
            (match) => match.query
        )

    // Each of these came back from the gate on 2026-11-03 as a false overlap.
    it('does not match "pregnancy after tummy tuck" to "tummy tuck before and after"', () => {
        expect(collisions('pregnancy after tummy tuck')).not.toContain(
            'tummy tuck before and after'
        )
    })

    it('does not match "tummy tuck after c section" to "how long to recover tummy tuck"', () => {
        for (const query of [
            'tummy tuck after c section',
            'Tummy Tuck After a C-Section: How Long to Wait',
        ]) {
            expect(collisions(query), query).not.toContain(
                'how long to recover tummy tuck'
            )
        }
    })

    it('does not match "diastasis recti surgery" to "tummy tuck surgery"', () => {
        for (const query of [
            'diastasis recti surgery',
            'Diastasis Recti Surgery and the Tummy Tuck',
        ]) {
            expect(collisions(query), query).not.toContain('tummy tuck surgery')
        }
    })

    it('does not match "is a tummy tuck safe" to a post with "safe" in its title', () => {
        expect(collisions('is a tummy tuck safe')).not.toContain(
            'exercises after tummy tuck miami safe timeline'
        )
    })

    it('applies to other two-word procedures too', () => {
        expect(collisions('pregnancy after breast lift')).not.toContain(
            'breast lift'
        )
        expect(collisions('how long after bbl can i sit')).not.toContain(
            'how to sleep after bbl'
        )
    })
})

describe('gate guards — real near-duplicates still collide (#357)', () => {
    const best = (query: string) =>
        findSimilarOwnedQueries(query, { threshold: 0.7, limit: 50 }).map(
            (match) => match.owner.url
        )

    it('a topic restated in other words still refreshes its post', () => {
        const verdict = evaluateTopicCandidate({
            title: 'How Long Do Tummy Tuck Drains Stay?',
            primaryKeyword: 'how long do tummy tuck drains stay',
        })
        expect(verdict.verdict).toBe('refresh')
        expect(verdict.owningSlug).toBe(
            'tummy-tuck-drains-what-they-are-how-long-they-stay'
        )
    })

    it('a filler word on an owned head term still rejects', () => {
        for (const primaryKeyword of [
            'best tummy tuck surgery',
            'tummy tuck surgery guide',
            'tummy tuck surgery florida',
            'tummy tuck miami reviews',
        ]) {
            const verdict = evaluateTopicCandidate({
                title: primaryKeyword,
                primaryKeyword,
            })
            expect(verdict.verdict, primaryKeyword).toBe('reject')
            expect(verdict.owningUrl, primaryKeyword).toBe(
                '/procedures/tummy-tuck-miami'
            )
        }
    })

    it('a variation of "before and after" still rejects', () => {
        const verdict = evaluateTopicCandidate({
            title: 'Tummy Tuck Before and After Photos',
            primaryKeyword: 'tummy tuck before and after photos',
        })
        expect(verdict.verdict).toBe('reject')
        expect(verdict.owningUrl).toBe('/procedures/tummy-tuck-miami')
    })

    it('a persona variant still matches in other clusters', () => {
        expect(best('breast augmentation recovery tips for moms')).toContain(
            '/blog/breast-augmentation-recovery-tips-miami'
        )
        expect(best('how long does bbl smell last for')).toContain(
            '/why-do-bbl-stink'
        )
    })

    it('the same two procedures compared twice still collide', () => {
        for (const query of [
            'bbl versus tummy tuck',
            'best tummy tuck vs bbl',
            'tummy tuck vs liposuction tips',
        ]) {
            const verdict = evaluateTopicCandidate({
                title: query,
                primaryKeyword: query,
            })
            expect(verdict.verdict, query).not.toBe('new')
        }
    })
})

describe("gate — the tummy tuck plan's topics (#357)", () => {
    it.each([
        [
            'Pregnancy After a Tummy Tuck: What Happens and When to Wait',
            'pregnancy after tummy tuck',
        ],
        [
            'Tummy Tuck After a C-Section: How Long to Wait',
            'tummy tuck after c section',
        ],
        [
            'Mini vs Full Tummy Tuck: Which One Do You Need?',
            'mini vs full tummy tuck',
        ],
    ])('clears the new post %s', (title, primaryKeyword) => {
        const verdict = evaluateTopicCandidate({ title, primaryKeyword })
        expect(verdict.verdict).toBe('new')
        expect(verdict.warnings).toEqual([])
    })

    it.each([
        ['diastasis recti surgery', 'tummy-tuck-diastasis-recti-miami'],
        ['tummy tuck scar', 'tummy-tuck-scars-miami'],
        ['tummy tuck recovery time', 'how-long-to-recover-tummy-tuck'],
        ['tummy tuck after ozempic', 'ozempic-tummy-tuck-myths-miami'],
    ])('sends %s to refresh its post', (primaryKeyword, owningSlug) => {
        const verdict = evaluateTopicCandidate({
            title: primaryKeyword,
            primaryKeyword,
        })
        expect(verdict.verdict).toBe('refresh')
        expect(verdict.owningSlug).toBe(owningSlug)
    })
})

describe('gate — comparisons are their own intent (#357)', () => {
    it('clears "mini vs full tummy tuck" against the page-owned "mini tummy tuck"', () => {
        for (const query of [
            'mini vs full tummy tuck',
            'Mini vs Full Tummy Tuck: Which One Do You Need?',
        ]) {
            expect(
                findSimilarOwnedQueries(query, {
                    threshold: 0.7,
                    limit: 50,
                }).filter(
                    (m) => m.owner.url === '/procedures/tummy-tuck-miami'
                ),
                query
            ).toEqual([])
        }
    })

    it('does not let a comparison escape a price term', () => {
        const verdict = evaluateTopicCandidate({
            title: 'mini vs full tummy tuck cost',
            primaryKeyword: 'mini vs full tummy tuck cost',
        })
        expect(verdict.verdict).toBe('reject')
        expect(verdict.owningUrl).toBe('/procedures/tummy-tuck-miami')

        expect(
            evaluateTopicCandidate({
                title: 'tummy tuck vs bbl cost',
                primaryKeyword: 'tummy tuck vs bbl cost',
            }).verdict
        ).toBe('reject')
    })

    it('keeps the mini head and price terms on the page', () => {
        for (const primaryKeyword of [
            'mini tummy tuck',
            'mini tummy tuck cost',
        ]) {
            const verdict = evaluateTopicCandidate({
                title: primaryKeyword,
                primaryKeyword,
            })
            expect(verdict.verdict, primaryKeyword).toBe('reject')
            expect(verdict.owningUrl, primaryKeyword).toBe(
                '/procedures/tummy-tuck-miami'
            )
        }
    })
})
