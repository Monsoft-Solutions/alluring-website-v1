/**
 * OpenRouter Catalog Hook
 *
 * Loads the model catalog once and shares it across every phase combobox on
 * the Blog AI Settings page — seven pickers, one request (epic #194).
 *
 * @module hooks/use-openrouter-catalog
 */
'use client'

import { useEffect, useMemo, useState } from 'react'

import type { OpenRouterCatalogModel } from '@workspace/ai/models/openrouter-catalog'

/** What the settings form needs to know about the catalog. */
export type OpenRouterCatalogState = {
    models: readonly OpenRouterCatalogModel[]
    /** Look up a configured id without scanning the array per render */
    byId: ReadonlyMap<string, OpenRouterCatalogModel>
    isLoading: boolean
    /**
     * True when the server served the checked-in snapshot instead of a live
     * pull, or when the request failed outright. Either way the picker works —
     * it just is not authoritative, and says so.
     */
    isStale: boolean
}

/**
 * Fetch `/api/blog/models` once on mount.
 *
 * Never throws and never leaves the picker empty: a failed request degrades to
 * an empty catalog with `isStale`, and the combobox still accepts a typed id.
 */
export function useOpenRouterCatalog(): OpenRouterCatalogState {
    const [models, setModels] = useState<readonly OpenRouterCatalogModel[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isStale, setIsStale] = useState(false)

    useEffect(() => {
        const controller = new AbortController()

        async function load() {
            try {
                const response = await fetch('/api/blog/models', {
                    signal: controller.signal,
                })
                if (!response.ok) throw new Error(String(response.status))

                const payload = (await response.json()) as {
                    models?: OpenRouterCatalogModel[]
                    isFallback?: boolean
                }

                setModels(payload.models ?? [])
                setIsStale(payload.isFallback === true)
            } catch (error) {
                if (controller.signal.aborted) return
                console.error(
                    '[useOpenRouterCatalog] Could not load the model catalog:',
                    error
                )
                setIsStale(true)
            } finally {
                if (!controller.signal.aborted) setIsLoading(false)
            }
        }

        void load()
        return () => controller.abort()
    }, [])

    const byId = useMemo(
        () => new Map(models.map((model) => [model.id, model])),
        [models]
    )

    return { models, byId, isLoading, isStale }
}
