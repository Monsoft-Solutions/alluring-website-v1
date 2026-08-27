/**
 * Reasoning Provider Options
 *
 * Turns a {@link ReasoningEffort} into the provider options fragment the
 * OpenRouter provider reads. Spread into any AI SDK call.
 *
 * @module @workspace/ai/models/reasoning
 */
import type { ReasoningEffort } from './reasoning-effort.constant'

/**
 * Build the provider options fragment for a reasoning effort.
 *
 * **`none` and `undefined` emit nothing at all**, and that is the whole point.
 * `none` is a value OpenRouter accepts, but sending it explicitly *disables*
 * reasoning on models that think by default — a behaviour change. Emitting no
 * key leaves every model's thinking exactly where it was before this option
 * existed, which is what lets the per-phase effort settings ship inert.
 *
 * Scoped to the reasoning option specifically: `getModel` separately turns on
 * OpenRouter usage accounting, so request bodies do carry a `usage` key that
 * they did not before. That funds the per-phase cost readout and changes no
 * inference behaviour.
 *
 * @param effort - The configured effort, or undefined when a caller passes none
 * @returns A spreadable fragment: `{}` or `{ providerOptions: … }`
 *
 * @example
 * ```typescript
 * const result = await generateText({
 *     model: getModel(modelId),
 *     prompt,
 *     ...reasoningProviderOptions(effort),
 * })
 * ```
 */
export function reasoningProviderOptions(effort?: ReasoningEffort) {
    return !effort || effort === 'none'
        ? {}
        : { providerOptions: { openrouter: { reasoning: { effort } } } }
}
