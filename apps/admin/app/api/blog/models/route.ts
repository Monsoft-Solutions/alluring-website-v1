/**
 * Blog Model Catalog Route
 *
 * Serves the OpenRouter model catalog to the Blog AI Settings picker. The
 * form fetches this once on mount and shares one catalog across every phase
 * combobox, which keeps ~400 model records out of the page's RSC payload.
 *
 * @module app/api/blog/models/route
 */
import { NextResponse } from 'next/server'

import { getOpenRouterCatalog } from '@/lib/services/openrouter-catalog.service'
import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'

export const runtime = 'nodejs'

/**
 * GET /api/blog/models
 *
 * Returns every non-`:batch` model OpenRouter serves. `isFallback: true` means
 * the live fetch failed and this is the checked-in snapshot — the client
 * renders a warning rather than treating it as authoritative.
 */
export async function GET() {
    try {
        await requireAuth()

        const { models, isFallback } = await getOpenRouterCatalog()

        return NextResponse.json({ success: true, models, isFallback })
    } catch (error) {
        return handleApiError(error, 'Failed to load the OpenRouter catalog')
    }
}
