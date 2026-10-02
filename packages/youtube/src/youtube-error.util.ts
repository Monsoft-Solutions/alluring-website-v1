/**
 * YouTube API errors
 *
 * The Data API explains a failure in `error.errors[0].reason`
 * (`quotaExceeded`, `uploadLimitExceeded`, `forbidden`, …). Keeping that
 * reason on the error is what lets a caller tell "try again later" from
 * "this will never work".
 *
 * @module @workspace/youtube — errors
 */

/** The REST error envelope, as far as this module reads it. */
type ErrorEnvelope = {
    error?:
        | {
              code?: number
              message?: string
              status?: string
              errors?: { reason?: string; message?: string }[]
          }
        | string
    error_description?: string
}

/** Reasons that mean "try again shortly", not "your request is wrong". */
const TRANSIENT_REASONS = new Set([
    'backendError',
    'internalError',
    'rateLimitExceeded',
    'userRateLimitExceeded',
])

/** A failed YouTube Data API call, with the API's own explanation attached. */
export class YouTubeApiError extends Error {
    readonly httpStatus: number
    /** First `errors[].reason`, e.g. `quotaExceeded`. */
    readonly reason?: string

    constructor(options: {
        httpStatus: number
        message: string
        reason?: string
    }) {
        super(options.message)
        this.name = 'YouTubeApiError'
        this.httpStatus = options.httpStatus
        this.reason = options.reason
    }
}

/**
 * Google refused the stored refresh token (`invalid_grant`): the password
 * changed, the manager role was removed, or someone revoked access. Only a
 * new Connect fixes it.
 */
export class YouTubeAuthRevokedError extends Error {
    constructor(message = 'Google revoked the YouTube connection') {
        super(message)
        this.name = 'YouTubeAuthRevokedError'
    }
}

/** The OAuth client or encryption key is missing from the environment. */
export class YouTubeNotConfiguredError extends Error {
    constructor(missing: string[]) {
        super(`YouTube is not configured. Missing: ${missing.join(', ')}`)
        this.name = 'YouTubeNotConfiguredError'
    }
}

/** Build a YouTubeApiError from a failed response's status and body text. */
export function parseYouTubeError(
    httpStatus: number,
    bodyText: string
): YouTubeApiError {
    let envelope: ErrorEnvelope = {}
    try {
        envelope = JSON.parse(bodyText) as ErrorEnvelope
    } catch {
        // Not JSON (an HTML error page, an empty body): fall through.
    }

    const error = envelope.error
    if (typeof error === 'string') {
        // OAuth endpoints answer { error: 'invalid_grant', error_description }.
        return new YouTubeApiError({
            httpStatus,
            reason: error,
            message: envelope.error_description
                ? `${error}: ${envelope.error_description}`
                : error,
        })
    }

    const reason = error?.errors?.[0]?.reason
    const message =
        error?.message ||
        error?.errors?.[0]?.message ||
        bodyText.slice(0, 300) ||
        `HTTP ${httpStatus}`

    return new YouTubeApiError({
        httpStatus,
        reason,
        message: reason ? `${reason}: ${message}` : message,
    })
}

/** True when retrying the same request later may succeed. */
export function isTransientYouTubeError(error: unknown): boolean {
    if (!(error instanceof YouTubeApiError)) return false
    if (error.httpStatus >= 500 || error.httpStatus === 429) return true
    return error.reason !== undefined && TRANSIENT_REASONS.has(error.reason)
}
