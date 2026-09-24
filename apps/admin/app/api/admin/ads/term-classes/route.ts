import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { adsTermClassName } from '@workspace/db/schema/ads'

import {
    deleteTermClass,
    getTermClasses,
    upsertTermClass,
} from '@/lib/queries/ads/ads-keywords.query'
import { handleApiError } from '@/lib/utils/api-error-handler.util'
import { requireAuth } from '@/lib/utils/auth.util'

export const runtime = 'nodejs'

const upsertSchema = z.object({
    pattern: z.string().trim().min(2).max(80),
    termClass: z.enum(adsTermClassName.enumValues),
})

const deleteSchema = z.object({ id: z.string().uuid() })

/**
 * GET /api/admin/ads/term-classes
 * The brand / competitor / procedure / address pattern list.
 */
export async function GET() {
    try {
        await requireAuth()
        return NextResponse.json({
            success: true,
            data: await getTermClasses(),
        })
    } catch (error) {
        return handleApiError(
            error,
            'Failed to load term classes',
            'Error loading term classes:'
        )
    }
}

/**
 * POST /api/admin/ads/term-classes  { pattern, termClass }
 * Add a pattern, or move an existing one to another class.
 */
export async function POST(request: NextRequest) {
    try {
        await requireAuth()
        const parsed = upsertSchema.safeParse(await request.json())
        if (!parsed.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid term class',
                    details: parsed.error.issues,
                },
                { status: 400 }
            )
        }
        const entry = await upsertTermClass(
            parsed.data.pattern,
            parsed.data.termClass
        )
        return NextResponse.json({ success: true, data: entry })
    } catch (error) {
        return handleApiError(
            error,
            'Failed to save term class',
            'Error saving term class:'
        )
    }
}

/**
 * DELETE /api/admin/ads/term-classes  { id }
 */
export async function DELETE(request: NextRequest) {
    try {
        await requireAuth()
        const parsed = deleteSchema.safeParse(await request.json())
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: 'Invalid id' },
                { status: 400 }
            )
        }
        const deleted = await deleteTermClass(parsed.data.id)
        return NextResponse.json(
            { success: deleted },
            { status: deleted ? 200 : 404 }
        )
    } catch (error) {
        return handleApiError(
            error,
            'Failed to delete term class',
            'Error deleting term class:'
        )
    }
}
