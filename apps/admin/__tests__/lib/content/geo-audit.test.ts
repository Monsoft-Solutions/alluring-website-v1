/**
 * Tests for the answer-first structure analysis.
 *
 * These counts feed two things: the geo-retrievability reviewer's prompt, where
 * a wrong count produces a confidently wrong finding, and the audit gate, which
 * is what turns the epic's acceptance criterion into a command. Both need the
 * table detection in particular to be exact — a line containing pipes is not a
 * table, and treating one as such would let a post pass on a formatting
 * coincidence.
 */
import { describe, expect, it } from 'vitest'

import { analyzeGeoStructure, runGeoAuditGate } from '@workspace/shared/content'

const TABLE = `| Option | Cost | Recovery |
| --- | --- | --- |
| Mini | $6,500 | 2 weeks |
| Full | $9,500 | 6 weeks |`

describe('analyzeGeoStructure', () => {
    describe('headings', () => {
        it('separates question headings from statements', () => {
            const analysis = analyzeGeoStructure(
                '## How long is recovery?\n\ntext\n\n## Week by Week\n\ntext'
            )

            expect(analysis.headings).toEqual([
                { level: 2, text: 'How long is recovery?' },
                { level: 2, text: 'Week by Week' },
            ])
            expect(analysis.questionHeadings).toEqual([
                { level: 2, text: 'How long is recovery?' },
            ])
            expect(analysis.questionHeadingRatio).toBe(0.5)
        })

        it('counts H3s, which is where an FAQ post puts its questions', () => {
            // Regression: counting only H2s failed a real generated FAQ post
            // whose 12 questions all sat at H3 under 4 topical H2s, while the
            // reviewer agent — which sees the whole document — scored it 94/100.
            const analysis = analyzeGeoStructure(
                '## Causes and Candidacy\n\n### Is it gynecomastia or chest fat?\n\n### Can exercise fix it?\n\n## Recovery\n\n### Does it hurt?'
            )

            expect(analysis.headings).toHaveLength(5)
            expect(analysis.questionHeadings).toHaveLength(3)
            expect(analysis.questionHeadingRatio).toBeCloseTo(0.6)
        })

        it('records the level of each heading', () => {
            const analysis = analyzeGeoStructure('## Top?\n\n### Nested?')

            expect(analysis.headings.map((h) => h.level)).toEqual([2, 3])
        })

        it('ignores H4 and deeper', () => {
            const analysis = analyzeGeoStructure(
                '## Real heading?\n\n### Sub heading?\n\n#### Deeper?'
            )

            expect(analysis.headings).toHaveLength(2)
        })

        it('reports a zero ratio rather than dividing by zero', () => {
            expect(
                analyzeGeoStructure('Just prose.').questionHeadingRatio
            ).toBe(0)
        })
    })

    describe('tables', () => {
        it('counts a real GFM table', () => {
            expect(analyzeGeoStructure(TABLE).tableCount).toBe(1)
        })

        it('does not count a line that merely contains pipes', () => {
            const analysis = analyzeGeoStructure(
                'Recovery | timeline | notes are below.'
            )

            expect(analysis.tableCount).toBe(0)
        })

        it('does not count a bulleted list styled with dashes', () => {
            expect(
                analyzeGeoStructure('- one\n- two\n- three').tableCount
            ).toBe(0)
        })

        it('counts each table separately', () => {
            expect(
                analyzeGeoStructure(`${TABLE}\n\ntext\n\n${TABLE}`).tableCount
            ).toBe(2)
        })
    })

    describe('CTA markers', () => {
        it('extracts the id from the first marker', () => {
            const analysis = analyzeGeoStructure('a\n\n<!-- CTA:bbl -->\n\nb')

            expect(analysis.ctaMarkers).toEqual(['<!-- CTA:bbl -->'])
            expect(analysis.ctaId).toBe('bbl')
        })

        it('reports a bare marker with a null id', () => {
            const analysis = analyzeGeoStructure('a\n\n<!-- CTA -->\n\nb')

            expect(analysis.ctaMarkers).toHaveLength(1)
            expect(analysis.ctaId).toBeNull()
        })

        it('finds every marker so duplicates can be caught', () => {
            const analysis = analyzeGeoStructure(
                'a\n\n<!-- CTA:bbl -->\n\nb\n\n<!-- CTA:breast -->'
            )

            expect(analysis.ctaMarkers).toHaveLength(2)
        })
    })

    it('counts only off-site links', () => {
        const analysis = analyzeGeoStructure(
            '[asps](https://plasticsurgery.org) and [ours](/procedures/bbl-miami)'
        )

        expect(analysis.externalLinkCount).toBe(1)
    })
})

