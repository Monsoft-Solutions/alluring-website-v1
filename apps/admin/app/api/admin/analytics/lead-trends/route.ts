import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'
import { getClassifiedLeadsInRange } from '@/lib/queries/lead-trends.query'
import type { LeadTrendsResponse } from '@/lib/types/analytics/lead-trends.type'

const MAX_RANGE_DAYS = 366
const DAY_MS = 86_400_000

const querySchema = z
    .object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
    })
    .refine(
        (q) => new Date(q.endDate).getTime() >= new Date(q.startDate).getTime(),
        { message: 'endDate must be on or after startDate' }
    )
    .refine(
        (q) => {
            const days =
                (new Date(q.endDate).getTime() -
                    new Date(q.startDate).getTime()) /
                DAY_MS
            return days <= MAX_RANGE_DAYS
        },
        { message: `Range may not exceed ${MAX_RANGE_DAYS} days` }
    )

export async function GET(request: NextRequest) {
    try {
        await requireAuth()

        const url = new URL(request.url)
        const parsed = querySchema.safeParse({
            startDate: url.searchParams.get('startDate'),
            endDate: url.searchParams.get('endDate'),
        })
        if (!parsed.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid query parameters',
                    details: parsed.error.issues,
                },
                { status: 400 }
            )
        }

        const startDate = new Date(parsed.data.startDate)
        const endDate = new Date(parsed.data.endDate)
        const leads = await getClassifiedLeadsInRange(startDate, endDate)

        const body: LeadTrendsResponse = {
            leads,
            totalCount: leads.length,
            rangeStart: startDate.toISOString(),
            rangeEnd: endDate.toISOString(),
        }
        return NextResponse.json(body)
    } catch (error) {
        return handleApiError(
            error,
            'Failed to fetch lead trends',
            'Error fetching lead trends:'
        )
    }
}
