/**
 * Quiz Recommendation Logic
 *
 * Algorithm for recommending procedures based on quiz answers.
 * Uses weighted scoring to determine best matches.
 *
 * @module components/quiz/lib/quiz-logic
 */

import type {
    BodyConcern,
    BreastConcern,
    FaceConcern,
    ProcedureId,
    ProcedureRecommendation,
    QuizState,
} from './quiz-types'
import { PROCEDURE_PRICING } from './quiz-pricing.data'

/**
 * Confidence thresholds for recommendation scoring
 */
const HIGH_CONFIDENCE_THRESHOLD = 0.8
const MEDIUM_CONFIDENCE_THRESHOLD = 0.5

/**
 * Scoring weights for different answer types
 */
const SCORING_WEIGHTS = {
    directMatch: 100, // Direct concern-to-procedure mapping
    partialMatch: 50, // Related but not exact match
    combinationBonus: 30, // Bonus for combination procedures
    budgetFit: 20, // Bonus if procedure fits budget
    recoveryFit: 15, // Bonus if recovery time matches
} as const

/**
 * Procedure scoring accumulator
 */
type ProcedureScores = Record<ProcedureId, number>

/**
 * Concern to procedure mapping
 */
const CONCERN_TO_PROCEDURES: Record<
    FaceConcern | BreastConcern | BodyConcern,
    { primary: ProcedureId; secondary?: ProcedureId[] }
> = {
    // Face concerns
    'drooping-eyelids': {
        primary: 'blepharoplasty',
    },
    'sagging-skin': {
        primary: 'facelift',
    },
    'both-face': {
        primary: 'facelift',
        secondary: ['blepharoplasty'],
    },

    // Breast concerns
    'want-larger': {
        primary: 'breast-augmentation',
    },
    'lost-shape': {
        primary: 'breast-lift',
        secondary: ['breast-augmentation'],
    },
    'too-large': {
        primary: 'breast-reduction',
    },
    'multiple-breast': {
        primary: 'breast-lift',
        secondary: ['breast-augmentation', 'breast-reduction'],
    },

    // Body concerns
    'stubborn-fat': {
        primary: 'liposuction',
        secondary: ['bbl'],
    },
    'flat-tummy': {
        primary: 'tummy-tuck',
        secondary: ['liposuction'],
    },
    'enhance-curves': {
        primary: 'bbl',
        secondary: ['liposuction'],
    },
    'post-pregnancy': {
        primary: 'mommy-makeover',
        secondary: ['tummy-tuck', 'breast-lift'],
    },
    'multiple-body': {
        primary: 'mommy-makeover',
        secondary: ['liposuction', 'tummy-tuck', 'bbl'],
    },
}

/**
 * How big a change each procedure is, 1 (one focused change) to 4 (several
 * procedures together), for matching the budget answer. A scale, not a
 * price: the quiz carries no dollar or payment figure (claims canon D6,
 * #354), and the price comes from the procedure page and the consultation.
 */
const PROCEDURE_SCOPE_TIERS: Record<ProcedureId, { min: number; max: number }> =
    {
        'breast-augmentation': { min: 1, max: 2 },
        'breast-lift': { min: 2, max: 3 },
        'breast-reduction': { min: 2, max: 3 },
        liposuction: { min: 1, max: 2 },
        bbl: { min: 2, max: 3 },
        'tummy-tuck': { min: 1, max: 3 },
        'mommy-makeover': { min: 3, max: 4 },
        facelift: { min: 3, max: 4 },
        blepharoplasty: { min: 1, max: 1 },
    }

/**
 * Procedure recovery times in weeks, for matching the recovery answer only.
 * Read from `recoveryWeeks` in quiz-pricing.data.ts, which follows each
 * procedure page's quickStats (claims canon §7).
 */
const PROCEDURE_RECOVERY_WEEKS: Record<ProcedureId, number> =
    Object.fromEntries(
        Object.values(PROCEDURE_PRICING).map((p) => [p.id, p.recoveryWeeks])
    ) as Record<ProcedureId, number>

/** The budget answer on the same 1–4 scale. */
const BUDGET_TO_TIER: Record<string, number> = {
    low: 1,
    medium: 2,
    high: 3,
    premium: 4,
}

/**
 * Recovery time preference to weeks mapping
 */
const RECOVERY_TO_WEEKS: Record<string, number> = {
    '1-week': 1,
    '2-weeks': 2,
    '3-plus-weeks': 4,
}

/**
 * Calculate procedure recommendations based on quiz state
 */
