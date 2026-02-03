/**
 * Quiz Type Definitions
 *
 * TypeScript types for the procedure finder quiz.
 * Defines state management, question structures, and recommendation logic.
 *
 * @module components/quiz/lib/quiz-types
 */

/**
 * Body areas that can be selected in the quiz
 */
export type BodyArea = 'face' | 'breast' | 'body'

/**
 * Specific concerns for each body area
 */
export type FaceConcern = 'drooping-eyelids' | 'sagging-skin' | 'both-face'

export type BreastConcern =
    | 'want-larger'
    | 'lost-shape'
    | 'too-large'
    | 'multiple-breast'

export type BodyConcern =
    | 'stubborn-fat'
    | 'flat-tummy'
    | 'enhance-curves'
    | 'post-pregnancy'
    | 'multiple-body'

export type Concern = FaceConcern | BreastConcern | BodyConcern

/**
 * Recovery time options
 */
export type RecoveryTime = '1-week' | '2-weeks' | '3-plus-weeks'

/**
 * Life event options
 */
export type LifeEvent = 'wedding' | 'vacation' | 'reunion' | 'just-for-me'

/**
 * Budget range (monthly payment comfort level)
 */
export type BudgetRange = 'low' | 'medium' | 'high' | 'premium'

/**
 * Procedure identifiers matching the system
 */
export type ProcedureId =
    | 'breast-augmentation'
    | 'breast-lift'
    | 'breast-reduction'
    | 'liposuction'
    | 'bbl'
    | 'tummy-tuck'
    | 'mommy-makeover'
    | 'facelift'
    | 'blepharoplasty'

/**
 * Quiz step identifiers
 */
export type QuizStep =
    | 'welcome'
    | 'body-area'
    | 'face-concerns'
    | 'breast-concerns'
    | 'body-concerns'
    | 'lifestyle'
    | 'event'
    | 'budget'
    | 'lead-capture'
    | 'results'
    | 'package-builder'
    | 'booking'

/**
 * Lead capture form data
 */
export interface QuizLeadData {
    readonly firstName: string
    readonly lastName: string
    readonly email: string
    readonly phone: string
}

/**
 * Complete quiz state
 */
export interface QuizState {
    readonly currentStep: QuizStep
    readonly selectedBodyAreas: readonly BodyArea[]
    readonly faceConcerns: readonly FaceConcern[]
    readonly breastConcerns: readonly BreastConcern[]
    readonly bodyConcerns: readonly BodyConcern[]
    readonly recoveryTime: RecoveryTime | null
    readonly lifeEvent: LifeEvent | null
    readonly budgetRange: BudgetRange | null
    readonly leadData: QuizLeadData | null
    readonly isLeadCaptured: boolean
    readonly recommendedProcedures: readonly ProcedureRecommendation[]
    readonly selectedPackage: readonly ProcedureId[]
}

/**
 * Procedure recommendation with confidence score
 */
export interface ProcedureRecommendation {
    readonly procedureId: ProcedureId
    readonly confidence: 'high' | 'medium' | 'low'
    readonly isPrimary: boolean
    readonly matchedConcerns: readonly string[]
}

/**
 * Procedure details for display
 */
export interface ProcedureDetails {
    readonly id: ProcedureId
    readonly title: string
    readonly shortDescription: string
    readonly slug: string
    readonly category: 'face' | 'breast' | 'body' | 'combined'
    readonly priceRange: {
        readonly min: number
        readonly max: number
    }
    readonly monthlyPayment: {
        readonly min: number
        readonly max: number
    }
    readonly recoveryWeeks: number
    readonly benefits: readonly string[]
    readonly image?: string
}

/**
 * Quiz actions for state updates
 */
export type QuizAction =
    | { type: 'SET_STEP'; step: QuizStep }
    | { type: 'TOGGLE_BODY_AREA'; area: BodyArea }
    | { type: 'SET_FACE_CONCERNS'; concerns: readonly FaceConcern[] }
    | { type: 'SET_BREAST_CONCERNS'; concerns: readonly BreastConcern[] }
    | { type: 'SET_BODY_CONCERNS'; concerns: readonly BodyConcern[] }
    | { type: 'SET_RECOVERY_TIME'; time: RecoveryTime }
    | { type: 'SET_LIFE_EVENT'; event: LifeEvent }
    | { type: 'SET_BUDGET_RANGE'; range: BudgetRange }
    | { type: 'SET_LEAD_DATA'; data: QuizLeadData }
    | {
          type: 'SET_RECOMMENDATIONS'
          recommendations: readonly ProcedureRecommendation[]
      }
    | { type: 'TOGGLE_PACKAGE_PROCEDURE'; procedureId: ProcedureId }
    | { type: 'RESET' }

