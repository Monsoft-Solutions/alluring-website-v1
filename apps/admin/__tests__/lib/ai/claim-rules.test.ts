/**
 * The claims rules reach every prompt that writes public copy, and the prompts
 * themselves no longer ask for retired claims.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
    IMAGE_PROMPT_SYSTEM_PROMPT,
    INLINE_IMAGE_PROMPT_SYSTEM,
    SEO_CONTENT_SYSTEM_PROMPT,
    TEXT_IMPROVEMENT_SYSTEM_PROMPT,
    VISITOR_CONTENT_SYSTEM_PROMPT,
} from '@workspace/ai/prompts'
import {
    CHAT_CLAIM_RULES_PROMPT,
    CLAIM_RULES_PROMPT,
    IMAGE_CLAIM_RULES_PROMPT,
    KARLINSKY_CREDENTIALS,
    PRICE_RULES_PROMPT,
    findClaimHits,
} from '@workspace/shared/claims'

const ROOT = resolve(__dirname, '../../../../..')

function sourceFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
        const path = join(dir, name)
        if (statSync(path).isDirectory()) return sourceFiles(path)
        return /\.ts$/.test(name) && !/\.test\.ts$/.test(name) ? [path] : []
    })
}

describe('findClaimHits', () => {
    it.each([
        ['Our double board-certified surgeon', 'credential'],
        ['Dr. Karlinsky is a plastic surgeon', 'credential'],
        ['Our surgeons will guide you', 'credential'],
        ['Dr. Andrew Lofman operates here', 'credential'],
        ['An AAAASF accredited facility', 'owner-claim'],
        ['With 5,000+ procedures', 'owner-claim'],
        ['Over 15+ years in Miami', 'owner-claim'],
        ['A luxury clinic', 'luxury-affordable'],
        ['The best surgeon in Miami', 'superlative'],
        ['We arrange your flights', 'travel-or-market'],
        ['Financing from $34/week', 'financing-figure'],
        ['0% APR for qualified patients', 'financing-figure'],
        ['A BBL costs $3,500', 'retired-price'],
        ['Call (786) 305-8649', 'phone'],
    ])('flags %s', (text, group) => {
        expect(findClaimHits(text).map((hit) => hit.group)).toContain(group)
    })

    it.each([
        KARLINSKY_CREDENTIALS,
        'According to the American Society of Plastic Surgeons, swelling is normal.',
        'The best time to start walking is when your surgeon says so.',
        'Plastic surgery in Miami, with one surgeon.',
        'A BBL at Alluring starts from $5,500.',
        '[Read the guide](https://example.com/best-plastic-surgeons-luxury)',
    ])('leaves alone: %s', (text) => {
        expect(findClaimHits(text)).toEqual([])
    })

    it('reports the words around a hit, so a person can judge it', () => {
        const [hit] = findClaimHits(
            'At our practice, a luxury clinic in Miami.'
        )
        expect(hit?.match).toBe('luxury')
        expect(hit?.excerpt).toContain('a luxury clinic')
    })
})

describe('the prompts', () => {
    it.each([
        ['text improvement', TEXT_IMPROVEMENT_SYSTEM_PROMPT],
        ['gallery SEO', SEO_CONTENT_SYSTEM_PROMPT],
        ['gallery visitor copy', VISITOR_CONTENT_SYSTEM_PROMPT],
    ])('the %s prompt carries the claims rules', (_name, prompt) => {
        expect(prompt).toContain(CLAIM_RULES_PROMPT)
    })

    it.each([
        'packages/ai/src/agents/fact-source-verifier.agent.ts',
        'packages/ai/src/agents/orchestrator.agent.ts',
        'packages/ai/src/agents/writing-quality-reviewer.agent.ts',
        'packages/ai/src/functions/extract-faqs.function.ts',
        'packages/ai/src/functions/extract-metadata.function.ts',
        'packages/ai/src/functions/extract-quick-answer.function.ts',
        'packages/ai/src/functions/generate-instagram-seo-title.function.ts',
        'packages/ai/src/prompts/blog/agentic-writer.prompt.ts',
        'packages/ai/src/prompts/blog/generate-outline.prompt.ts',
        'packages/ai/src/prompts/blog/generate-topics.prompt.ts',
        'packages/ai/src/prompts/seo/content-brief.prompt.ts',
    ])('%s includes the claims rules in its prompt', (file) => {
        expect(readFileSync(join(ROOT, file), 'utf8')).toContain(
            '${CLAIM_RULES_PROMPT}'
        )
    })

    it.each([
        'apps/web/app/api/chat/route.ts',
        'apps/admin/app/api/chat/route.ts',
    ])('%s adds the chat rules after the saved prompt', (file) => {
        expect(readFileSync(join(ROOT, file), 'utf8')).toContain(
            '${config.systemPrompt}\\n\\n${CHAT_CLAIM_RULES_PROMPT}'
        )
    })

    it('the inline image prompt carries the image rules', () => {
        expect(INLINE_IMAGE_PROMPT_SYSTEM).toContain(IMAGE_CLAIM_RULES_PROMPT)
        expect(INLINE_IMAGE_PROMPT_SYSTEM).toContain('(786) 305-8649')
        expect(INLINE_IMAGE_PROMPT_SYSTEM).toContain('MUST include text')
    })

    it('image prompts carry the new tagline', () => {
        expect(IMAGE_PROMPT_SYSTEM_PROMPT).toContain(
            'Personal care. Honest price.'
        )
    })

    it('the chat rules include the claims rules and name one surgeon', () => {
        expect(CHAT_CLAIM_RULES_PROMPT).toContain(CLAIM_RULES_PROMPT)
        expect(CHAT_CLAIM_RULES_PROMPT).toContain('only surgeon')
    })

    it('no prompt source asks for a retired claim', () => {
        const retired =
            /luxury surgeries|luxury made affordable|luxury (?:yet affordable )?(?:cosmetic|plastic)|board-certified (?:plastic )?surgeons|15\+ years|5,000\+|virtual assistant|premier cosmetic|Dr\. Rita Shats|top surgeon|"in our practice/i
        const offenders = ['packages/ai/src', 'packages/chat/src']
            .flatMap((dir) => sourceFiles(join(ROOT, dir)))
            .filter((file) => retired.test(readFileSync(file, 'utf8')))
            .map((file) => file.replace(`${ROOT}/`, ''))
        expect(offenders).toEqual([])
    })

    it('the default chat config has no retired claim', () => {
        const source = readFileSync(
            join(
                ROOT,
                'packages/chat/src/constants/default-config.constant.ts'
            ),
            'utf8'
        )
        expect(source).not.toMatch(
            /board-certified|virtual assistant|premier cosmetic/i
        )
    })

    it('every price in the rules is on the price sheet', () => {
        const sheet = readFileSync(
            join(ROOT, 'docs/pricing/practice-price-list.md'),
            'utf8'
        )
        const quoted = PRICE_RULES_PROMPT.match(/\$\d[\d,]*\d/g) ?? []
        expect(quoted.length).toBeGreaterThan(5)
        // $500 and $1,000 off are the combination discount, which is on the sheet too.
        for (const price of new Set(quoted)) {
            expect(sheet).toContain(price.replace('$', ''))
        }
    })
})
