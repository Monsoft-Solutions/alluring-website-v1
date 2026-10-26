/**
 * The claims canon in the AI prompts (issue #354): the chat appends it after
 * whatever prompt the database holds, the blog writer and the reviewers carry
 * it, and the hard-coded wrong claims are gone from the writer.
 */
import { describe, expect, it } from 'vitest'

import {
    buildAgenticSystemPrompt,
    buildChatSystemPrompt,
    CONTENT_BRIEF_SYSTEM_PROMPT,
    DEFAULT_CHAT_SYSTEM_PROMPT,
    GENERATE_OUTLINE_SYSTEM_PROMPT,
    GENERATE_TOPICS_SYSTEM_PROMPT,
    generateSystemPrompt,
    getTextImprovementPrompt,
    GROUP_SUGGESTION_SYSTEM_PROMPT,
    IMAGE_ANALYSIS_SYSTEM_PROMPT,
    INLINE_IMAGE_PROMPT_SYSTEM,
    QUICK_QUESTIONS_SYSTEM_PROMPT,
    SEO_CONTENT_SYSTEM_PROMPT,
    TEXT_IMPROVEMENT_SYSTEM_PROMPT,
    VISITOR_CONTENT_SYSTEM_PROMPT,
} from '@workspace/ai/prompts'
import { OPERATIONS } from '@workspace/shared/schemas/text'
import { findClaimHits } from '@workspace/shared/claims/patterns'
import {
    buildPricingSnapshot,
    DEFAULT_PROCEDURE_SETTINGS,
    FALLBACK_PRICING,
} from '@workspace/shared/claims/prices'

const STATEMENT = 'Statement text as counsel confirms it.'

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

/** A DB-held prompt that reintroduces retired claims. */
const BAD_DB_PROMPT =
    'You are a virtual assistant for a luxury clinic. Dr. Andrew Lofman is a board-certified plastic surgeon. The deposit is $250.'

describe('buildChatSystemPrompt', () => {
    it('keeps the DB prompt first and the canon last, so the canon wins', () => {
        const prompt = buildChatSystemPrompt(BAD_DB_PROMPT, FALLBACK_PRICING)
        expect(prompt.startsWith(BAD_DB_PROMPT)).toBe(true)
        expect(prompt.indexOf('## Claims canon')).toBeGreaterThan(
            BAD_DB_PROMPT.length
        )
        expect(prompt).toContain('Never "virtual assistant"')
        expect(prompt).toContain('no deposit amount')
        expect(prompt.trimEnd().endsWith('the canon is right.')).toBe(true)
    })

    it('quotes the current starting prices in plain text, with the statement', () => {
        const prompt = buildChatSystemPrompt('Be kind.', DISCOUNTED)
        expect(prompt).toContain('$4,400 (20% off $5,500)')
        expect(prompt).toContain(STATEMENT)
        expect(buildChatSystemPrompt('Be kind.')).toContain(
            'BBL: from $5,500 for Lipo 360 + BBL'
        )
    })
})

describe('the default chat prompts', () => {
    it('make no retired claim', () => {
        for (const prompt of [
            DEFAULT_CHAT_SYSTEM_PROMPT,
            generateSystemPrompt(),
        ]) {
            expect(prompt).not.toMatch(/virtual assistant|luxury|affordable/i)
            expect(prompt).toContain('our concierge')
        }
    })
})

describe('buildAgenticSystemPrompt', () => {
    const prompt = buildAgenticSystemPrompt('guide', undefined, DISCOUNTED)

    it('appends the blog-writer canon, with the live token catalog', () => {
        expect(prompt).toContain('Never type an Alluring price. Use tokens.')
        expect(prompt).toContain('[[price:tummy-tuck:mini]]')
    })

    it('drops the hard-coded wrong claims', () => {
        // The canon names the retired claims to forbid them; the writer's
        // own sections must not make them.
        const writer = prompt.split('## Claims canon')[0]!
        expect(writer).not.toContain('15+ years')
        expect(writer).not.toContain('5,000+')
        expect(writer).not.toContain('board-certified plastic surgeons')
        expect(writer).not.toMatch(/\$6,500|\$9,500/)
        expect(writer).not.toMatch(/luxury/i)
    })

    it("types no Alluring price outside the canon's ASPS averages", () => {
        const figures = (prompt.match(/\$\d{1,3}(?:,\d{3})+/g) ?? []).filter(
            (figure) => !['$7,264', '$4,711', '$8,174'].includes(figure)
        )
        expect(figures).toEqual([])
    })
})

