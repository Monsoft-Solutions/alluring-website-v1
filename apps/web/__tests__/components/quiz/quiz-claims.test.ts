import { findClaimHits } from '@workspace/shared/claims/patterns'
import { describe, expect, it } from 'vitest'

import {
    BUDGET_RANGE_OPTIONS,
    QUIZ_QUESTIONS,
    SOCIAL_PROOF_MESSAGES,
} from '@/components/quiz/lib/quiz-questions.data'
import { PROCEDURE_PRICING } from '@/components/quiz/lib/quiz-pricing.data'
import { LEAD_POPUP_COPY } from '@/components/lead-popups/lead-popup-copy'
import { blepharoplastyMiami } from '@/lib/data/procedures/blepharoplasty-miami.data'
import { brazilianButtLiftBblMiami } from '@/lib/data/procedures/brazilian-butt-lift-bbl-miami.data'
import { breastAugmentationMiami } from '@/lib/data/procedures/breast-augmentation-miami.data'
import { breastLiftMiami } from '@/lib/data/procedures/breast-lift-miami.data'
import { breastReductionMiami } from '@/lib/data/procedures/breast-reduction-miami.data'
import { faceliftMiami } from '@/lib/data/procedures/facelift-miami.data'
import { liposuctionMiami } from '@/lib/data/procedures/liposuction-miami.data'
import { mommyMakeoverMiami } from '@/lib/data/procedures/mommy-makeover-miami.data'
import { tummyTuckMiami } from '@/lib/data/procedures/tummy-tuck-miami.data'

/** Every string in a value, depth first. */
function strings(value: unknown): string[] {
    if (typeof value === 'string') return [value]
    if (typeof value === 'function') return []
    if (Array.isArray(value)) return value.flatMap(strings)
    if (value && typeof value === 'object')
        return Object.values(value).flatMap(strings)
    return []
}

/**
 * The quiz and the lead popup are client islands that cannot read the
 * pricing resolver, so they carry no price, payment figure or other claim
 * the canon removed (#354). "Free consultation" stays where it stood (D7),
 * so SU11 is not checked here.
 */
const FAIL_RULES = [
    'CR1',
    'CR2',
    'CR4',
    'CR6',
    'CR10',
    'FA1',
    'FA2',
    'FA6',
    'EX1',
    'EX2',
    'EX3',
    'PR9',
    'PR10',
    'PR11',
    'PR12',
    'PR17',
    'SU2',
    'SU4',
    'SU5',
    'SU6',
    'SU7',
    'SU9',
    'CO7',
]

describe('quiz and lead popup copy follow the claims canon', () => {
    const copy = [
        ...strings(QUIZ_QUESTIONS),
        ...strings(BUDGET_RANGE_OPTIONS),
        ...strings(SOCIAL_PROOF_MESSAGES),
        ...strings(PROCEDURE_PRICING),
        ...strings(LEAD_POPUP_COPY),
    ]

    it.each(copy)('%s', (text) => {
        const hits = findClaimHits(text, { ids: FAIL_RULES })
        expect(hits.map((hit) => `${hit.id}: ${hit.match}`)).toEqual([])
    })
})

describe('quiz recovery labels', () => {
    const pages = {
        'breast-augmentation': breastAugmentationMiami,
        'breast-lift': breastLiftMiami,
        'breast-reduction': breastReductionMiami,
        liposuction: liposuctionMiami,
        bbl: brazilianButtLiftBblMiami,
        'tummy-tuck': tummyTuckMiami,
        'mommy-makeover': mommyMakeoverMiami,
        facelift: faceliftMiami,
        blepharoplasty: blepharoplastyMiami,
    } as const

    it.each(Object.entries(pages))(
        '%s repeats the page quickStats recovery',
        (id, page) => {
            const quiz = PROCEDURE_PRICING[id as keyof typeof pages]
            expect(quiz.slug).toBe(page.slug)
            expect(quiz.recoveryLabel).toBe(page.quickStats?.recovery)
        }
    )
})
