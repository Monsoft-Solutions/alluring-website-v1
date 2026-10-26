// @vitest-environment node
/**
 * The forbidden-claim regex list (claims canon §11, issue #354).
 *
 * `patterns.data.json` is generated from the canon and read by both
 * TypeScript and the Python blog tools, so this checks it has not drifted
 * from docs/claims/canon.md, that every rule compiles in JavaScript, and that
 * the sweep reports what the canon says it should.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import {
    CLAIM_NEUTRALIZERS,
    CLAIM_PATTERNS,
    CLAIM_PATTERN_FLAGS,
    compileClaimPattern,
    findClaimHits,
    neutralizeClaimText,
    stripLinkTargets,
} from '@workspace/shared/claims/patterns'

const CANON = fileURLToPath(
    new URL('../../../../../docs/claims/canon.md', import.meta.url)
)

/** Section 11's code blocks, parsed the way the generator parses them. */
function readCanon(): { neutralizers: string[]; rules: [string, string][] } {
    const canon = readFileSync(CANON, 'utf8')
    const section = canon.slice(
        canon.indexOf('## 11. Forbidden-claim regex list'),
        canon.indexOf('## 12.')
    )
    const [neutral, ...blocks] = [
        ...section.matchAll(/```\n([\s\S]*?)\n```/g),
    ].map((match) => match[1]!)
    return {
        neutralizers: neutral!.split('\n').filter(Boolean),
        rules: blocks.flatMap((block) =>
            block.split('\n').map((line) => {
                const match = /^([A-Z]{2}\d+)\s+(.*)$/.exec(line)
                if (!match) throw new Error(`Unparsed rule line: ${line}`)
                return [match[1]!, match[2]!] as [string, string]
            })
        ),
    }
}

const hitIds = (text: string) => findClaimHits(text).map((hit) => hit.id)

describe('patterns.data.json against docs/claims/canon.md', () => {
    const canon = readCanon()

    it('has the canon rules, verbatim and in order', () => {
        expect(CLAIM_PATTERNS.map((rule) => [rule.id, rule.pattern])).toEqual(
            canon.rules
        )
        expect(CLAIM_PATTERNS).toHaveLength(85)
    })

    it('has the canon neutralizers, verbatim', () => {
        expect([...CLAIM_NEUTRALIZERS]).toEqual(canon.neutralizers)
    })
})

describe('CLAIM_PATTERNS', () => {
    it('compiles every rule, downgrade and neutralizer in JavaScript', () => {
        expect(CLAIM_PATTERN_FLAGS).toBe('i')
        for (const rule of CLAIM_PATTERNS) {
            expect(() => compileClaimPattern(rule), rule.id).not.toThrow()
            if (rule.downgrade) {
                expect(() => new RegExp(rule.downgrade!.pattern)).not.toThrow()
            }
        }
        for (const source of CLAIM_NEUTRALIZERS) {
            expect(() => new RegExp(source, 'i')).not.toThrow()
        }
    })

    it('reads severities from the canon labels', () => {
        const severity = (id: string) =>
            CLAIM_PATTERNS.find((rule) => rule.id === id)?.severity
        expect(severity('CR1')).toBe('fail')
        expect(severity('CR5')).toBe('paired')
        expect(severity('CR7')).toBe('review')
        expect(severity('CR8')).toBe('fail')
        expect(severity('PR17')).toBe('paired')
        expect(severity('SU11')).toBe('review')
        expect(severity('TR4')).toBe('paired')
        expect(severity('MD2')).toBe('paired')
        for (const rule of CLAIM_PATTERNS) {
            expect(['fail', 'paired', 'review']).toContain(rule.severity)
        }
    })

    it('runs CR13 on titles and EX5 on source strings only', () => {
        const scopes = Object.fromEntries(
            CLAIM_PATTERNS.filter((rule) => rule.scope !== 'text').map(
                (rule) => [rule.id, rule.scope]
            )
        )
        expect(scopes).toEqual({ CR13: 'title', EX5: 'source' })
    })
})

describe('findClaimHits', () => {
    it('catches retired credential claims', () => {
        expect(hitIds('Our double board-certified plastic surgeon')).toEqual(
            expect.arrayContaining(['CR1', 'CR2', 'CR7'])
        )
        expect(hitIds('She is board certified.')).toContain('CR4')
        expect(
            hitIds(
                'She is board certified in general surgery by the American Board of Surgery.'
            )
        ).not.toContain('CR4')
    })

    it('fails Dr. Lofman and only flags Dr. Shats (D1)', () => {
        const hits = findClaimHits('Dr. Lofman and Dr. Shats', {
            ids: ['CR9'],
        })
        expect(hits.map((hit) => [hit.match, hit.severity])).toEqual([
            ['Lofman', 'fail'],
            ['Shats', 'review'],
        ])
    })

    it('neutralizes source names before the sweep', () => {
        expect(
            neutralizeClaimText(
                'The American Society of Plastic Surgeons says so.'
            )
        ).not.toMatch(/plastic surgeons/i)
        expect(
            hitIds('Per the American Society of Plastic Surgeons, …')
        ).not.toContain('CR7')
    })

    it('ignores link targets but keeps labels', () => {
        expect(stripLinkTargets('[the guide](https://aaaasf.org/x)')).toBe(
            'the guide'
        )
        expect(hitIds('Read [the guide](https://aaaasf.org/x).')).not.toContain(
            'FA1'
        )
        expect(hitIds('Read [our AAAASF page](/x).')).toContain('FA1')
    })

    it('catches financing figures, typed prices and travel claims', () => {
        expect(hitIds('Only $34/week with 0% APR')).toEqual(
            expect.arrayContaining(['PR9', 'PR10', 'PR17'])
        )
        expect(hitIds('Save 20% off your BBL')).toContain('PR14')
        expect(hitIds('We arrange your hotel and airport pickup.')).toEqual(
            expect.arrayContaining(['TR2', 'TR3', 'TR5'])
        )
    })

    it('leaves claim tokens alone', () => {
        const ids = hitIds(
            'A BBL at Alluring starts at [[price:bbl]], and [[price-range:bbl]]. [[surgeon:credentials]]'
        )
        expect(ids.filter((id) => id.startsWith('PR'))).toEqual([])
    })

    it('runs title rules only when asked', () => {
        const title = '<title>Board-certified Dr. Karlinsky</title>'
        expect(hitIds(title)).not.toContain('CR13')
        expect(
            findClaimHits(title, { scope: 'title' }).map((hit) => hit.id)
        ).toEqual(['CR13'])
    })
})
