/**
 * @workspace/ai/models
 *
 * AI model definitions and utilities.
 *
 * @module @workspace/ai/models
 */

export {
    AVAILABLE_MODELS,
    DEFAULT_CHAT_MODEL_ID,
    DEFAULT_CLASSIFICATION_MODEL_ID,
    DEFAULT_CONVERSATION_ANALYSIS_MODEL_ID,
    DEFAULT_QUICK_QUESTIONS_MODEL_ID,
    DEFAULT_DEEP_DIVE_ANALYSIS_MODEL_ID,
    getModelById,
    getRecommendedModels,
    getModelsByTier,
    isValidModelId,
    type AIModel,
    type ModelCapability,
    type ModelProvider,
    type ModelTier,
} from './available-models.constant'

export {
    getModel,
    toOpenRouterId,
    LEGACY_MODEL_IDS,
    LEGACY_OPENROUTER_IDS,
} from './model-resolver.util'

export {
    REASONING_EFFORTS,
    DEFAULT_REASONING_EFFORT,
    isReasoningEffort,
    type ReasoningEffort,
} from './reasoning-effort.constant'

export { reasoningProviderOptions } from './reasoning.util'

export {
    readOpenRouterUsage,
    readOpenRouterCost,
    sumCosts,
    type OpenRouterCallUsage,
    type WithCallCost,
} from './openrouter-usage.util'
