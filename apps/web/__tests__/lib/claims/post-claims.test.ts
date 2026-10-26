/**
 * Claim tokens in a blog post's fields (issue #354): resolved before the MDX
 * compiler sees the body, struck through in the body while a discount is on,
 * plain text everywhere else, the 456.062 statement once, and nothing raw
 * left for a reader when a token can't be resolved.
 */
import { compileMDX } from 'next-mdx-remote/rsc'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import {
    buildPricingSnapshot,
    DEFAULT_PROCEDURE_SETTINGS,
    FALLBACK_PRICING,
} from '@workspace/shared/claims/prices'
import type { ClaimTokenIssue } from '@workspace/shared/claims/tokens'

import {
    resolvePostDetailClaims,
    resolvePostTextClaims,
} from '@/lib/claims/post-claims.util'
import { composePostSource, getPostMdxOptions } from '@/lib/blog/post-mdx.util'
import { normalizeMdxSource } from '@/lib/utils/mdx-source.util'
import { findCTAInsertionPoint } from '@/lib/utils/inject-cta-marker.util'

const STATEMENT = 'Statement text as counsel confirms it.'

/** The 2026-09-15 sheet with BBL 20% off and the statement set. */
const DISCOUNTED = buildPricingSnapshot({
    source: 'db',
    lines: FALLBACK_PRICING.lines,
    procedures: DEFAULT_PROCEDURE_SETTINGS.map((row) =>
        row.procedure === 'bbl' ? { ...row, discountPercent: 20 } : row
    ),
    settings: {
        defaultDiscountPercent: 0,
        discountStatement: STATEMENT,
        comboDiscountTwoUsd: 500,
        comboDiscountThreeUsd: 1000,
        updatedAt: null,
    },
})

function post(
    overrides: Partial<Parameters<typeof resolvePostDetailClaims>[0]> = {}
) {
    return {
        slug: 'bbl-cost-miami',
        title: 'How much is a BBL in Miami?',
        metaTitle: 'BBL cost in Miami: from [[price:bbl]]',
        metaDescription:
            'A BBL at Alluring starts at [[price:bbl]], and [[price-range:bbl]].',
        excerpt: 'Starting at [[price:bbl]]. [[price-caveat]]',
        content: [
            '## How much is a BBL?',
            '',
            'A BBL at Alluring starts at [[price:bbl]], and [[price-range:bbl]]. [[price-caveat:long]]',
            '',
            '<!-- CTA:consultation -->',
            '',
            '## Can I add a tummy tuck?',
            '',
            'A full tummy tuck is [[price:tummy-tuck:full]]. [[combo-discount]]',
        ].join('\n'),
        quickAnswer:
            'How much is a BBL in Miami?\n\nA BBL at Alluring starts at [[price:bbl]].',
        faqs: [
            {
                question: 'Is [[price:bbl]] the final price?',
                answer: 'No. [[price-caveat:long]]',
            },
        ],
        ...overrides,
    }
}

async function renderBody(content: string): Promise<string> {
    const { beforeCTA, afterCTA } = findCTAInsertionPoint(content)
    const { content: element } = await compileMDX({
        source: normalizeMdxSource(composePostSource(beforeCTA, afterCTA)),
        options: getPostMdxOptions(),
        components: { PostSplitSlot: () => null },
    })
    return renderToStaticMarkup(element)
}

