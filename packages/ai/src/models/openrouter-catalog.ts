/**
 * OpenRouter Model Catalog
 *
 * Every model call goes through OpenRouter (issue #195), so the set of models
 * the blog pipeline can run on is whatever OpenRouter currently serves — not a
 * curated constant in this repo. This module fetches that catalog and
 * normalizes it into the shape the settings picker needs.
 *
 * The endpoint is public: no API key, no auth header.
 *
 * @module @workspace/ai/models/openrouter-catalog
 */

/** Where the catalog comes from. Public, unauthenticated. */
export const OPENROUTER_MODELS_URL = 'https://openrouter.ai/api/v1/models'

/**
 * A model as the settings picker needs it: enough to choose between 400-odd
 * options without leaving the page.
 */
export type OpenRouterCatalogModel = {
    /** Full OpenRouter id, e.g. `anthropic/claude-opus-5` */
    id: string
    /**
     * Vendor half of the id, e.g. `anthropic`.
     *
     * The picker sorts on this, so OpenRouter's floating-alias prefix is
     * stripped: `~anthropic/claude-opus-latest` is an Anthropic model and
     * belongs beside the pinned ones, not in a `~` group of its own.
     */
    vendor: string
    /** Human-readable name, e.g. `Claude Opus 5` */
    name: string
    /** Maximum context window in tokens */
    contextLength: number
    /** Input price in USD per 1M tokens, or null when OpenRouter reports none */
    promptPricePerM: number | null
    /** Output price in USD per 1M tokens, or null when OpenRouter reports none */
    completionPricePerM: number | null
    /** `supported_parameters` includes `reasoning` — gates the effort select */
    supportsReasoning: boolean
    /** `supported_parameters` includes `tools` */
    supportsTools: boolean
    /** `supported_parameters` includes `structured_outputs` */
    supportsStructuredOutputs: boolean
    /** Id ends `:free` — usable, but rate-limited */
    isFreeVariant: boolean
}

/**
 * The raw record shape, narrowed to the fields we read.
 *
 * Deliberately permissive: OpenRouter adds fields regularly, and a new one
 * must never break the picker.
 */
type RawOpenRouterModel = {
    id?: unknown
    name?: unknown
    context_length?: unknown
    pricing?: { prompt?: unknown; completion?: unknown }
    supported_parameters?: unknown
}

/**
 * Variant suffix for OpenRouter's async batch endpoints.
 *
 * Excluded from the catalog: batch models have different (asynchronous)
 * semantics that the synchronous blog pipeline cannot drive.
 */
const BATCH_SUFFIX = ':batch'

/** Variant suffix for free, rate-limited endpoints. Shown, but flagged. */
const FREE_SUFFIX = ':free'

/**
 * OpenRouter's prefix for a floating alias that always points at a vendor's
 * current release, e.g. `~anthropic/claude-opus-latest`. Part of the id and
 * sent as-is; stripped only when deriving the vendor for sorting.
 */
const ALIAS_PREFIX = '~'

/**
 * Convert OpenRouter's per-token decimal string to USD per 1M tokens.
 *
 * Prices arrive as strings like `"0.000005"`; `"0"` and `"-1"` (the
 * "not applicable" sentinel) both normalize to null so the UI can omit the
 * badge rather than print a misleading `$0.00`.
 */
function toPricePerMillion(value: unknown): number | null {
    if (typeof value !== 'string' && typeof value !== 'number') return null
    const perToken = Number(value)
    if (!Number.isFinite(perToken) || perToken <= 0) return null
    return perToken * 1_000_000
}

/**
 * Normalize one raw record, or null when it is unusable.
 */
function normalizeModel(
    raw: RawOpenRouterModel
): OpenRouterCatalogModel | null {
    const { id } = raw
    if (typeof id !== 'string' || !id.includes('/')) return null
    if (id.endsWith(BATCH_SUFFIX)) return null

    const params = Array.isArray(raw.supported_parameters)
        ? raw.supported_parameters.filter(
              (param): param is string => typeof param === 'string'
          )
        : []

    const contextLength =
        typeof raw.context_length === 'number' &&
        Number.isFinite(raw.context_length)
            ? raw.context_length
            : 0

    const vendor = id.slice(0, id.indexOf('/'))

    return {
        id,
        vendor: vendor.startsWith(ALIAS_PREFIX) ? vendor.slice(1) : vendor,
        name: typeof raw.name === 'string' && raw.name ? raw.name : id,
        contextLength,
        promptPricePerM: toPricePerMillion(raw.pricing?.prompt),
        completionPricePerM: toPricePerMillion(raw.pricing?.completion),
        supportsReasoning: params.includes('reasoning'),
        supportsTools: params.includes('tools'),
        supportsStructuredOutputs: params.includes('structured_outputs'),
        isFreeVariant: id.endsWith(FREE_SUFFIX),
    }
}

/**
 * Normalize a raw `/api/v1/models` payload.
 *
 * Split out from the fetch so it can be tested against a checked-in payload
 * without a network call.
 *
 * @param payload - The parsed JSON body, or anything at all
 * @returns Normalized models, `:batch` variants dropped, sorted vendor then name
 */
export function normalizeOpenRouterCatalog(
    payload: unknown
): OpenRouterCatalogModel[] {
    const data =
        payload && typeof payload === 'object' && 'data' in payload
            ? (payload as { data: unknown }).data
            : null

    if (!Array.isArray(data)) return []

    return data
        .map((entry) =>
            entry && typeof entry === 'object'
                ? normalizeModel(entry as RawOpenRouterModel)
                : null
        )
        .filter((model): model is OpenRouterCatalogModel => model !== null)
        .sort(
            (a, b) =>
                a.vendor.localeCompare(b.vendor) || a.name.localeCompare(b.name)
        )
}

/**
 * Fetch and normalize the live OpenRouter catalog.
 *
 * Throws on a network failure or a non-OK response — callers are expected to
 * fall back to the checked-in snapshot rather than render an empty picker.
 *
 * @param signal - Optional abort signal
 * @returns Every non-`:batch` model OpenRouter currently serves
 */
export async function fetchOpenRouterCatalog(
    signal?: AbortSignal
): Promise<OpenRouterCatalogModel[]> {
    const response = await fetch(OPENROUTER_MODELS_URL, {
        headers: { accept: 'application/json' },
        ...(signal ? { signal } : {}),
    })

    if (!response.ok) {
        throw new Error(
            `OpenRouter catalog fetch failed: ${response.status} ${response.statusText}`
        )
    }

    const models = normalizeOpenRouterCatalog(await response.json())

    if (models.length === 0) {
        throw new Error('OpenRouter catalog fetch returned no usable models')
    }

    return models
}