describe('runGeoAuditGate', () => {
    const goodPost = `## How much does a BBL cost in Miami?

A BBL runs $4,500 to $8,500.

${TABLE}

## Who is not a candidate?

Anyone with a BMI under 22 usually lacks donor fat.

<!-- CTA:bbl -->

## How long is recovery?

Six weeks before sitting normally.

## What are the risks?

Fat embolism is the serious one.

## Can you fly home afterward?

Most patients fly at 10 days.`

    it('passes a post that meets every gate', () => {
        const result = runGeoAuditGate(goodPost, {
            quickAnswer: 'How much?\n\nA BBL runs $4,500 to $8,500.',
        })

        expect(result.failures).toEqual([])
        expect(result.passed).toBe(true)
    })

    it('fails a post with no Quick Answer', () => {
        const result = runGeoAuditGate(goodPost, { quickAnswer: null })

        expect(result.passed).toBe(false)
        expect(result.failures).toContain('no Quick Answer')
    })

    it('treats whitespace as no Quick Answer', () => {
        expect(
            runGeoAuditGate(goodPost, { quickAnswer: '   ' }).failures
        ).toContain('no Quick Answer')
    })

    it('fails a post with no table when one is expected', () => {
        const result = runGeoAuditGate(goodPost.replace(TABLE, ''), {
            quickAnswer: 'x\n\ny',
        })

        expect(result.failures).toContain('no comparison table')
    })

    it('does not demand a table when the topic has nothing to compare', () => {
        const result = runGeoAuditGate(goodPost.replace(TABLE, ''), {
            quickAnswer: 'x\n\ny',
            expectTable: false,
        })

        expect(result.failures).not.toContain('no comparison table')
    })

    it('fails a post whose headings are mostly statements', () => {
        const statementPost = `## Recovery Timeline

text

## Cost Overview

text

<!-- CTA:bbl -->

## Risk Profile

text`

        const result = runGeoAuditGate(statementPost, {
            quickAnswer: 'x\n\ny',
            expectTable: false,
        })

        expect(
            result.failures.some((f) => f.includes('question headings'))
        ).toBe(true)
    })

    it('fails a post with no CTA marker', () => {
        const result = runGeoAuditGate(
            goodPost.replace('<!-- CTA:bbl -->', ''),
            { quickAnswer: 'x\n\ny' }
        )

        expect(result.failures).toContain('no CTA marker')
    })

    it('fails a post with two CTA markers, which would break the page', () => {
        const result = runGeoAuditGate(`${goodPost}\n\n<!-- CTA:breast -->`, {
            quickAnswer: 'x\n\ny',
        })

        expect(result.failures).toContain('2 CTA markers (must be exactly 1)')
    })

    it('fails a post that blows past the external link ceiling', () => {
        const links = Array.from(
            { length: 9 },
            (_, i) => `[source ${i}](https://example.org/${i})`
        ).join(' ')

        const result = runGeoAuditGate(`${goodPost}\n\n${links}`, {
            quickAnswer: 'x\n\ny',
        })

        expect(result.failures.some((f) => f.includes('external links'))).toBe(
            true
        )
    })
})
