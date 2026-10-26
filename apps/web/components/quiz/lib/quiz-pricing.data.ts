/**
 * Quiz Procedure Data
 *
 * What the quiz says about each procedure it can recommend. It carries no
 * price and no payment figure: Alluring's prices come from the pricing
 * resolver and are shown on the procedure pages, and the claims canon
 * removes every weekly or monthly figure (D6, #354).
 *
 * @module components/quiz/lib/quiz-pricing.data
 */

import type { ProcedureDetails, ProcedureId } from './quiz-types'

/**
 * What the quiz shows for each procedure. `recoveryLabel` repeats the
 * procedure page's `quickStats.recovery` (apps/web/lib/data/procedures),
 * which the claims canon §7 allows as the practice's own hedged figure;
 * `recoveryWeeks` only matches the recovery answer and is never shown.
 */
export const PROCEDURE_PRICING: Record<ProcedureId, ProcedureDetails> = {
    'breast-augmentation': {
        id: 'breast-augmentation',
        title: 'Breast Augmentation',
        shortDescription:
            'Enhance your curves with natural-looking breast implants',
        slug: 'breast-augmentation-miami',
        category: 'breast',
        recoveryWeeks: 1,
        benefits: [
            'Enhanced breast size and shape',
            'Improved body proportions',
            'Increased confidence',
            'Long-lasting results',
        ],
        recoveryLabel: '1 Week to Light Activity',
        image: '/images/procedures/breast-augmentation.jpg',
    },

    'breast-lift': {
        id: 'breast-lift',
        title: 'Breast Lift',
        shortDescription: 'Restore youthful breast position and firmness',
        slug: 'breast-lift-miami',
        category: 'breast',
        recoveryWeeks: 2,
        benefits: [
            'Lifted, youthful breast position',
            'Improved breast shape',
            'Reduced sagging',
            'Natural-looking results',
        ],
        recoveryLabel: '1-2 Weeks to Work',
        image: '/images/procedures/breast-lift.jpg',
    },

    'breast-reduction': {
        id: 'breast-reduction',
        title: 'Breast Reduction',
        shortDescription:
            'Relieve discomfort and achieve proportionate breasts',
        slug: 'breast-reduction-miami',
        category: 'breast',
        recoveryWeeks: 2,
        benefits: [
            'Can ease back and neck pain from heavy breasts',
            'Improved posture',
            'More clothing options',
            'Enhanced physical activity',
        ],
        recoveryLabel: '1-2 Weeks to Work',
        image: '/images/procedures/breast-reduction.jpg',
    },

    liposuction: {
        id: 'liposuction',
        title: 'Liposuction',
        shortDescription:
            'Remove stubborn fat and sculpt your ideal silhouette',
        slug: 'liposuction-miami',
        category: 'body',
        recoveryWeeks: 2,
        benefits: [
            'Targeted fat removal',
            'Sculpted body contours',
            'Permanent fat cell removal',
            'Small incisions',
        ],
        recoveryLabel: 'A Few Days to 2–3 Weeks Off Work',
        image: '/images/procedures/liposuction.jpg',
    },

    bbl: {
        id: 'bbl',
        title: 'Brazilian Butt Lift',
        shortDescription:
            'Enhance your curves with natural fat transfer to the buttocks',
        slug: 'brazilian-butt-lift-bbl-miami',
        category: 'body',
        recoveryWeeks: 2,
        benefits: [
            'Natural enhancement using your own fat',
            'Improved body proportions',
            'Two-in-one procedure (liposuction + enhancement)',
            'Long-lasting results',
        ],
        recoveryLabel: '10-14 Days Off Work',
        image: '/images/procedures/bbl.jpg',
    },

    'tummy-tuck': {
        id: 'tummy-tuck',
        title: 'Tummy Tuck',
        shortDescription:
            'Flatten your abdomen and remove loose skin; a full tummy tuck also tightens the muscles',
        slug: 'tummy-tuck-miami',
        category: 'body',
        recoveryWeeks: 2,
        benefits: [
            'Flat, toned abdomen',
            'Repaired abdominal muscles (full tummy tuck)',
            'Removed excess skin',
            'Improved waistline',
        ],
        recoveryLabel: 'About 2 Weeks to a Desk Job',
        image: '/images/procedures/tummy-tuck.jpg',
    },

    'mommy-makeover': {
        id: 'mommy-makeover',
        title: 'Mommy Makeover',
        shortDescription: 'Comprehensive post-pregnancy body restoration',
        slug: 'mommy-makeover-miami',
        category: 'combined',
        recoveryWeeks: 3,
        benefits: [
            'Address multiple areas in one surgery',
            'Single recovery period',
        ],
        recoveryLabel: '2-3 Weeks to Light Activity',
        image: '/images/procedures/mommy-makeover.jpg',
    },

    facelift: {
        id: 'facelift',
        title: 'Facelift',
        shortDescription: 'Lift sagging skin on the face and neck',
        slug: 'facelift-miami',
        category: 'face',
        recoveryWeeks: 3,
        benefits: [
            'Tightened facial skin',
            'Reduced jowls and sagging',
            'Defined jawline',
            'Natural-looking rejuvenation',
        ],
        recoveryLabel: '2-3 Weeks',
        image: '/images/procedures/facelift.jpg',
    },

    blepharoplasty: {
        id: 'blepharoplasty',
        title: 'Eyelid Surgery',
        shortDescription: 'Refresh your eyes by removing excess eyelid skin',
        slug: 'blepharoplasty-miami',
        category: 'face',
        recoveryWeeks: 1,
        benefits: [
            'More youthful, alert appearance',
            'Removed under-eye bags',
            'Can help when drooping upper lids block vision',
            'Most people are back at work in 7 to 10 days',
        ],
        recoveryLabel: '7-10 Days to Work',
        image: '/images/procedures/blepharoplasty.jpg',
    },
}

/**
 * Get procedure details by ID
 */
export function getProcedureDetails(
    procedureId: ProcedureId
): ProcedureDetails | undefined {
    return PROCEDURE_PRICING[procedureId]
}

/**
 * Get all procedures by category
 */
export function getProceduresByCategory(
    category: 'face' | 'breast' | 'body' | 'combined'
): readonly ProcedureDetails[] {
    return Object.values(PROCEDURE_PRICING).filter(
        (p) => p.category === category
    )
}
