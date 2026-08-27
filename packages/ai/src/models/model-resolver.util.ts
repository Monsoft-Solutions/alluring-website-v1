/**
 * Model Resolver Utility
 *
 * Every model call in this package goes through OpenRouter — one API key, one
 * namespace, one billing surface. The direct `@ai-sdk/anthropic` and
 * `@ai-sdk/openai` provider paths are retired (issue #195).
 *
 * @module @workspace/ai/models/model-resolver
 */
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import type { LanguageModel } from 'ai'

/**
 * The single OpenRouter provider instance.
 * Model ids follow the `vendor/model` convention
 * (e.g. `anthropic/claude-opus-5`, `google/gemini-3.6-flash`).
 * Requires the OPENROUTER_API_KEY environment variable.
 */
const openrouter = createOpenRouter({
    // No `?? ''` fallback: an empty string is a *valid* key to the provider, so it
    // would send `Authorization: Bearer ` and 401 for the process lifetime. Left
    // undefined, the provider raises a clear "API key is missing" error instead.
    // eslint-disable-next-line no-restricted-properties -- packages/ai has no env module; provider SDKs read process.env the same way
    apiKey: process.env.OPENROUTER_API_KEY,
})

/**
 * Bare model ids still in flight — stored in `blog_ai_config`, in the
 * `chat_config` model enum, and in the per-function model constants — mapped to
 * their OpenRouter equivalents.
 *
 * **This is deliberately a lookup table, not a prefix rule.** Anthropic's point
 * releases are dashed here and dotted on OpenRouter
 * (`claude-haiku-4-5` → `anthropic/claude-haiku-4.5`), so
 * `` `anthropic/${modelId}` `` 404s on exactly the legacy ids we have stored.
 * Every value is asserted against the live catalog by
 * `apps/admin/__tests__/lib/ai/openrouter-id-map.test.ts`.
 */
const LEGACY_ID_MAP: Record<string, string> = {
    'claude-opus-5': 'anthropic/claude-opus-5',
    'claude-sonnet-5': 'anthropic/claude-sonnet-5',
    'claude-haiku-4-5': 'anthropic/claude-haiku-4.5',
    'claude-opus-4-5': 'anthropic/claude-opus-4.5',
    'claude-sonnet-4-5': 'anthropic/claude-sonnet-4.5',
    'gpt-4.1': 'openai/gpt-4.1',
    'gpt-4.1-mini': 'openai/gpt-4.1-mini',
    'gpt-4.1-nano': 'openai/gpt-4.1-nano',
    'gpt-4-turbo': 'openai/gpt-4-turbo',
    'gpt-5.2': 'openai/gpt-5.2',
}

/** Bare ids already warned about, so one stale config row doesn't flood the logs. */
const warnedUnmappedIds = new Set<string>()

/**
 * Translate a model id to its OpenRouter form.
 *
 * Ids that already contain a `/` are passed through untouched — every model on
 * https://openrouter.ai/models works. Bare ids are looked up in
 * {@link LEGACY_ID_MAP}. An unmapped bare id is passed through with a warning
 * so it surfaces as an OpenRouter 404 with a breadcrumb rather than silently
 * routing somewhere unexpected.
 *
 * @param modelId - A bare id (`claude-opus-5`) or an OpenRouter id (`anthropic/claude-opus-5`)
 * @returns The OpenRouter model id
 */
export function toOpenRouterId(modelId: string): string {
    if (modelId.includes('/')) return modelId

    const mapped = LEGACY_ID_MAP[modelId]
    if (mapped) return mapped

    if (!warnedUnmappedIds.has(modelId)) {
        warnedUnmappedIds.add(modelId)
        console.warn(
            `[ModelResolver] Unmapped bare model id "${modelId}" — passing through to OpenRouter as-is. Add it to LEGACY_ID_MAP if this is a model we use.`
        )
    }

    return modelId
}

/**
 * Get the OpenRouter model instance for a given model ID
 *
 * @param modelId - The model identifier, bare or OpenRouter-style
 * @returns The OpenRouter language model
 *
 * @example
 * ```typescript
 * const model = getModel('claude-opus-5')             // anthropic/claude-opus-5
 * const model = getModel('google/gemini-3.6-flash')   // passed through
 * ```
 */
export function getModel(modelId: string): LanguageModel {
    return openrouter.chat(toOpenRouterId(modelId), {
        // `strict: true` (the provider's default) requires every property in the
        // JSON schema to appear in `required`. Our Zod schemas use optional fields
        // throughout, so OpenAI-family models reject the request outright with
        // `invalid_json_schema` ("'required' ... Missing 'wordCount'"). Relaxing it
        // is what makes `generateObject` work for those models; it does not change
        // behaviour for models that already accepted the schema.
        structuredOutputs: { strict: false },
    })
}

/**
 * The bare ids this package knows how to translate.
 * Exported for the id-map test; not part of the runtime path.
 */
export const LEGACY_MODEL_IDS = Object.freeze(Object.keys(LEGACY_ID_MAP))

/**
 * The OpenRouter ids the legacy map resolves to.
 * Exported for the id-map test; not part of the runtime path.
 */
export const LEGACY_OPENROUTER_IDS = Object.freeze(Object.values(LEGACY_ID_MAP))