describe('resolvePostDetailClaims', () => {
    it('resolves every field from the sheet, with no statement', () => {
        const report = vi.fn()
        const resolved = resolvePostDetailClaims(
            post(),
            FALLBACK_PRICING,
            report
        )

        expect(resolved.metaTitle).toBe('BBL cost in Miami: from $5,500')
        expect(resolved.metaDescription).toBe(
            'A BBL at Alluring starts at $5,500, and most patients pay between $5,500 and $10,000.'
        )
        expect(resolved.content).toContain('A full tummy tuck is $4,500.')
        expect(resolved.content).toContain(
            'When procedures are combined in one surgery, $500 comes off the total for two procedures and $1,000 for three.'
        )
        expect(resolved.faqs?.[0]?.question).toBe('Is $5,500 the final price?')
        expect(resolved.discountStatement).toBeNull()
        expect(report).not.toHaveBeenCalled()
        expect(JSON.stringify(resolved)).not.toContain('[[')
    })

    it('strikes the body through and keeps meta, FAQs and quick answer plain', () => {
        const resolved = resolvePostDetailClaims(post(), DISCOUNTED, vi.fn())

        expect(resolved.content).toContain(
            'starts at ~~$5,500~~ $4,400, and most patients pay between ~~$5,500~~ $4,400 and ~~$10,000~~ $8,000.'
        )
        // Not discounted: tummy tuck carries no discount of its own.
        expect(resolved.content).toContain('A full tummy tuck is $4,500.')
        expect(resolved.metaDescription).toBe(
            'A BBL at Alluring starts at $4,400 (20% off $5,500), and most patients pay between $4,400 and $8,000 (20% off $5,500 and $10,000).'
        )
        expect(resolved.quickAnswer).toContain(
            'starts at $4,400 (20% off $5,500).'
        )
        expect(resolved.faqs?.[0]?.question).toBe(
            'Is $4,400 (20% off $5,500) the final price?'
        )
        expect(resolved.discountStatement).toBe(STATEMENT)
    })

    it('renders a discounted price as <del> through the post MDX pipeline', async () => {
        const resolved = resolvePostDetailClaims(post(), DISCOUNTED, vi.fn())
        const html = await renderBody(resolved.content)

        expect(html).toContain('<del>$5,500</del> $4,400')
        expect(html).toContain('<del>$10,000</del> $8,000')
        expect(html).not.toContain('[[')
        expect(html).not.toContain('~~')
    })

    it('gives no second statement when the post places [[discount-statement]]', () => {
        const resolved = resolvePostDetailClaims(
            post({
                content:
                    'A BBL starts at [[price:bbl]]. [[price-caveat]] [[discount-statement]]',
            }),
            DISCOUNTED,
            vi.fn()
        )
        expect(resolved.content).toContain(STATEMENT)
        expect(resolved.discountStatement).toBeNull()
    })

    it('shows the statement for a discount in a field other than the body', () => {
        const resolved = resolvePostDetailClaims(
            post({ content: 'No price here.' }),
            DISCOUNTED,
            vi.fn()
        )
        expect(resolved.discountStatement).toBe(STATEMENT)
    })

    it('renders an unknown or malformed token as nothing, and reports it with its field', () => {
        const issues: [string, ClaimTokenIssue][] = []
        const resolved = resolvePostDetailClaims(
            post({
                content:
                    'From [[price:bbl]].[[price:no-such-procedure]] Ask [[Surgeon:Name]] or [[phone',
                metaTitle: 'Cost [[pirce:bbl]]',
            }),
            FALLBACK_PRICING,
            (field, issue) => issues.push([field, issue])
        )

        // A token that prints nothing takes the space before it along.
        expect(resolved.content).toBe('From $5,500. Ask or')
        expect(resolved.metaTitle).toBe('Cost')
        expect(issues.map(([field, issue]) => [field, issue.raw])).toEqual([
            ['metaTitle', '[[pirce:bbl]]'],
            ['content', '[[price:no-such-procedure]]'],
            ['content', '[[Surgeon:Name]]'],
            ['content', '[[phone'],
        ])
    })

    it('leaves text without tokens, and a digit in brackets, untouched', () => {
        const content =
            'See note [[1]] and the [ASPS](https://plasticsurgery.org) page.'
        const resolved = resolvePostDetailClaims(
            post({ content }),
            FALLBACK_PRICING,
            vi.fn()
        )
        expect(resolved.content).toBe(content)
    })
})

describe('resolvePostTextClaims', () => {
    it('resolves a card title and excerpt as plain text', () => {
        const card = resolvePostTextClaims(
            {
                slug: 'tummy-tuck-cost',
                title: 'Tummy tuck from [[price:tummy-tuck]]',
                excerpt:
                    'A [[price-label:tummy-tuck]] is [[price:tummy-tuck]].',
                publishedAt: null,
            },
            FALLBACK_PRICING,
            vi.fn()
        )
        expect(card).toEqual({
            slug: 'tummy-tuck-cost',
            title: 'Tummy tuck from $3,000',
            excerpt: 'A mini tummy tuck (no muscle repair) is $3,000.',
            publishedAt: null,
        })
    })

    it('leaves a card with no excerpt field without one', () => {
        const card = resolvePostTextClaims(
            { slug: 'x', title: '[[surgeon:short]] on BBL' },
            FALLBACK_PRICING,
            vi.fn()
        )
        expect(card).toEqual({ slug: 'x', title: 'Dr. Karlinsky on BBL' })
    })
})
