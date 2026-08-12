/**
 * Tests for the generated-MDX validator.
 *
 * Every case here corresponds to a construct verified against MDX 3.1.1 — the
 * compiler `next-mdx-remote` v6 wraps — as either a compile-time or a
 * render-time throw. Since the blog renderer runs without a sanitizer, each of
 * these would otherwise be an unhandled error on a public URL.
 */
import { describe, expect, it } from 'vitest'

import { validateGeneratedMdx } from '@workspace/ai/functions/validate-generated-mdx.function'

describe('validateGeneratedMdx', () => {
    describe('clean content', () => {
        it('leaves plain markdown untouched', () => {
            const content =
                '## How long do drains stay in?\n\nMost come out in 7 to 14 days.'

            const result = validateGeneratedMdx(content)

            expect(result.clean).toBe(true)
            expect(result.actions).toEqual([])
            expect(result.content).toBe(content)
        })

        it('leaves GFM tables untouched', () => {
            const content =
                '| Option | Recovery |\n| --- | --- |\n| Mini | 2 weeks |'

            expect(validateGeneratedMdx(content).clean).toBe(true)
        })

        it('keeps documented components', () => {
            const content =
                '<CalloutBox type="warning">\nCall your surgeon.\n</CalloutBox>'

            const result = validateGeneratedMdx(content)

            expect(result.clean).toBe(true)
            expect(result.content).toContain('<CalloutBox type="warning">')
        })

        it('keeps a self-closing Figure with its props', () => {
            const content =
                '<Figure src="PENDING" alt="Timeline" caption="Swelling peaks at day 3." />'

            const result = validateGeneratedMdx(content)

            expect(result.clean).toBe(true)
            expect(result.content).toBe(content)
        })

        it('is idempotent', () => {
            const messy =
                'Intro\n\n<Callout type="x">Careful</Callout>\n\n<!-- CTA:bogus -->\n\nOutro'

            const once = validateGeneratedMdx(messy)
            const twice = validateGeneratedMdx(once.content)

            expect(twice.clean).toBe(true)
            expect(twice.content).toBe(once.content)
        })
    })

    describe('unknown components (render-time throw)', () => {
        it('strips the tags but keeps the words', () => {
            const content =
                'Before\n\n<Callout type="warning">Do not lift heavy objects.</Callout>\n\nAfter'

            const result = validateGeneratedMdx(content)

            expect(result.clean).toBe(false)
            expect(result.content).not.toContain('<Callout')
            expect(result.content).toContain('Do not lift heavy objects.')
            expect(result.actions[0]?.kind).toBe('unknown-component')
        })

        it('removes a self-closing unknown component entirely', () => {
            const result = validateGeneratedMdx(
                'Text\n\n<PriceTable rows={3} />'
            )

            expect(result.content).not.toContain('PriceTable')
            expect(result.actions[0]?.kind).toBe('unknown-component')
        })

        it('leaves lowercase HTML alone', () => {
            const result = validateGeneratedMdx('<div class="x">hi</div>')

            expect(result.clean).toBe(true)
        })
    })

    describe('renderer-owned components', () => {
        it('removes a writer-authored QuickAnswer and its children', () => {
            const content =
                '<QuickAnswer question="How much?" answer="$4,500." />\n\n## Real content'

            const result = validateGeneratedMdx(content)

            expect(result.content).not.toContain('QuickAnswer')
            expect(result.content).toContain('## Real content')
            expect(result.actions[0]?.kind).toBe('renderer-owned-component')
        })

        it('removes the paired form along with the duplicated answer text', () => {
            const content =
                '<QuickAnswer question="How much?" answer="x">$4,500 all in.</QuickAnswer>\n\nBody'

            const result = validateGeneratedMdx(content)

            expect(result.content).not.toContain('$4,500 all in.')
            expect(result.content).toContain('Body')
        })
    })

    describe('unbalanced components (compile-time throw)', () => {
        it('removes a component that is never closed', () => {
            const content = 'Intro\n\n<CalloutBox type="info">Never closed'

            const result = validateGeneratedMdx(content)

            expect(result.content).not.toContain('<CalloutBox')
            expect(result.actions.map((a) => a.kind)).toContain(
                'unbalanced-component'
            )
        })
    })

    describe('HTML comments (compile-time throw)', () => {
        it('keeps a single valid CTA marker', () => {
            const content = 'Before\n\n<!-- CTA:bbl -->\n\nAfter'

            const result = validateGeneratedMdx(content)

            expect(result.clean).toBe(true)
            expect(result.content).toContain('<!-- CTA:bbl -->')
        })

        it('drops the second CTA marker, which survives the body split and crashes the page', () => {
            const content =
                'A\n\n<!-- CTA:bbl -->\n\nB\n\n<!-- CTA:breast -->\n\nC'

            const result = validateGeneratedMdx(content)

            expect(result.content).toContain('<!-- CTA:bbl -->')
            expect(result.content).not.toContain('<!-- CTA:breast -->')
            expect(result.actions.map((a) => a.kind)).toContain(
                'duplicate-cta-marker'
            )
        })

        it('removes non-CTA comments', () => {
            const result = validateGeneratedMdx(
                'A\n\n<!-- TODO: add table -->\n\nB'
            )

            expect(result.content).not.toContain('<!--')
            expect(result.actions[0]?.kind).toBe('stray-html-comment')
        })
    })

    describe('CTA ids (silent conversion loss)', () => {
        it('clamps an id the renderer cannot resolve', () => {
            const result = validateGeneratedMdx(
                'A\n\n<!-- CTA:freeconsult -->\n\nB'
            )

            expect(result.content).toContain('<!-- CTA:consultation -->')
            expect(result.actions[0]?.kind).toBe('invalid-cta-id')
        })

        it('gives a bare marker an explicit id', () => {
            const result = validateGeneratedMdx('A\n\n<!-- CTA -->\n\nB')

            expect(result.content).toContain('<!-- CTA:consultation -->')
        })

        it('accepts every documented id', () => {
            for (const id of [
                'default',
                'consultation',
                'bbl',
                'breast',
                'body',
                'facial',
            ]) {
                const result = validateGeneratedMdx(
                    `A\n\n<!-- CTA:${id} -->\n\nB`
                )
                expect(result.content).toContain(`<!-- CTA:${id} -->`)
            }
        })
    })

    describe('stray expressions (render-time throw)', () => {
        it('escapes braces in body text', () => {
            const result = validateGeneratedMdx('Costs {price} dollars.')

            expect(result.content).toBe('Costs &#123;price&#125; dollars.')
            expect(result.actions[0]?.kind).toBe('stray-expression')
        })

        it('leaves braces inside component props alone', () => {
            const content = '<Figure src="PENDING" alt="x" width={1200} />'

            const result = validateGeneratedMdx(content)

            expect(result.clean).toBe(true)
            expect(result.content).toContain('width={1200}')
        })
    })
})
