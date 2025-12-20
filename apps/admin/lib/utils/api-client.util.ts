/**
 * Type-safe API client for admin dashboard.
 *
 * Provides consistent error handling, type inference,
 * and response parsing for all API calls.
 */

/**
 * Custom error class for API errors with status code
 */
export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public details?: unknown
    ) {
        super(message)
        this.name = 'ApiError'
    }
}

/**
 * API response wrapper type
 */
export type ApiResponse<T> = {
    success: true
    data: T
}

export type ApiErrorResponse = {
    success: false
    error: string
    details?: unknown
}

/**
 * Options for API fetch calls
 */
type FetchOptions = {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    body?: unknown
    headers?: Record<string, string>
    cache?: RequestCache
    next?: NextFetchRequestConfig
}

type NextFetchRequestConfig = {
    revalidate?: number | false
    tags?: string[]
}

/**
 * Type-safe fetch wrapper for admin API calls.
 *
 * @param endpoint - API endpoint path (e.g., '/api/admin/stats')
 * @param options - Fetch options
 * @returns Parsed JSON response of type T
 * @throws ApiError for non-2xx responses
 *
 * @example
 * ```ts
 * const stats = await fetchApi<DashboardStats>('/api/admin/stats')
 * ```
 */
export async function fetchApi<T>(
    endpoint: string,
    options: FetchOptions = {}
): Promise<T> {
    const { method = 'GET', body, headers = {}, cache, next } = options

    const config: RequestInit & { next?: NextFetchRequestConfig } = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        credentials: 'include', // Include cookies for auth
    }

    if (body) {
        config.body = JSON.stringify(body)
    }

    if (cache) {
        config.cache = cache
    }

    if (next) {
        config.next = next
    }

    const response = await fetch(endpoint, config)

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
        if (!response.ok) {
            throw new ApiError(
                `Request failed: ${response.statusText}`,
                response.status
            )
        }
        // Return empty object for non-JSON success responses
        return {} as T
    }

    const data: unknown = await response.json()

    if (!response.ok) {
        // Handle structured error responses
        if (data && typeof data === 'object' && 'error' in data) {
            const errorData = data as { error: string; details?: unknown }
            throw new ApiError(
                errorData.error,
                response.status,
                errorData.details
            )
        }
        throw new ApiError(
            `Request failed: ${response.statusText}`,
            response.status
        )
    }

    return data as T
}

/**
 * Build query string from params object.
 * Filters out undefined and null values.
 *
 * @example
 * ```ts
 * const url = buildUrl('/api/admin/analytics/pageviews', { days: 30, limit: 10 })
 * // Returns: '/api/admin/analytics/pageviews?days=30&limit=10'
 * ```
 */
export function buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined | null>
): string {
    if (!params) return endpoint

    const searchParams = new URLSearchParams()

    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
            searchParams.set(key, String(value))
        }
    }

    const queryString = searchParams.toString()
    return queryString ? `${endpoint}?${queryString}` : endpoint
}
