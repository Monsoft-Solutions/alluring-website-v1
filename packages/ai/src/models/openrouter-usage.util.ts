/**
 * OpenRouter Usage Accounting
 *
 * `getModel` enables OpenRouter's usage accounting, so every result carries
 * what the call actually cost. The AI SDK surfaces it as opaque provider
 * metadata; this reads it back with a type (epic #194).
 *
 * @module @workspace/ai/models/openrouter-usage
 */

/**
 * A result plus what the call that produced it cost.
 *
 * Used at return-type annotations so schema-derived types (`z.infer<…>`) stay
 * a description of the *content* and never grow a billing field.
 */
export type WithCallCost<T> = T & { costUsd?: number }

/** What OpenRouter reports back about one call. */
export type OpenRouterCallUsage = {
    /** Total cost of the call in USD, as OpenRouter billed it */
    costUsd: number
    /**
     * Output tokens the model spent thinking. Zero at `effort: 'none'` — this
     * is the number that shows what raising a phase's effort actually bought.
     */
    reasoningTokens: number
}

/**
 * Read OpenRouter's usage accounting off an AI SDK result.
 *
 * @param providerMetadata - `result.providerMetadata` from any core wrapper
 * @returns The reported cost and reasoning tokens, or null when absent
 *
 * @example
 * ```typescript
 * const usage = readOpenRouterUsage(result.providerMetadata)
 * console.log(usage?.costUsd) // 0.000246
 * ```
 */
export function readOpenRouterUsage(
    providerMetadata: unknown
): OpenRouterCallUsage | null {
    if (!providerMetadata || typeof providerMetadata !== 'object') return null

    const openrouter = (providerMetadata as Record<string, unknown>).openrouter
    if (!openrouter || typeof openrouter !== 'object') return null

    const usage = (openrouter as Record<string, unknown>).usage
    if (!usage || typeof usage !== 'object') return null

    const { cost, completionTokensDetails } = usage as {
        cost?: unknown
        completionTokensDetails?: { reasoningTokens?: unknown }
    }

    if (typeof cost !== 'number' || !Number.isFinite(cost)) return null

    const reasoningTokens = completionTokensDetails?.reasoningTokens

    return {
        costUsd: cost,
        reasoningTokens:
            typeof reasoningTokens === 'number' ? reasoningTokens : 0,
    }
}

/**
 * Spreadable form of {@link readOpenRouterUsage} for result literals.
 *
 * Returns `{}` when the provider reported nothing, so the key is omitted
 * rather than set to `undefined`.
 *
 * @param providerMetadata - `result.providerMetadata` from any AI SDK call
 * @returns `{ costUsd }` or `{}`
 *
 * @example
 * ```typescript
 * return { agentName, score, modelId, ...readOpenRouterCost(result.providerMetadata) }
 * ```
 */
export function readOpenRouterCost(providerMetadata: unknown): {
    costUsd?: number
} {
    const usage = readOpenRouterUsage(providerMetadata)
    return usage ? { costUsd: usage.costUsd } : {}
}

/**
 * Sum the reported costs of several calls.
 *
 * Returns `undefined` when nothing reported a cost, so a phase that got no
 * usage back records nothing rather than a misleading `$0.00`.
 *
 * @param costs - Per-call costs, `undefined` where unreported
 * @returns The total in USD, or undefined
 */
export function sumCosts(
    costs: ReadonlyArray<number | undefined>
): number | undefined {
    const reported = costs.filter(
        (cost): cost is number => typeof cost === 'number'
    )
    return reported.length > 0
        ? reported.reduce((total, cost) => total + cost, 0)
        : undefined
}
