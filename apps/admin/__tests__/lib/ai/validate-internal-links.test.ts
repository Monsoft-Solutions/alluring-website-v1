/**
 * Tests for the internal link guard.
 *
 * Written against a real failure: as of August 2026 four of the eighteen
 * blog-to-blog links in the published corpus pointed at slugs that had never
 * existed — `/blog/facelift-cost-miami`, `/blog/prepare-mommy-makeover-miami`
 * and two more — because the writer was never told which posts exist and
 * invented plausible URLs when it wanted one.
 */
import { describe, expect, it } from 'vitest'

import { validateInternalLinks } from '@workspace/ai/functions/validate-internal-links.function'

const KNOWN = [
    '/procedures/bbl-miami',
    '/plastic-surgery-financing-miami',
    '/blog/bbl-recovery-time-miami',
    '/how-long-to-recover-from-bbl',
]

describe('validateInternalLinks', () => {
    describe('links that resolve', () => {
        it('leaves a known root-relative link alone', () => {
            const content = 'See our [BBL page](/procedures/bbl-miami).'

            const result = validateInternalLinks(content, KNOWN)

            expect(result.content).toBe(content)
            expect(result.removed).toEqual([])
        })

        it('matches a known page carrying a fragment or query', () => {
            const content =
                '[costs](/procedures/bbl-miami#pricing) and [more](/procedures/bbl-miami?utm=x)'

            const result = validateInternalLinks(content, KNOWN)

            expect(result.removed).toEqual([])
            expect(result.content).toBe(content)
        })

        it('respects the pre-2026 URL split', () => {
            // Legacy posts live at /{slug}, later ones at /blog/{slug}.
            const content =
                '[old](/how-long-to-recover-from-bbl) and [new](/blog/bbl-recovery-time-miami)'

            expect(validateInternalLinks(content, KNOWN).removed).toEqual([])
        })

        it('never touches external links', () => {
            const content =
                'Per the [ASPS](https://plasticsurgery.org/statistics).'

            expect(validateInternalLinks(content, KNOWN).content).toBe(content)
        })
    })

    describe('links to a real page through a redirect', () => {
        // Measured September 2026 (#241): 62 link targets in 106 published
        // posts landed on their page only after a 308, and 601 links spelled
        // out our own domain, which the renderer opens in a new tab.
        it('writes an absolute URL to our own domain as a root-relative path', () => {
            const content =
                'See [financing](https://www.alluringplasticsurgery.com/plastic-surgery-financing-miami).'

            const result = validateInternalLinks(content, KNOWN)

            expect(result.content).toBe(
                'See [financing](/plastic-surgery-financing-miami).'
            )
            expect(result.removed).toEqual([])
            expect(result.rewritten).toEqual([
                {
                    from: 'https://www.alluringplasticsurgery.com/plastic-surgery-financing-miami',
                    to: '/plastic-surgery-financing-miami',
                },
            ])
        })

        it('drops a trailing slash', () => {
            const content = 'See our [BBL page](/procedures/bbl-miami/).'

            expect(validateInternalLinks(content, KNOWN).content).toBe(
                'See our [BBL page](/procedures/bbl-miami).'
            )
        })

        it('points the root form of a 2026 post at its /blog/ URL', () => {
            // app/[slug]/page.tsx 308s /bbl-recovery-time-miami to /blog/…,
            // and 404s it once the post is unpublished.
            const content = '[recovery time](/bbl-recovery-time-miami)'

            const result = validateInternalLinks(content, KNOWN)

            expect(result.content).toBe(
                '[recovery time](/blog/bbl-recovery-time-miami)'
            )
            expect(result.removed).toEqual([])
        })

        it('keeps the fragment and query of a rewritten link', () => {
            const content =
                '[pricing](https://www.alluringplasticsurgery.com/procedures/bbl-miami/#pricing) [more](/procedures/bbl-miami/?utm=x)'

            expect(validateInternalLinks(content, KNOWN).content).toBe(
                '[pricing](/procedures/bbl-miami#pricing) [more](/procedures/bbl-miami?utm=x)'
            )
        })

        it('reports nothing for a link that is already canonical', () => {
            const content =
                '[old](/how-long-to-recover-from-bbl) [new](/blog/bbl-recovery-time-miami)'

            expect(validateInternalLinks(content, KNOWN).rewritten).toEqual([])
        })

        it('never moves a link on another host onto the main site', () => {
            // The booking landing page lives on book.alluringplasticsurgery.com;
            // stripping its host would send the reader somewhere else.
            const content =
                '[book](https://book.alluringplasticsurgery.com/procedures/bbl-miami) [map](https://maps.google.com/?q=alluringplasticsurgery.com/procedures/bbl-miami)'

            const result = validateInternalLinks(content, KNOWN)

            expect(result.content).toBe(content)
            expect(result.rewritten).toEqual([])
        })

        it('does not invent a /blog/ URL for an unknown root path', () => {
            const content = '[made up](/not-a-post)'

            const result = validateInternalLinks(content, KNOWN)

            expect(result.content).toBe('made up')
            expect(result.rewritten).toEqual([])
        })
    })

    describe('links that do not resolve', () => {
        it('flattens an invented blog URL to its anchor text', () => {
            const content =
                'Read our [facelift cost guide](/blog/facelift-cost-miami) for detail.'

            const result = validateInternalLinks(content, KNOWN)

            expect(result.content).toBe(
                'Read our facelift cost guide for detail.'
            )
            expect(result.removed).toEqual([
                {
                    url: '/blog/facelift-cost-miami',
                    anchorText: 'facelift cost guide',
                },
            ])
        })

        it('catches an invented URL written against our own domain', () => {
            const content =
                '[guide](https://alluringplasticsurgery.com/blog/made-up-post)'

            const result = validateInternalLinks(content, KNOWN)

            expect(result.content).toBe('guide')
            expect(result.removed).toHaveLength(1)
        })

        it('handles several broken links in one post', () => {
            const content =
                '[a](/blog/nope-one) then [b](/procedures/bbl-miami) then [c](/blog/nope-two)'

            const result = validateInternalLinks(content, KNOWN)

            expect(result.removed.map((link) => link.url)).toEqual([
                '/blog/nope-one',
                '/blog/nope-two',
            ])
            expect(result.content).toContain('[b](/procedures/bbl-miami)')
        })
    })

    describe('safety', () => {
        it('changes nothing when there is no known set to check against', () => {
            // Rewriting on an empty set would strip every internal link.
            const content = '[anything](/procedures/bbl-miami) [x](/blog/y)'

            const result = validateInternalLinks(content, [])

            expect(result.content).toBe(content)
            expect(result.removed).toEqual([])
        })

        it('is idempotent', () => {
            const content =
                'Read [the guide](/blog/facelift-cost-miami), [BBL](/procedures/bbl-miami/) and [time](/bbl-recovery-time-miami).'

            const once = validateInternalLinks(content, KNOWN)
            const twice = validateInternalLinks(once.content, KNOWN)

            expect(twice.content).toBe(once.content)
            expect(twice.removed).toEqual([])
            expect(twice.rewritten).toEqual([])
        })

        it('leaves image syntax alone', () => {
            // ![alt](src) is an image, not a link — stripping it would break
            // the body rather than fix it.
            const content = '![a chart](/images/chart.webp)'

            expect(validateInternalLinks(content, KNOWN).content).toContain(
                '![a chart]'
            )
        })
    })
})
