/**
 * Quiz Pricing Data
 *
 * Procedure pricing information for the quiz calculator.
 * Note: These are estimated ranges for display purposes.
 * Actual pricing determined during consultation.
 *
 * @module components/quiz/lib/quiz-pricing.data
 */

import type { ProcedureDetails, ProcedureId } from './quiz-types'

/**
 * Complete procedure details with pricing
 */
export const PROCEDURE_PRICING: Record<ProcedureId, ProcedureDetails> = {
    'breast-augmentation': {
        id: 'breast-augmentation',
        title: 'Breast Augmentation',
        shortDescription:
            'Enhance your curves with natural-looking breast implants',
        slug: 'breast-augmentation-miami',
        category: 'breast',
        priceRange: {
            min: 4500,
            max: 7500,
        },
        monthlyPayment: {
            min: 125,
            max: 208,
        },
        recoveryWeeks: 1,
        benefits: [
            'Enhanced breast size and shape',
            'Improved body proportions',
            'Increased confidence',
            'Long-lasting results',
        ],
        image: '/images/procedures/breast-augmentation.jpg',
    },

    'breast-lift': {
        id: 'breast-lift',
        title: 'Breast Lift',
        shortDescription: 'Restore youthful breast position and firmness',
        slug: 'breast-lift-miami',
        category: 'breast',
        priceRange: {
            min: 5000,
            max: 8000,
        },
        monthlyPayment: {
            min: 139,
            max: 222,
        },
        recoveryWeeks: 2,
        benefits: [
            'Lifted, youthful breast position',
            'Improved breast shape',
            'Reduced sagging',
            'Natural-looking results',
        ],
        image: '/images/procedures/breast-lift.jpg',
    },

    'breast-reduction': {
        id: 'breast-reduction',
        title: 'Breast Reduction',
        shortDescription:
            'Relieve discomfort and achieve proportionate breasts',
        slug: 'breast-reduction-miami',
        category: 'breast',
        priceRange: {
            min: 5500,
            max: 9000,
        },
        monthlyPayment: {
            min: 153,
            max: 250,
        },
        recoveryWeeks: 2,
        benefits: [
            'Relief from back and neck pain',
            'Improved posture',
            'More clothing options',
            'Enhanced physical activity',
        ],
        image: '/images/procedures/breast-reduction.jpg',
    },

    liposuction: {
        id: 'liposuction',
        title: 'Liposuction',
        shortDescription:
            'Remove stubborn fat and sculpt your ideal silhouette',
        slug: 'liposuction-miami',
        category: 'body',
        priceRange: {
            min: 3000,
            max: 7000,
        },
        monthlyPayment: {
            min: 83,
            max: 194,
        },
        recoveryWeeks: 1,
        benefits: [
            'Targeted fat removal',
            'Sculpted body contours',
            'Permanent fat cell removal',
            'Minimal scarring',
        ],
        image: '/images/procedures/liposuction.jpg',
    },

    bbl: {
        id: 'bbl',
        title: 'Brazilian Butt Lift',
        shortDescription:
            'Enhance your curves with natural fat transfer to the buttocks',
        slug: 'brazilian-butt-lift-bbl-miami',
        category: 'body',
        priceRange: {
            min: 6000,
            max: 10000,
        },
        monthlyPayment: {
            min: 167,
            max: 278,
        },
        recoveryWeeks: 3,
        benefits: [
            'Natural enhancement using your own fat',
            'Improved body proportions',
            'Two-in-one procedure (liposuction + enhancement)',
            'Long-lasting results',
        ],
        image: '/images/procedures/bbl.jpg',
    },

    'tummy-tuck': {
        id: 'tummy-tuck',
        title: 'Tummy Tuck',
        shortDescription:
            'Flatten your abdomen and tighten loose skin and muscles',
        slug: 'tummy-tuck-miami',
        category: 'body',
        priceRange: {
            min: 5500,
            max: 9500,
        },
        monthlyPayment: {
            min: 153,
            max: 264,
        },
        recoveryWeeks: 3,
        benefits: [
            'Flat, toned abdomen',
            'Tightened abdominal muscles',
            'Removed excess skin',
            'Improved waistline',
        ],
        image: '/images/procedures/tummy-tuck.jpg',
    },

    'mommy-makeover': {
        id: 'mommy-makeover',
        title: 'Mommy Makeover',
        shortDescription: 'Comprehensive post-pregnancy body restoration',
        slug: 'mommy-makeover-miami',
        category: 'combined',
        priceRange: {
            min: 9000,
            max: 16000,
        },
        monthlyPayment: {
            min: 250,
            max: 444,
        },
        recoveryWeeks: 4,
        benefits: [
            'Complete body transformation',
            'Address multiple areas in one surgery',
            'Cost savings vs. separate procedures',
            'Single recovery period',
        ],
        image: '/images/procedures/mommy-makeover.jpg',
    },

    facelift: {
        id: 'facelift',
        title: 'Facelift',
        shortDescription:
            'Turn back the clock with comprehensive facial rejuvenation',
        slug: 'facelift-miami',
        category: 'face',
        priceRange: {
            min: 7000,
            max: 12000,
        },
        monthlyPayment: {
            min: 194,
            max: 333,
        },
        recoveryWeeks: 2,
        benefits: [
            'Tightened facial skin',
            'Reduced jowls and sagging',
            'Defined jawline',
            'Natural-looking rejuvenation',
        ],
        image: '/images/procedures/facelift.jpg',
    },

    blepharoplasty: {
        id: 'blepharoplasty',
        title: 'Eyelid Surgery',
        shortDescription: 'Refresh your eyes by removing excess eyelid skin',
        slug: 'blepharoplasty-miami',
        category: 'face',
        priceRange: {
            min: 2500,
            max: 5000,
        },
        monthlyPayment: {
            min: 69,
            max: 139,
        },
        recoveryWeeks: 1,
        benefits: [
            'More youthful, alert appearance',
            'Removed under-eye bags',
            'Improved vision (if impaired by drooping)',
            'Quick recovery',
        ],
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

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price)
}

/**
 * Format price range for display
 */
export function formatPriceRange(min: number, max: number): string {
    return `${formatPrice(min)} - ${formatPrice(max)}`
}

/**
 * Format monthly payment for display
 */
export function formatMonthlyPayment(amount: number): string {
    return `$${Math.round(amount)}/mo`
}

/**
 * Calculate savings message for combinations
 */
export function getSavingsMessage(savings: number): string {
    if (savings <= 0) return ''
    return `Save ${formatPrice(savings)} with this combination`
}
