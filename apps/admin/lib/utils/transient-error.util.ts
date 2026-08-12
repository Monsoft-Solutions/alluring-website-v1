/**
 * Transient Provider Error Classifier
 *
 * Decides whether a pipeline phase failure looks like a transient provider
 * problem (rate limit, 5xx, network drop) that a single automatic re-run
 * has a real chance of clearing.
 *
 * Classification is message-based because provider errors reach the phase
 * runners as plain Error instances (fal.ai and the AI SDK don't expose
 * stable status fields by the time errors cross the runner boundary).
 * HTTP status codes are only matched next to status wording so that phase
 * messages containing bare numbers ("generated 502 words") never match.
 *
 * @module @admin/lib/utils/transient-error
 */

const TRANSIENT_PATTERNS: RegExp[] = [
    /rate.?limit/i,
    /too many requests/i,
    /quota exceeded/i,
    /status(?:\s*code)?[:\s]*(?:429|500|502|503|504)\b/i,
    /\b(?:429|500|502|503|504)\s+(?:too many|internal|bad|service|gateway)/i,
    /bad gateway/i,
    /service unavailable/i,
    /gateway time.?out/i,
    /timed?.?out/i,
    /ETIMEDOUT/,
    /ECONNRESET/,
    /ECONNREFUSED/,
    /EAI_AGAIN/,
    /socket hang up/i,
    /fetch failed/i,
    /network error/i,
    /overloaded/i,
    /internal server error/i,
]

const MAX_CAUSE_DEPTH = 5

/**
 * Collect the message of an error plus its `cause` chain (bounded)
 */
function errorMessages(error: unknown): string[] {
    const messages: string[] = []
    let current: unknown = error

    for (let depth = 0; depth < MAX_CAUSE_DEPTH; depth++) {
        if (typeof current === 'string') {
            messages.push(current)
            break
        }
        if (!(current instanceof Error)) break

        messages.push(current.message)
        current = current.cause
    }

    return messages
}

/**
 * Whether an error (or error message) looks transient enough that one
 * automatic re-run of the phase is worth it
 */
export function isTransientProviderError(error: unknown): boolean {
    return errorMessages(error).some((message) =>
        TRANSIENT_PATTERNS.some((pattern) => pattern.test(message))
    )
}
