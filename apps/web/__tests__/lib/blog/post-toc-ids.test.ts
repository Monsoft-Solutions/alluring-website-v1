import { compileMDX } from 'next-mdx-remote/rsc'
import { createElement, type ElementType } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import {
    composePostSource,
    getPostMdxOptions,
    POST_SPLIT_SLOT,
    rehypeFaqSections,
} from '@/lib/blog/post-mdx.util'
import { getTocSections } from '@/lib/blog/post-toc.util'
import { extractTableOfContents } from '@/lib/utils/extract-toc.util'
import { findCTAInsertionPoint } from '@/lib/utils/inject-cta-marker.util'

import {
    POST_HEADING_FIXTURES,
    SPLIT_DUPLICATE_SLUGS,
    toPostBody,
} from './fixtures/post-headings.fixture'

const SLOT_MARKUP = '<div data-post-split-slot=""></div>'

const components: Record<string, ElementType> = {
    [POST_SPLIT_SLOT]: () =>
        createElement('div', { 'data-post-split-slot': '' }),
}

/** Renders MDX through the page's own pipeline to static HTML. */
async function renderPost(source: string, v2 = true): Promise<string> {
    const { content } = await compileMDX({
        source,
        options: getPostMdxOptions(v2 ? [rehypeFaqSections] : []),
        components,
    })
    return renderToStaticMarkup(content)
}

/** How many elements in the markup carry this exact id. */
function countId(html: string, id: string): number {
    return html.split(`id="${id}"`).length - 1
}

/** Every TOC id that does not resolve to exactly one element. */
function unresolvedTocIds(body: string, html: string): string[] {
    return extractTableOfContents(body)
        .map((heading) => heading.id)
        .filter((id) => countId(html, id) !== 1)
}

describe('v2 post body: every TOC link resolves to exactly one heading', () => {
    for (const fixture of POST_HEADING_FIXTURES) {
        it(fixture.slug, async () => {
            const body = toPostBody(fixture.headings)
            const { beforeCTA, afterCTA } = findCTAInsertionPoint(body)
            const html = await renderPost(
                composePostSource(beforeCTA, afterCTA)
            )

            expect(unresolvedTocIds(body, html)).toEqual([])
            expect(html).toContain(SLOT_MARKUP)
        })
    }

    it('reproduces the bug under the old two-document render', async () => {
        for (const slug of SPLIT_DUPLICATE_SLUGS) {
            const fixture = POST_HEADING_FIXTURES.find((f) => f.slug === slug)
            const body = toPostBody(fixture?.headings ?? [])
            const { beforeCTA, afterCTA } = findCTAInsertionPoint(body)
            const html =
                (await renderPost(beforeCTA, false)) +
                (await renderPost(afterCTA, false))

            expect(unresolvedTocIds(body, html), slug).not.toEqual([])
        }
    })
})

describe('getTocSections', () => {
    it("lists a post's h2 sections, not its sub-headings", () => {
        const fixture = POST_HEADING_FIXTURES[0]
        const sections = getTocSections(
            extractTableOfContents(toPostBody(fixture.headings))
        )

        expect(sections).toHaveLength(11)
        expect(sections.every((heading) => heading.level === 2)).toBe(true)
    })

    it('falls back to every heading when a post has no h2', () => {
        const headings = extractTableOfContents('### One\n\n### Two')
        expect(getTocSections(headings)).toEqual(headings)
    })
})

describe('composePostSource', () => {
    it('puts the slot between the halves', () => {
        expect(composePostSource('Intro.', '## Next\n\nMore.')).toBe(
            'Intro.\n\n<PostSplitSlot />\n\n## Next\n\nMore.'
        )
    })

    it('puts the slot after the body when there is no second half', () => {
        expect(composePostSource('Only text.', null)).toBe(
            'Only text.\n\n<PostSplitSlot />'
        )
        expect(composePostSource('Only text.', '')).toBe(
            'Only text.\n\n<PostSplitSlot />'
        )
    })
})

describe('rehypeFaqSections', () => {
    it('groups each question under an FAQ h2 with its answer', async () => {
        const html = await renderPost(
            [
                '## How long is recovery?',
                '### A heading that is not a question',
                'Body.',
                '## Frequently asked questions',
                'An intro line.',
                '### Does it hurt?',
                'Less than you think.',
                '### When can I fly?',
                'After your surgeon clears you.',
                '## Planning your surgery?',
                '### Next steps',
                'Book a consultation.',
            ].join('\n\n')
        )

        expect(html).toContain(
            '<h2 id="frequently-asked-questions">Frequently asked questions</h2>\n<p>An intro line.</p>\n<div class="bp-faq"><div class="bp-faq__item"><h3 id="does-it-hurt">Does it hurt?</h3>'
        )
        expect(html.match(/class="bp-faq__item"/g)).toHaveLength(2)
        expect(html.match(/class="bp-faq"/g)).toHaveLength(1)
        // Headings before and after the FAQ section stay as they were
        expect(html).toContain(
            '<h3 id="a-heading-that-is-not-a-question">A heading that is not a question</h3>\n<p>Body.</p>'
        )
        expect(html).toMatch(/<\/div><\/div>\s*<h2 id="planning-your-surgery"/)
    })

    it('recognises every FAQ heading the published posts use', async () => {
        for (const title of [
            'FAQ about tummy tuck drains',
            'Common questions',
            'Quick FAQ: Breast augmentation healing concerns',
            'Understanding blepharoplasty: common questions answered',
        ]) {
            const html = await renderPost(
                `## ${title}\n\n### Question?\n\nAnswer.`
            )
            expect(html, title).toContain('class="bp-faq__item"')
        }
    })

    it('does not treat a heading that merely contains "faq" as the section', async () => {
        const html = await renderPost(
            '## How we wrote these faqsheets\n\n### Step one\n\nText.'
        )
        expect(html).not.toContain('bp-faq')
    })

    it('ends the section at a rule, so a closing note stays out of the last card', async () => {
        const html = await renderPost(
            [
                '## Frequently asked questions',
                '### Does it hurt?',
                'Less than you think.',
                '---',
                'This article is for informational purposes only.',
            ].join('\n\n')
        )

        expect(html).toMatch(
            /<\/p>\s*<\/div><\/div>\s*<hr\/>\s*<p>This article is for informational/
        )
    })

    it('keeps grouping questions on both sides of the split slot', async () => {
        const html = await renderPost(
            composePostSource(
                '## Frequently asked questions\n\n### One?\n\nYes.',
                '### Two?\n\nNo.'
            )
        )

        expect(html.match(/class="bp-faq__item"/g)).toHaveLength(2)
        expect(html).toMatch(
            /<\/div><\/div>\s*<div data-post-split-slot=""><\/div>\s*<div class="bp-faq">/
        )
    })

    it('leaves posts without an FAQ section unchanged', async () => {
        const source = '## Recovery\n\n### Week one\n\nRest.'
        expect(await renderPost(source)).toBe(await renderPost(source, false))
    })
})
