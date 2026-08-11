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
export type ModelProvider = 'openai' | 'anthropic' | 'openrouter'

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
    {
        id: 'claude-opus-5',
        name: 'Claude Opus 5',
        provider: 'anthropic',
        capabilities: [
            'chat',
            'function-calling',
            'vision',
            'structured-output',
        ],
        maxTokens: 1000000,
        tier: 'premium',
        description:
            'Most capable model for content generation, review, and complex reasoning',
        recommended: true,
    },
    {
        id: 'claude-sonnet-5',
        name: 'Claude Sonnet 5',
        provider: 'anthropic',
        capabilities: [
            'chat',
            'function-calling',
            'vision',
            'structured-output',
        ],
        maxTokens: 1000000,
        tier: 'standard',
        description: 'Near-Opus quality at lower cost for most content tasks',
        recommended: true,
    },
    {
        id: 'claude-haiku-4-5',
        name: 'Claude Haiku 4.5',
        provider: 'anthropic',
        capabilities: [
            'chat',
            'function-calling',
            'vision',
            'structured-output',
        ],
        maxTokens: 200000,
        tier: 'economy',
        description: 'Fastest and most cost-effective for simple tasks',
        recommended: true,
    },
    {
        id: 'gpt-4.1',
        name: 'GPT-4.1',
        provider: 'openai',
        capabilities: [
            'chat',
            'function-calling',
            'vision',
            'structured-output',
        ],
        maxTokens: 128000,
        tier: 'premium',
        description: 'OpenAI model with vision and advanced reasoning',
        recommended: false,
    },
    {
        id: 'gpt-4.1-mini',
        name: 'GPT-4.1 Mini',
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
    {
        id: 'claude-opus-4-5',
        name: 'Claude Opus 4.5',
        provider: 'anthropic',
        capabilities: [
            'chat',
            'function-calling',
            'vision',
            'structured-output',
        ],
        maxTokens: 200000,
        tier: 'premium',
        description: 'Legacy Anthropic model (superseded by Claude Opus 5)',
        recommended: false,
    },
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
        tier: 'standard',
        description: 'Legacy Anthropic model (superseded by Claude Sonnet 5)',
        recommended: false,
    },
    {
        id: 'google/gemini-3.6-flash',
        name: 'Gemini 3.6 Flash (OpenRouter)',
        provider: 'openrouter',
        capabilities: [
            'chat',
            'function-calling',
            'vision',
            'structured-output',
        ],
        maxTokens: 1048576,
        tier: 'standard',
        description: "Google's fast flagship via OpenRouter — 1M context",
        recommended: true,
    },
    {
        id: 'openai/gpt-5.6-terra',
        name: 'GPT-5.6 Terra (OpenRouter)',
        provider: 'openrouter',
        capabilities: ['chat', 'function-calling', 'structured-output'],
        maxTokens: 1050000,
        tier: 'standard',
        description: 'OpenAI mid-tier via OpenRouter — 1M context',
        recommended: false,
    },
    {
        id: 'x-ai/grok-4.5',
        name: 'Grok 4.5 (OpenRouter)',
        provider: 'openrouter',
        capabilities: ['chat', 'function-calling', 'structured-output'],
        maxTokens: 500000,
        tier: 'standard',
        description: 'xAI flagship via OpenRouter',
        recommended: false,
    },
    {
        id: 'deepseek/deepseek-v4-flash-0731',
        name: 'DeepSeek V4 Flash (OpenRouter)',
        provider: 'openrouter',
        capabilities: ['chat', 'function-calling', 'structured-output'],
        maxTokens: 1048576,
        tier: 'economy',
        description: 'Ultra-low-cost via OpenRouter — 1M context',
        recommended: false,
    },
    {
        id: 'moonshotai/kimi-k3',
        name: 'Kimi K3 (OpenRouter)',
        provider: 'openrouter',
        capabilities: ['chat', 'function-calling', 'structured-output'],
        maxTokens: 1048576,
        tier: 'standard',
        description: 'Moonshot flagship via OpenRouter — 1M context',
        recommended: false,
    },
] as const

/**
 * Default model ID for chat operations
 */
export const DEFAULT_CHAT_MODEL_ID = 'gpt-4.1'

/**
 * Default model ID for intent classification
 */
export const DEFAULT_CLASSIFICATION_MODEL_ID = 'gpt-4.1-nano'

export const DEFAULT_CONVERSATION_ANALYSIS_MODEL_ID = 'gpt-4.1-mini'

export const DEFAULT_QUICK_QUESTIONS_MODEL_ID = 'gpt-4.1-mini'

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
 * Check if a model ID is valid.
 *
 * Any id containing a `/` follows the OpenRouter `vendor/model` convention and
 * is accepted even when not curated in AVAILABLE_MODELS — every model on
 * https://openrouter.ai/models works (requires OPENROUTER_API_KEY).
 *
 * @param modelId - The model ID to validate
 * @returns True if the model exists or is an OpenRouter-style id
 */
export function isValidModelId(modelId: string): boolean {
    if (modelId.includes('/')) {
        return modelId.length > 3
    }

    return AVAILABLE_MODELS.some((model) => model.id === modelId)
}
