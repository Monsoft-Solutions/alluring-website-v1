/**
 * GSC Retry Wrapper
 *
 * Exponential backoff for Search Console API calls. The GSC service layer
 * has no retry handling (confirmed in the epic #144 research); the snapshot
 * sync adds it here rather than trusting a bare paginated pull, because a
 * single 429/5xx mid-catch-up would otherwise fail the whole run.
 *
 * Only transient failures retry (429 and 5xx); anything else — bad request,
 * auth, quota-exceeded-for-the-day — rethrows immediately.
 *
 * @module @/lib/services/search-console/gsc-retry.util
 */

/** Backoff delays between attempts (attempt N waits RETRY_DELAYS_MS[N-1]). */
const RETRY_DELAYS_MS = [1_000, 4_000, 15_000]

/** Extract an HTTP status from a googleapis error shape, if present. */
function errorStatus(error: unknown): number | null {
    if (typeof error !== 'object' || error === null) return null
    const candidate = error as { code?: unknown; status?: unknown }
    const value = candidate.code ?? candidate.status
    return typeof value === 'number' ? value : null
}

/** Whether an error is worth retrying (rate limit or server-side). */
export function isTransientGscError(error: unknown): boolean {
    const status = errorStatus(error)
    return status === 429 || (status !== null && status >= 500)
}

/**
 * Run a GSC call with exponential backoff on transient errors.
 *
 * @param fn - The API call to protect
 * @param delaysMs - Override delays (tests pass short ones)
 */
export async function withGscRetry<T>(
    fn: () => Promise<T>,
    delaysMs: number[] = RETRY_DELAYS_MS
): Promise<T> {
    let lastError: unknown

    for (let attempt = 0; attempt <= delaysMs.length; attempt++) {
        try {
            return await fn()
        } catch (error) {
            lastError = error
            if (!isTransientGscError(error) || attempt === delaysMs.length) {
                throw error
            }
            await new Promise((resolve) =>
                setTimeout(resolve, delaysMs[attempt])
            )
        }
    }

    throw lastError
}
