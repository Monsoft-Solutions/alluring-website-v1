/**
 * @workspace/ai
 *
 * Centralized AI package for the Alluring Plastic Surgery application.
 * Consolidates all AI-related operations, models, prompts, and schemas.
 *
 * @module @workspace/ai
 *
 * @example
 * ```typescript
 * // Import AI functions
 * import { classifyIntent, streamChat, openai, streamText } from '@workspace/ai'
 *
 * // Import schemas
 * import { intentClassificationSchema, type IntentClassification } from '@workspace/ai/schemas'
 *
 * // Import models
 * import { AVAILABLE_MODELS, DEFAULT_CHAT_MODEL_ID } from '@workspace/ai/models'
 *
 * // Import prompts
 * import { getIntentClassificationPrompt } from '@workspace/ai/prompts'
 * ```
 */

// Re-export everything from submodules for convenience
export * from './core'
export * from './functions'
export * from './schemas'
export * from './models'
export * from './prompts'
