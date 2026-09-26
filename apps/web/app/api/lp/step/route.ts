/**
 * POST /api/lp/step — one answer from the ads landing page's form (#292),
 * logged to `lp_form_step`: which chip, which timeline, which arm, which ad
 * group. Sent with `navigator.sendBeacon`, so nobody waits on it.
 *
 * Only closed sets and slugs are accepted (`lpFormStepPayloadSchema`), and
 * only from the page itself. Nothing about the visitor is stored: no IP, no
 * user agent, no GA id. A failure here is logged and otherwise ignored — it
 * can never affect the form.
 *
 * @module app/api/lp/step/route
 */
import { type NextRequest, NextResponse } from 'next/server'

import { db } from '@workspace/db/client'
import { lpFormStep } from '@workspace/db/schema/analytics'

import { lpFormStepPayloadSchema } from '@/lib/types/analytics/lp-form-step.type'

/** Beacons from the page itself only: same host in Origin or Referer. */
function fromThisSite(request: NextRequest): boolean {
    const host = request.nextUrl.host
    for (const header of ['origin', 'referer']) {
        const value = request.headers.get(header)
        if (!value) continue
        try {
            if (new URL(value).host === host) return true
        } catch {
            // Not a URL; try the other header.
        }
    }
    return false
}

const NO_CONTENT = () => new NextResponse(null, { status: 204 })

export async function POST(request: NextRequest) {
    if (!fromThisSite(request)) {
        return new NextResponse(null, { status: 403 })
    }

    let body: unknown
    try {
        // sendBeacon posts a Blob; read it as text whatever its type says.
        body = JSON.parse(await request.text())
    } catch {
        return new NextResponse(null, { status: 400 })
    }

    const parsed = lpFormStepPayloadSchema.safeParse(body)
    if (!parsed.success) {
        return new NextResponse(null, { status: 400 })
    }

    const step = parsed.data
    try {
        await db.insert(lpFormStep).values({
            tabKey: step.tab,
            pageVariant: step.page,
            formVariant: step.form,
            adVariant: step.ad,
            section: step.section,
            language: step.lang,
            step: step.step,
            answer: step.answer,
            entryPoint: step.entry,
        })
    } catch (error) {
        console.error('[lp-step] insert failed:', error)
    }
    return NO_CONTENT()
}
