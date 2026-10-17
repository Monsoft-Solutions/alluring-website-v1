/**
 * MCP post guards (issue #343): which posts may be written, which slugs a
 * new post may take, and the FAQ parse that mirrors blog/tools.
 */
import { describe, expect, it } from 'vitest'

import {
    estimateReadingTime,
    fieldValuesEqual,
    getSlugProblem,
    getWriteBlocker,
    parseFaqSection,
} from '@/lib/mcp/post-guards.util'

describe('getWriteBlocker', () => {
    const idle = {
        refreshOfPostId: null,
        pipelineProcessingStatus: 'idle' as const,
    }

    it('allows an idle post, with or without a waiting refresh candidate', () => {
        expect(getWriteBlocker(idle, null)).toBeNull()
        expect(getWriteBlocker(idle, 'pending')).toBeNull()
        expect(getWriteBlocker(idle, 'ready_for_review')).toBeNull()
    })

    it('refuses refresh working copies', () => {
        expect(
            getWriteBlocker({ ...idle, refreshOfPostId: 'original-id' }, null)
        ).toMatch(/working copy/)
    })

    it('refuses a post the pipeline is processing', () => {
        expect(
            getWriteBlocker(
                { ...idle, pipelineProcessingStatus: 'processing' },
                null
            )
        ).toMatch(/pipeline/)
    })

    it('refuses a post a refresh run is rewriting', () => {
        expect(getWriteBlocker(idle, 'in_progress')).toMatch(/refresh/)
    })
})

describe('getSlugProblem', () => {
    it('accepts a fresh, well-formed slug', () => {
        expect(
            getSlugProblem('how-to-sleep-after-a-tummy-tuck-zzz-test')
        ).toBeNull()
    })

    it.each([
        'Has-Caps',
        'double--hyphen',
        '-leading',
        'trailing-',
        'under_score',
        'space here',
    ])('rejects the malformed slug %s', (slug) => {
        expect(getSlugProblem(slug)).toMatch(/lowercase/)
    })

    it('rejects /blog subroutes', () => {
        expect(getSlugProblem('categories')).toMatch(/subroute/)
    })

    it('rejects a slug the keyword registry already holds', () => {
        expect(getSlugProblem('how-long-to-recover-tummy-tuck')).toMatch(
            /registry/
        )
    })

    it('rejects a top-level marketing page path', () => {
        expect(getSlugProblem('tummy-tuck-cost-miami')).toMatch(
            /marketing page/
        )
    })
})

describe('parseFaqSection', () => {
    const content = [
        '## Intro',
        '',
        'Body.',
        '',
        '## Frequently asked questions',
        '',
        '### Can I sleep on my side?',
        '',
        'Not for the first',
        'two weeks.',
        '',
        '### When can I shower?',
        '',
        'After 48 hours.',
        '',
        '## Sources',
        '',
        '- [ASPS: Recovery](https://example.com)',
    ].join('\n')

    it('reads each question and its paragraph, whitespace collapsed, stopping at the next H2', () => {
        expect(parseFaqSection(content)).toEqual([
            {
                question: 'Can I sleep on my side?',
                answer: 'Not for the first two weeks.',
            },
            { question: 'When can I shower?', answer: 'After 48 hours.' },
        ])
    })

    it('reads a FAQ section that ends the post', () => {
        expect(
            parseFaqSection('## Frequently asked questions\n\n### Q?\n\nA.')
        ).toEqual([{ question: 'Q?', answer: 'A.' }])
    })

    it('is empty without a FAQ section', () => {
        expect(parseFaqSection('## Intro\n\nBody.')).toEqual([])
    })
})

describe('estimateReadingTime', () => {
    it('rounds up at 200 words a minute, minimum 1', () => {
        expect(estimateReadingTime('')).toBe(1)
        expect(estimateReadingTime(Array(201).fill('word').join(' '))).toBe(2)
    })
})

describe('fieldValuesEqual', () => {
    it('ignores jsonb key order in FAQs', () => {
        expect(
            fieldValuesEqual(
                'faqs',
                [{ question: 'Q?', answer: 'A.' }],
                [{ answer: 'A.', question: 'Q?' }]
            )
        ).toBe(true)
        expect(
            fieldValuesEqual(
                'faqs',
                [{ question: 'Q?', answer: 'B.' }],
                [{ answer: 'A.', question: 'Q?' }]
            )
        ).toBe(false)
        expect(fieldValuesEqual('faqs', null, [])).toBe(false)
    })

    it('compares other fields by value, treating a missing value as null', () => {
        expect(fieldValuesEqual('title', 'A', 'A')).toBe(true)
        expect(fieldValuesEqual('metaTitle', null, undefined)).toBe(true)
        expect(fieldValuesEqual('secondaryKeywords', ['a'], ['a', 'b'])).toBe(
            false
        )
    })
})
