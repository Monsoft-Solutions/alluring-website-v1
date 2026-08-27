/**
 * OpenRouter Catalog Service
 *
 * Server-side access to the live OpenRouter model catalog, cached across
 * requests and backed by a checked-in snapshot so the Blog AI Settings picker
 * is never empty (epic #194).
 *
 * @module @/lib/services/openrouter-catalog
 */
import { unstable_cache } from 'next/cache'

import { OPENROUTER_CATALOG_FALLBACK } from '@workspace/ai/data/openrouter-catalog-fallback.data'
import {
    fetchOpenRouterCatalog,
    type OpenRouterCatalogModel,
} from '@workspace/ai/models/openrouter-catalog'

/**
 * Cache tag for the catalog.
 *
 * Nothing calls `revalidateTag` on it today — the 12-hour window plus the
 * "type any vendor/model id" escape hatch covers a newly released model, and a
 * failed fetch is no longer cached (see below), so there is nothing to unstick
 * by hand. Exported so a future admin control can bust it.
 */
export const OPENROUTER_CATALOG_TAG = 'openrouter-catalog'

/**
 * How long a successful catalog pull is reused. OpenRouter adds models
 * regularly but not hourly; twelve hours keeps the picker current without
 * putting a network call in front of every settings visit.
 */
const CATALOG_REVALIDATE_SECONDS = 43_200

/**
 * What the settings page renders, plus whether it is looking at live data.
 */
export type OpenRouterCatalogResult = {
    models: readonly OpenRouterCatalogModel[]
    /**
     * True when `models` is the checked-in snapshot rather than a live pull.
     * The settings page surfaces this as a non-blocking warning — a stale
     * picker is fine, a silently stale picker is not.
     */
    isFallback: boolean
}

/**
 * Cache the *live* catalog only.
 *
 * This deliberately throws rather than returning the fallback: `unstable_cache`
 * does not cache a rejected promise, so a transient OpenRouter blip is retried
 * on the next request. Catching inside would cache the failure under the same
 * key for the full 12 hours and pin the picker to the checked-in snapshot long
 * after OpenRouter recovered.
 */
const loadLiveCatalog = unstable_cache(
    fetchOpenRouterCatalog,
    ['openrouter-catalog'],
    { tags: [OPENROUTER_CATALOG_TAG], revalidate: CATALOG_REVALIDATE_SECONDS }
)

/**
 * Every non-`:batch` model OpenRouter serves, sorted vendor then name.
 *
 * Never throws: an OpenRouter outage must not 500 the settings page or empty
 * the picker (acceptance criterion 4). It degrades to the checked-in snapshot
 * and says so.
 *
 * @returns The catalog plus a flag saying whether it came from the snapshot
 */
export async function getOpenRouterCatalog(): Promise<OpenRouterCatalogResult> {
    try {
        return { models: await loadLiveCatalog(), isFallback: false }
    } catch (error) {
        console.error(
            '[OpenRouter Catalog] Live fetch failed; serving the checked-in snapshot:',
            error
        )
        return { models: OPENROUTER_CATALOG_FALLBACK, isFallback: true }
    }
}
