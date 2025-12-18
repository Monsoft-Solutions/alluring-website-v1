/**
 * Available AI Models
 *
 * Centralized model definitions for use across the application.
 * Used by admin UI for model selection and configuration.
 *
 * @module @workspace/ai/models/available-models
 */

/**
 * Model capability types
 */
export type ModelCapability =
    | 'chat'
    | 'function-calling'
    | 'vision'
    | 'structured-output'

/**
 * Model pricing tier
 */
export type ModelTier = 'standard' | 'premium' | 'economy'

/**
 * Model provider
 */
export type ModelProvider = 'openai' | 'anthropic' | 'google'

/**
 * Model definition with metadata
 */
export type AIModel = {
    /** Model identifier used in API calls */
    id: string
    /** Human-readable display name */
    name: string
    /** Model provider */
    provider: ModelProvider
    /** Model capabilities */
    capabilities: ModelCapability[]
    /** Maximum context window in tokens */
    maxTokens: number
    /** Pricing tier for cost estimation */
    tier: ModelTier
    /** Optional description */
    description?: string
    /** Whether the model is recommended for production use */
    recommended?: boolean
}

/**
 * Available AI models for the application
 *
 * This constant defines all models available for selection in the admin UI.
 * Models are sorted by recommendation and tier.
 */
export const AVAILABLE_MODELS: AIModel[] = [
    // Anthropic Models (Default)
    {
        id: 'claude-sonnet-4-5',
        name: 'Claude Sonnet 4.5',
        provider: 'anthropic',
        capabilities: [
            'chat',
            'function-calling',
            'vision',
            'structured-output',
        ],
        maxTokens: 200000,
        tier: 'premium',
        description:
            'Best-in-class coding and reasoning model with 30+ hour autonomous operation',
        recommended: true,
    },
    // Google Models
    {
        id: 'gemini-3-flash-preview',
        name: 'Gemini 3 Flash',
        provider: 'google',
        capabilities: [
            'chat',
            'function-calling',
            'vision',
            'structured-output',
        ],
        maxTokens: 1048576,
        tier: 'standard',
        description:
            'Lightning-fast reasoning at search speed with cost-effective performance',
        recommended: true,
    },
    {
        id: 'gemini-3-pro-preview',
        name: 'Gemini 3 Flash',
        provider: 'google',
        capabilities: [
            'chat',
            'function-calling',
            'vision',
            'structured-output',
        ],
        maxTokens: 1048576,
        tier: 'standard',
        description:
            'Lightning-fast reasoning at search speed with cost-effective performance',
        recommended: true,
    },
    // OpenAI Models
    {
        id: 'gpt-4.1',
        name: 'GPT-4o',
        provider: 'openai',
        capabilities: [
            'chat',
            'function-calling',
            'vision',
            'structured-output',
        ],
        maxTokens: 128000,
        tier: 'premium',
        description: 'Most capable model with vision and advanced reasoning',
        recommended: true,
    },
    {
        id: 'gpt-4.1-mini',
        name: 'GPT-4o Mini',
        provider: 'openai',
        capabilities: ['chat', 'function-calling', 'structured-output'],
        maxTokens: 128000,
        tier: 'standard',
        description: 'Fast and cost-effective for most tasks',
        recommended: true,
    },
    {
        id: 'gpt-4.1-nano',
        name: 'GPT-4.1 Nano',
        provider: 'openai',
        capabilities: ['chat', 'function-calling', 'structured-output'],
        maxTokens: 1047576,
        tier: 'standard',
        description: 'Nano model for fast and cost-effective tasks',
        recommended: true,
    },
] as const

/**
 * Default model ID for chat operations
 */
export const DEFAULT_CHAT_MODEL_ID = 'claude-sonnet-4-5'

/**
 * Default model ID for intent classification
 */
export const DEFAULT_CLASSIFICATION_MODEL_ID = 'gemini-3-flash-preview'

export const DEFAULT_CONVERSATION_ANALYSIS_MODEL_ID = 'gemini-3-flash-preview'

export const DEFAULT_QUICK_QUESTIONS_MODEL_ID = 'gemini-3-flash-preview'

export const DEFAULT_DEEP_DIVE_ANALYSIS_MODEL_ID = 'gpt-4.1'

/**
 * Get a model by its ID
 *
 * @param modelId - The model ID to look up
 * @returns The model definition or undefined
 */
export function getModelById(modelId: string): AIModel | undefined {
    return AVAILABLE_MODELS.find((model) => model.id === modelId)
}

/**
 * Get recommended models
 *
 * @returns Array of recommended models
 */
export function getRecommendedModels(): AIModel[] {
    return AVAILABLE_MODELS.filter((model) => model.recommended)
}

/**
 * Get models by tier
 *
 * @param tier - The pricing tier to filter by
 * @returns Array of models in the specified tier
 */
export function getModelsByTier(tier: ModelTier): AIModel[] {
    return AVAILABLE_MODELS.filter((model) => model.tier === tier)
}

/**
 * Check if a model ID is valid
 *
 * @param modelId - The model ID to validate
 * @returns True if the model exists
 */
export function isValidModelId(modelId: string): boolean {
    return AVAILABLE_MODELS.some((model) => model.id === modelId)
}

/**
 * Get the provider for a model ID
 *
 * @param modelId - The model ID to look up
 * @returns The provider or undefined if model not found
 */
export function getModelProvider(modelId: string): ModelProvider | undefined {
    return getModelById(modelId)?.provider
}
