/**
 * Quiz Components
 *
 * Main exports for the procedure finder quiz.
 *
 * @module components/quiz
 */

// Main container
export { QuizContainer } from './quiz-container.component'
export type { QuizContainerProps } from './quiz-container.component'

// Progress components
export {
    CircularProgress,
    QuizProgress,
    SegmentedProgress,
} from './quiz-progress.component'
export type {
    CircularProgressProps,
    QuizProgressProps,
    SegmentedProgressProps,
} from './quiz-progress.component'

// Navigation
export { MinimalNavigation, QuizNavigation } from './quiz-navigation.component'
export type {
    MinimalNavigationProps,
    QuizNavigationProps,
} from './quiz-navigation.component'

// Steps (re-export from steps folder)
export * from './steps'

// UI components (re-export from ui folder)
export * from './ui'

// Types and data
export * from './lib/quiz-types'
export * from './lib/quiz-questions.data'
export * from './lib/quiz-pricing.data'
export {
    calculateRecommendations,
    getComplementaryProcedures,
} from './lib/quiz-logic'
