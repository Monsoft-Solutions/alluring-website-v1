/**
 * Google Ads API errors
 *
 * The REST API wraps the useful part of a failure (which GAQL clause was
 * wrong, which quota ran out) in a `GoogleAdsFailure` detail. Surfacing that
 * text instead of a bare "400 Bad Request" is what lets a caller fix its query.
 *
 * @module @workspace/google-ads — errors
 */

/** One entry from a GoogleAdsFailure detail. */
type FailureEntry = {
    errorCode?: Record<string, string>
    message?: string
}

/** The REST error envelope, as far as this module reads it. */
type ErrorEnvelope = {
    error?: {
        code?: number
        message?: string
        status?: string
        details?: {
            '@type'?: string
            errors?: FailureEntry[]
            requestId?: string
        }[]
    }
}

/** Error-code values that mean "try again shortly", not "your request is wrong". */
const TRANSIENT_CODES = new Set([
    'INTERNAL_ERROR',
    'TRANSIENT_ERROR',
    'DEADLINE_EXCEEDED',
    'RESOURCE_TEMPORARILY_EXHAUSTED',
])

/** A failed Google Ads API call, with the API's own explanation attached. */
export class GoogleAdsApiError extends Error {
    readonly httpStatus: number
    /** gRPC status name, e.g. INVALID_ARGUMENT. */
    readonly status?: string
    /** Error codes as `category:VALUE`, e.g. `queryError:PROHIBITED_FIELD_COMBINATION_IN_SELECT_CLAUSE`. */
    readonly codes: string[]
    readonly requestId?: string

    constructor(options: {
        httpStatus: number
        message: string
        status?: string
        codes?: string[]
        requestId?: string
    }) {
        super(options.message)
        this.name = 'GoogleAdsApiError'
        this.httpStatus = options.httpStatus
        this.status = options.status
        this.codes = options.codes ?? []
        this.requestId = options.requestId
    }
}

/**
 * Build a GoogleAdsApiError from a non-2xx response body.
 *
 * @param httpStatus - The response status code
 * @param body - The raw response text (JSON when the API produced it)
 */
export function parseGoogleAdsError(
    httpStatus: number,
    body: string
): GoogleAdsApiError {
    let envelope: ErrorEnvelope | undefined
    try {
        envelope = JSON.parse(body) as ErrorEnvelope
    } catch {
        // Not JSON — a proxy or HTML error page. Fall through with the raw text.
    }

    const error = envelope?.error
    const failure = error?.details?.find((detail) =>
        detail['@type']?.endsWith('GoogleAdsFailure')
    )
    const entries = failure?.errors ?? []

    const codes = entries.flatMap((entry) =>
        Object.entries(entry.errorCode ?? {}).map(
            ([category, value]) => `${category}:${value}`
        )
    )
    const detailMessages = entries
        .map((entry) => entry.message)
        .filter((message): message is string => Boolean(message))

    const summary =
        detailMessages.length > 0
            ? detailMessages.join(' | ')
            : (error?.message ?? body.slice(0, 300))

    const codeSuffix = codes.length > 0 ? ` [${codes.join(', ')}]` : ''

    return new GoogleAdsApiError({
        httpStatus,
        message: `Google Ads API ${httpStatus}: ${summary}${codeSuffix}`,
        status: error?.status,
        codes,
        requestId: failure?.requestId,
    })
}

/**
 * Whether a failure is worth retrying.
 *
 * 5xx and temporary quota pressure retry. A 429 for the *daily* operation
 * quota does not — retrying only burns time until tomorrow.
 */
export function isTransientGoogleAdsError(error: unknown): boolean {
    if (!(error instanceof GoogleAdsApiError)) return false
    if (error.httpStatus >= 500) return true
    if (error.status === 'UNAVAILABLE' || error.status === 'DEADLINE_EXCEEDED')
        return true
    return error.codes.some((code) =>
        TRANSIENT_CODES.has(code.split(':')[1] ?? '')
    )
}

/** Backoff delays between attempts (attempt N waits RETRY_DELAYS_MS[N-1]). */
const RETRY_DELAYS_MS = [1_000, 4_000, 15_000]

/**
 * Run a Google Ads call with exponential backoff on transient failures.
 *
 * @param fn - The API call to protect
 * @param delaysMs - Override delays (tests pass short ones)
 */
export async function withGoogleAdsRetry<T>(
    fn: () => Promise<T>,
    delaysMs: number[] = RETRY_DELAYS_MS
): Promise<T> {
    for (let attempt = 0; ; attempt++) {
        try {
            return await fn()
        } catch (error) {
            if (
                !isTransientGoogleAdsError(error) ||
                attempt >= delaysMs.length
            ) {
                throw error
            }
            await new Promise((resolve) =>
                setTimeout(resolve, delaysMs[attempt])
            )
        }
    }
}