export function calculateRecommendations(
    state: QuizState
): readonly ProcedureRecommendation[] {
    const scores: ProcedureScores = {
        'breast-augmentation': 0,
        'breast-lift': 0,
        'breast-reduction': 0,
        liposuction: 0,
        bbl: 0,
        'tummy-tuck': 0,
        'mommy-makeover': 0,
        facelift: 0,
        blepharoplasty: 0,
    }

    const matchedConcerns: Record<ProcedureId, string[]> = {
        'breast-augmentation': [],
        'breast-lift': [],
        'breast-reduction': [],
        liposuction: [],
        bbl: [],
        'tummy-tuck': [],
        'mommy-makeover': [],
        facelift: [],
        blepharoplasty: [],
    }

    // Process face concerns
    for (const concern of state.faceConcerns) {
        const mapping = CONCERN_TO_PROCEDURES[concern]
        scores[mapping.primary] += SCORING_WEIGHTS.directMatch
        matchedConcerns[mapping.primary].push(getConcernLabel(concern))

        if (mapping.secondary) {
            for (const secondary of mapping.secondary) {
                scores[secondary] += SCORING_WEIGHTS.partialMatch
                matchedConcerns[secondary].push(getConcernLabel(concern))
            }
        }
    }

    // Process breast concerns
    for (const concern of state.breastConcerns) {
        const mapping = CONCERN_TO_PROCEDURES[concern]
        scores[mapping.primary] += SCORING_WEIGHTS.directMatch
        matchedConcerns[mapping.primary].push(getConcernLabel(concern))

        if (mapping.secondary) {
            for (const secondary of mapping.secondary) {
                scores[secondary] += SCORING_WEIGHTS.partialMatch
                matchedConcerns[secondary].push(getConcernLabel(concern))
            }
        }
    }

    // Process body concerns
    for (const concern of state.bodyConcerns) {
        const mapping = CONCERN_TO_PROCEDURES[concern]
        scores[mapping.primary] += SCORING_WEIGHTS.directMatch
        matchedConcerns[mapping.primary].push(getConcernLabel(concern))

        if (mapping.secondary) {
            for (const secondary of mapping.secondary) {
                scores[secondary] += SCORING_WEIGHTS.partialMatch
                matchedConcerns[secondary].push(getConcernLabel(concern))
            }
        }
    }

    // Special case: Multiple body areas + breast = Mommy Makeover bonus
    if (
        state.selectedBodyAreas.includes('breast') &&
        state.selectedBodyAreas.includes('body') &&
        (state.bodyConcerns.includes('flat-tummy') ||
            state.bodyConcerns.includes('post-pregnancy'))
    ) {
        scores['mommy-makeover'] += SCORING_WEIGHTS.combinationBonus
        matchedConcerns['mommy-makeover'].push('Breast and body goals together')
    }

    // Budget fit scoring
    if (state.budgetRange) {
        const tier = BUDGET_TO_TIER[state.budgetRange]
        if (tier) {
            for (const [procedureId, scope] of Object.entries(
                PROCEDURE_SCOPE_TIERS
            )) {
                if (scope.min <= tier && scope.max >= tier) {
                    scores[procedureId as ProcedureId] +=
                        SCORING_WEIGHTS.budgetFit
                }
            }
        }
    }

    // Recovery time fit scoring
    if (state.recoveryTime) {
        const preferredWeeks = RECOVERY_TO_WEEKS[state.recoveryTime]
        if (preferredWeeks !== undefined) {
            for (const [procedureId, recoveryWeeks] of Object.entries(
                PROCEDURE_RECOVERY_WEEKS
            )) {
                if (recoveryWeeks <= preferredWeeks) {
                    scores[procedureId as ProcedureId] +=
                        SCORING_WEIGHTS.recoveryFit
                }
            }
        }
    }

    // Convert scores to recommendations
    const recommendations: ProcedureRecommendation[] = []

    // Sort procedures by score
    const sortedProcedures = (Object.entries(scores) as [ProcedureId, number][])
        .filter(([, score]) => score > 0)
        .sort((a, b) => b[1] - a[1])

    // Mark top procedure as primary, others based on confidence
    const maxScore = sortedProcedures[0]?.[1] ?? 0

    for (let i = 0; i < sortedProcedures.length; i++) {
        const entry = sortedProcedures[i]
        if (!entry) continue
        const [procedureId, score] = entry
        const confidence =
            score >= maxScore * HIGH_CONFIDENCE_THRESHOLD
                ? 'high'
                : score >= maxScore * MEDIUM_CONFIDENCE_THRESHOLD
                  ? 'medium'
                  : 'low'

        recommendations.push({
            procedureId,
            confidence,
            isPrimary: i === 0,
            matchedConcerns: [...new Set(matchedConcerns[procedureId])], // Dedupe
        })
    }

    return recommendations
}

/**
 * Get human-readable label for a concern
 */
function getConcernLabel(
    concern: FaceConcern | BreastConcern | BodyConcern
): string {
    const labels: Record<FaceConcern | BreastConcern | BodyConcern, string> = {
        'drooping-eyelids': 'Heavy or drooping eyelids',
        'sagging-skin': 'Sagging facial skin',
        'both-face': 'Complete facial rejuvenation',
        'want-larger': 'Increase breast size',
        'lost-shape': 'Restore breast shape',
        'too-large': 'Reduce breast size',
        'multiple-breast': 'Multiple breast concerns',
        'stubborn-fat': 'Stubborn fat removal',
        'flat-tummy': 'Flatten tummy',
        'enhance-curves': 'Enhance curves',
        'post-pregnancy': 'Post-pregnancy restoration',
        'multiple-body': 'Multiple body areas',
    }

    return labels[concern] || concern
}

/**
 * Get complementary procedures for package builder
 */
export function getComplementaryProcedures(
    primaryProcedure: ProcedureId
): readonly ProcedureId[] {
    const complementaryMap: Record<ProcedureId, readonly ProcedureId[]> = {
        'breast-augmentation': ['breast-lift', 'liposuction'],
        'breast-lift': ['breast-augmentation', 'liposuction'],
        'breast-reduction': ['liposuction'],
        liposuction: ['tummy-tuck', 'bbl'],
        bbl: ['liposuction', 'tummy-tuck'],
        'tummy-tuck': ['liposuction', 'breast-lift'],
        'mommy-makeover': [], // Already a combination
        facelift: ['blepharoplasty'],
        blepharoplasty: ['facelift'],
    }

    return complementaryMap[primaryProcedure] || []
}

/**
 * Get procedure recovery timeline for combinations
 */
export function getCombinedRecoveryWeeks(
    procedures: readonly ProcedureId[]
): number {
    if (procedures.length === 0) return 0

    // For combinations, take the longest recovery time
    // (procedures are done together, not sequentially)
    return Math.max(...procedures.map((p) => PROCEDURE_RECOVERY_WEEKS[p] || 0))
}
