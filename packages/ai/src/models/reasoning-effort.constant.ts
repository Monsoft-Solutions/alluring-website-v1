/**
 * Reasoning Effort
 *
 * How hard a model should think before answering. The vocabulary is
 * OpenRouter's own, verbatim — every model call goes through OpenRouter
 * (issue #195), and OpenRouter translates effort to each vendor's native knob
 * server-side. For Anthropic models it derives the thinking budget itself
 * (`budget_tokens = max(min(max_tokens × ratio, 128000), 1024)`), so there is
 * no per-family mapping table to keep in sync here.
 *
 * @module @workspace/ai/models/reasoning-effort
 */

/**
 * The supported effort levels, ordered from least to most thinking.
 *
 * The provider's own union is unordered; this order is load-bearing for the
 * settings UI, which renders the select and the cost ramp straight from it.
 */
export const REASONING_EFFORTS = [
    'none',
    'minimal',
    'low',
    'medium',
    'high',
    'xhigh',
] as const

/**
 * How hard a model should think. Mirrors
 * `OpenRouterProviderOptions['reasoning']['effort']`.
 */
export type ReasoningEffort = (typeof REASONING_EFFORTS)[number]

/**
 * The effort every phase ships at.
 *
 * `none` is deliberately the default everywhere: it emits no provider option
 * at all, so each model keeps whatever thinking behaviour it has today.
 */
export const DEFAULT_REASONING_EFFORT: ReasoningEffort = 'none'

/**
 * Narrow an unknown value — a database column, a form field — to a valid
 * effort.
 *
 * @param value - The value to check
 * @returns True when the value is one of {@link REASONING_EFFORTS}
 */
export function isReasoningEffort(value: unknown): value is ReasoningEffort {
    return (
        typeof value === 'string' &&
        (REASONING_EFFORTS as readonly string[]).includes(value)
    )
}