describe('the outline and topic prompts', () => {
    it('carry the canon and no retired brand line of their own', () => {
        for (const prompt of [
            GENERATE_OUTLINE_SYSTEM_PROMPT,
            GENERATE_TOPICS_SYSTEM_PROMPT,
        ]) {
            expect(prompt).toContain('## Claims canon')
            // The canon names the retired lines to forbid them.
            const own = prompt.split('## Claims canon')[0]!
            const retired = findClaimHits(own, { ids: ['SU7', 'SU8'] })
            expect(retired.map((hit) => hit.match)).toEqual([])
        }
    })

    it('carry the planner canon, without the token catalog', () => {
        for (const prompt of [
            GENERATE_OUTLINE_SYSTEM_PROMPT,
            GENERATE_TOPICS_SYSTEM_PROMPT,
            CONTENT_BRIEF_SYSTEM_PROMPT,
        ]) {
            expect(prompt).toContain('Never type an Alluring price')
            expect(prompt).not.toContain('[[price:')
        }
    })

    it('no longer asks for "best of" topics', () => {
        expect(GENERATE_TOPICS_SYSTEM_PROMPT).not.toContain('"Best of"')
    })
})

/**
 * The prompt's own text: before the appended canon, without the lines that
 * name a word only to forbid it ('never write "luxury"').
 */
const own = (prompt: string) =>
    prompt
        .split('## Claims canon')[0]!
        .split('\n')
        .filter((line) => !/\b(?:never|no|not|don't|avoid)\b/i.test(line))
        .join('\n')

describe('the gallery, image, text and SEO prompts', () => {
    const prompts = {
        'text improvement': TEXT_IMPROVEMENT_SYSTEM_PROMPT,
        'gallery visitor content': VISITOR_CONTENT_SYSTEM_PROMPT,
        'gallery SEO content': SEO_CONTENT_SYSTEM_PROMPT,
        'gallery image analysis': IMAGE_ANALYSIS_SYSTEM_PROMPT,
        'gallery group suggestion': GROUP_SUGGESTION_SYSTEM_PROMPT,
        'inline image': INLINE_IMAGE_PROMPT_SYSTEM,
        'content brief': CONTENT_BRIEF_SYSTEM_PROMPT,
    }

    it.each(Object.entries(prompts))('%s carries the canon', (_, prompt) => {
        expect(prompt).toContain('## Claims canon')
    })

    it.each(Object.entries(prompts))(
        '%s makes no retired brand, credential or superlative claim of its own',
        (_, prompt) => {
            const hits = findClaimHits(own(prompt), {
                ids: ['SU7', 'SU8', 'CR1', 'CR6', 'CR10', 'SU5', 'TR11'],
            })
            expect(hits.map((hit) => `${hit.id} ${hit.match}`)).toEqual([])
        }
    )

    it('renames the luxury-tone text operation to brand-tone', () => {
        const ids = OPERATIONS.map((op) => op.operation as string)
        expect(ids).toContain('brand-tone')
        expect(ids).not.toContain('luxury-tone')
        const instruction = getTextImprovementPrompt('brand-tone', 'title', 'x')
        expect(instruction).toContain('Personal care. Honest price.')
        expect(instruction).not.toMatch(/luxury surgeries|make luxury/i)
    })

    it('stops suggesting "Is the consultation free?" as a chat chip', () => {
        expect(QUICK_QUESTIONS_SYSTEM_PROMPT).not.toMatch(/consultation free/i)
    })
})
