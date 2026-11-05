import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { procedures } from '@/lib/data/procedures.data'

/**
 * `llms-full.txt` prints these fields of every procedure, and AI engines repeat
 * them as fact (#357). The credentials constant's own sentence is the one
 * allowed use of "board certified".
 */
const UNSUPPORTED =
    /board[\s-]certified(?! in general surgery by the American Board of Surgery)|affordab|luxur|0% ?apr|instant approval|patient stor|\d% off|all[\s-]inclusive|international|concierge|aaaasf|\/\s?week|per week|weekly/i

describe('what the llms routes publish', () => {
    it.each(procedures.map((p) => [p.slug, p] as const))(
        'states nothing unsupported for %s',
        (_slug, p) => {
            const printed = [
                p.description,
                p.shortDescription,
                ...(Object.values(p.quickStats ?? {}) as string[]),
                ...(p.benefits ?? []).flatMap((b) => [b.title, b.description]),
                ...(p.faqs ?? []).flatMap((f) => [f.question, f.answer]),
            ]
            for (const text of printed) {
                expect(String(text)).not.toMatch(UNSUPPORTED)
            }
        }
    )

    it.each(['llms.txt', 'llms-full.txt'])(
        'has no unsupported claim in the %s template',
        (route) => {
            const source = readFileSync(
                fileURLToPath(
                    new URL(`../../../app/${route}/route.ts`, import.meta.url)
                ),
                'utf8'
            )
            expect(source).not.toMatch(UNSUPPORTED)
        }
    )
})
