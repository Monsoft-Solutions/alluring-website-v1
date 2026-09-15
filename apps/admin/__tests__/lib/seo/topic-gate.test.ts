/**
 * Tests for the ideation gate (issue #130 acceptance).
 */
import { describe, expect, it } from 'vitest'

import { evaluateTopicCandidate, type OwnedPage } from '@workspace/shared/seo'

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
            title: 'Tummy Tuck Recovery Myths for Miami Moms',
            primaryKeyword: 'tummy tuck recovery myths miami moms',
        })
        expect(verdict.verdict).toBe('refresh')
        expect(verdict.owningUrl).toBe('/blog/tummy-tuck-myths-miami-moms')
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
