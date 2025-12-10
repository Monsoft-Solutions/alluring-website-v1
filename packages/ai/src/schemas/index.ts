/**
 * @workspace/ai/schemas
 *
 * Zod schemas for AI structured outputs.
 *
 * This module exports only AI-specific schemas that are local to this package.
 * Shared types (chat, gallery) should be imported directly from @workspace/shared.
 *
 * @example
 * ```typescript
 * // AI-specific schemas
 * import { imageAnalysisSchema, quickQuestionsSchema } from '@workspace/ai/schemas'
 *
 * // Shared chat types - import directly from shared package
 * import { intentClassificationSchema, type IntentClassification } from '@workspace/shared/schemas/chat'
 *
 * // Shared gallery types - import directly from shared package
 * import { seoContentSchema, type SEOContent } from '@workspace/shared/schemas/gallery'
 * ```
 *
 * @module @workspace/ai/schemas
 */

export {
    quickQuestionsSchema,
    MAX_QUESTION_LENGTH,
    type QuickQuestions,
    type QuickQuestionsMessage,
    type GenerateQuickQuestionsParams,
} from './quick-questions.schema'

export {
    imageAnalysisSchema,
    type ImageAnalysis,
} from './image-analysis.schema'
