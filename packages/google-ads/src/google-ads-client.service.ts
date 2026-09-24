/**
 * Google Ads REST client
 *
 * Read-only by construction: the only endpoints called are GAQL search and
 * the field-metadata search. There is no mutate path in this package, and the
 * service account is a Read only user on the account besides.
 *
 * @module @workspace/google-ads — client
 */
import { JWT } from 'google-auth-library'

import { getGoogleAdsConfig } from './google-ads-config.util.js'
import {
    parseGoogleAdsError,
    withGoogleAdsRetry,
} from './google-ads-error.util.js'
import { flattenRow } from './google-ads-rows.util.js'
import type {
    GaqlSearchOptions,
    GaqlSearchResult,
    GoogleAdsConfig,
    RawRow,
} from './google-ads.type.js'

const API_HOST = 'https://googleads.googleapis.com'
const ADWORDS_SCOPE = 'https://www.googleapis.com/auth/adwords'

/** Upper bound on rows gathered across pages when the caller sets none. */
export const DEFAULT_MAX_ROWS = 10_000

/** API requests made by this process — each one is a billed operation. */
let operationCount = 0

/**
 * Requests sent to the API since the process started. Read it before and
 * after a job to know what the job spent against the daily quota.
 */
export function getOperationCount(): number {
    return operationCount
}

/** One JWT client per service account; it caches and refreshes its own token. */
const jwtClients = new Map<string, JWT>()

function jwtFor(config: GoogleAdsConfig): JWT {
    let client = jwtClients.get(config.clientEmail)
    if (!client) {
        client = new JWT({
            email: config.clientEmail,
            key: config.privateKey,
            scopes: [ADWORDS_SCOPE],
        })
        jwtClients.set(config.clientEmail, client)
    }
    return client
}

async function authHeaders(
    config: GoogleAdsConfig
): Promise<Record<string, string>> {
    const { token } = await jwtFor(config).getAccessToken()
    if (!token) throw new Error('Google Ads: service account returned no token')

    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(config.loginCustomerId
            ? { 'login-customer-id': config.loginCustomerId }
            : {}),
    }
}

/**
 * POST a JSON body to a Google Ads REST path, with retry on transient errors.
 *
 * @param path - Path after the version segment, e.g. `customers/123/googleAds:search`
 * @param body - Request body
 */
async function post<T>(
    config: GoogleAdsConfig,
    path: string,
    body: unknown
): Promise<T> {
    return withGoogleAdsRetry(async () => {
        operationCount += 1
        const response = await fetch(
            `${API_HOST}/${config.apiVersion}/${path}`,
            {
                method: 'POST',
                headers: await authHeaders(config),
                body: JSON.stringify(body),
            }
        )
        const text = await response.text()
        if (!response.ok) throw parseGoogleAdsError(response.status, text)
        return JSON.parse(text) as T
    })
}

type SearchPage = {
    results?: RawRow[]
    nextPageToken?: string
    fieldMask?: string
}

/** Raw rows plus the field mask needed to flatten them. */
export type RawSearchResult = {
    rows: RawRow[]
    fieldMask?: string
    truncated: boolean
}

/**
 * Run a GAQL query and return the rows exactly as the API sent them, following
 * pagination until the result or `maxRows` ends. Use `searchGaql` unless you
 * need a nested message (e.g. a change event's old and new resource) intact.
 *
 * The API pages at 10,000 rows; each page is one billed operation against the
 * daily quota.
 *
 * @param query - A GAQL SELECT statement
 * @param options - Account override and row cap
 */
export async function searchGaqlRaw(
    query: string,
    options: GaqlSearchOptions = {}
): Promise<RawSearchResult> {
    const config = getGoogleAdsConfig()
    const customerId = options.customerId ?? config.customerId
    const maxRows = options.maxRows ?? DEFAULT_MAX_ROWS

    const rows: RawRow[] = []
    let fieldMask: string | undefined
    let pageToken: string | undefined

    do {
        const page = await post<SearchPage>(
            config,
            `customers/${customerId}/googleAds:search`,
            { query, ...(pageToken ? { pageToken } : {}) }
        )
        fieldMask ??= page.fieldMask
        for (const row of page.results ?? []) {
            if (rows.length >= maxRows) {
                return { rows, fieldMask, truncated: true }
            }
            rows.push(row)
        }
        pageToken = page.nextPageToken
    } while (pageToken)

    return { rows, fieldMask, truncated: false }
}

/**
 * Run a GAQL query, with rows flattened to GAQL field names and money in
 * account currency (see `flattenRow`).
 *
 * @param query - A GAQL SELECT statement
 * @param options - Account override and row cap
 */
export async function searchGaql(
    query: string,
    options: GaqlSearchOptions = {}
): Promise<GaqlSearchResult> {
    const { rows, fieldMask, truncated } = await searchGaqlRaw(query, options)
    return {
        rows: rows.map((row) => flattenRow(row, fieldMask)),
        truncated,
    }
}

/** Metadata for one GAQL field. */
export type GoogleAdsFieldInfo = {
    name: string
    category: string
    dataType: string
    selectable: boolean
    filterable: boolean
    sortable: boolean
    isRepeated: boolean
    enumValues?: string[]
}

type FieldSearchPage = {
    results?: {
        name?: string
        category?: string
        dataType?: string
        selectable?: boolean
        filterable?: boolean
        sortable?: boolean
        isRepeated?: boolean
        enumValues?: string[]
    }[]
    nextPageToken?: string
}

/**
 * Look up GAQL field metadata — which fields exist under a prefix, their types,
 * enum values, and whether they can be selected, filtered or sorted.
 *
 * @param namePattern - A LIKE pattern, e.g. `search_term_view.%`
 */
export async function searchGoogleAdsFields(
    namePattern: string
): Promise<GoogleAdsFieldInfo[]> {
    const config = getGoogleAdsConfig()
    const escaped = namePattern.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
    const query =
        'SELECT name, category, data_type, selectable, filterable, sortable, ' +
        `is_repeated, enum_values WHERE name LIKE '${escaped}'`

    const fields: GoogleAdsFieldInfo[] = []
    let pageToken: string | undefined
    do {
        const page = await post<FieldSearchPage>(
            config,
            'googleAdsFields:search',
            { query, pageSize: 1000, ...(pageToken ? { pageToken } : {}) }
        )
        for (const field of page.results ?? []) {
            fields.push({
                name: field.name ?? '',
                category: field.category ?? '',
                dataType: field.dataType ?? '',
                selectable: field.selectable ?? false,
                filterable: field.filterable ?? false,
                sortable: field.sortable ?? false,
                isRepeated: field.isRepeated ?? false,
                ...(field.enumValues?.length
                    ? { enumValues: field.enumValues }
                    : {}),
            })
        }
        pageToken = page.nextPageToken
    } while (pageToken)

    return fields
}