/**
 * Option for selection cards
 */
export interface QuizOption<T = string> {
    readonly value: T
    readonly label: string
    readonly description?: string
    readonly icon?: string
}

/**
 * Initial quiz state
 */
export const initialQuizState: QuizState = {
    currentStep: 'welcome',
    selectedBodyAreas: [],
    faceConcerns: [],
    breastConcerns: [],
    bodyConcerns: [],
    recoveryTime: null,
    lifeEvent: null,
    budgetRange: null,
    leadData: null,
    isLeadCaptured: false,
    recommendedProcedures: [],
    selectedPackage: [],
}

/**
 * Quiz step order for navigation
 */
export const QUIZ_STEP_ORDER: readonly QuizStep[] = [
    'welcome',
    'body-area',
    // Concern steps are dynamic based on selected areas
    'lifestyle',
    'event',
    'budget',
    'lead-capture',
    'results',
    'package-builder',
    'booking',
]

/**
 * Get the next step in the quiz flow
 */
export function getNextStep(
    currentStep: QuizStep,
    state: QuizState
): QuizStep | null {
    switch (currentStep) {
        case 'welcome':
            return 'body-area'

        case 'body-area':
            // Navigate to first selected concern step
            if (state.selectedBodyAreas.includes('face')) return 'face-concerns'
            if (state.selectedBodyAreas.includes('breast'))
                return 'breast-concerns'
            if (state.selectedBodyAreas.includes('body')) return 'body-concerns'
            return 'lifestyle'

        case 'face-concerns':
            if (state.selectedBodyAreas.includes('breast'))
                return 'breast-concerns'
            if (state.selectedBodyAreas.includes('body')) return 'body-concerns'
            return 'lifestyle'

        case 'breast-concerns':
            if (state.selectedBodyAreas.includes('body')) return 'body-concerns'
            return 'lifestyle'

        case 'body-concerns':
            return 'lifestyle'

        case 'lifestyle':
            return 'event'

        case 'event':
            return 'budget'

        case 'budget':
            return 'lead-capture'

        case 'lead-capture':
            return 'results'

        case 'results':
            return 'package-builder'

        case 'package-builder':
            return 'booking'

        case 'booking':
            return null

        default:
            return null
    }
}

/**
 * Get the previous step in the quiz flow
 */
export function getPreviousStep(
    currentStep: QuizStep,
    state: QuizState
): QuizStep | null {
    switch (currentStep) {
        case 'welcome':
            return null

        case 'body-area':
            return 'welcome'

        case 'face-concerns':
            return 'body-area'

        case 'breast-concerns':
            if (state.selectedBodyAreas.includes('face')) return 'face-concerns'
            return 'body-area'

        case 'body-concerns':
            if (state.selectedBodyAreas.includes('breast'))
                return 'breast-concerns'
            if (state.selectedBodyAreas.includes('face')) return 'face-concerns'
            return 'body-area'

        case 'lifestyle':
            if (state.selectedBodyAreas.includes('body')) return 'body-concerns'
            if (state.selectedBodyAreas.includes('breast'))
                return 'breast-concerns'
            if (state.selectedBodyAreas.includes('face')) return 'face-concerns'
            return 'body-area'

        case 'event':
            return 'lifestyle'

        case 'budget':
            return 'event'

        case 'lead-capture':
            return 'budget'

        case 'results':
            return 'lead-capture'

        case 'package-builder':
            return 'results'

        case 'booking':
            return 'package-builder'

        default:
            return null
    }
}

/**
 * Calculate total steps for progress indicator
 */
export function calculateTotalSteps(state: QuizState): number {
    let steps = 7 // welcome, body-area, lifestyle, event, budget, lead-capture, results

    // Add concern steps based on selected areas
    if (state.selectedBodyAreas.includes('face')) steps++
    if (state.selectedBodyAreas.includes('breast')) steps++
    if (state.selectedBodyAreas.includes('body')) steps++

    return steps
}

/**
 * Get current step number for progress
 */
export function getCurrentStepNumber(state: QuizState): number {
    const { currentStep, selectedBodyAreas } = state
    let stepNumber = 1

    const stepSequence: QuizStep[] = ['welcome', 'body-area']

    if (selectedBodyAreas.includes('face')) stepSequence.push('face-concerns')
    if (selectedBodyAreas.includes('breast'))
        stepSequence.push('breast-concerns')
    if (selectedBodyAreas.includes('body')) stepSequence.push('body-concerns')

    stepSequence.push('lifestyle', 'event', 'budget', 'lead-capture', 'results')

    const index = stepSequence.indexOf(currentStep)
    if (index !== -1) {
        stepNumber = index + 1
    }

    return stepNumber
}
