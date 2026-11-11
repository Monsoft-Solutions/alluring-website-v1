/**
 * GET /lp/request-consultation/photos?p=<view>&hl=<en|es>
 *
 * The before-and-after photos a view keeps behind its tap-to-view card,
 * fetched by the card after the visitor taps "Show photos"
 * (`lp-photo-gate.component.tsx`). Returns `{ photos: [] }` for an unknown
 * view or language, and for a view whose card `LP_PHOTO_GATE_OFF` turns off.
 *
 * `p` must be a view's exact name: the page resolves aliases before it
 * renders the card, and the card sends the resolved name.
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
    LP_COPY,
    toLpLang,
} from '@/components/landing-pages/request-consultation/lp-copy'
import {
    gatedPhotosFor,
    parsePhotoGateOff,
} from '@/components/landing-pages/request-consultation/lp-gated-photos'
import {
    AD_VARIANTS,
    type AdVariant,
} from '@/components/landing-pages/request-consultation/lp-variants'
import { env } from '@/env'

export interface LpGatedPhotoResponse {
    readonly photos: readonly {
        readonly id: string
        readonly src: string
        readonly procedure: string
        readonly stacked?: boolean
        readonly alt: string
        readonly caption: string
    }[]
}

const HEADERS = {
    'X-Robots-Tag': 'noindex, nofollow',
    'Cache-Control': 'no-store',
} as const

function isView(value: string | null): value is AdVariant {
    return AD_VARIANTS.includes(value as AdVariant)
}

export function GET(request: NextRequest) {
    const params = request.nextUrl.searchParams
    const view = params.get('p')
    const lang = toLpLang(params.get('hl'))

    if (!isView(view) || !lang) {
        return NextResponse.json<LpGatedPhotoResponse>(
            { photos: [] },
            { headers: HEADERS }
        )
    }

    const copy = LP_COPY[lang].results
    const off = parsePhotoGateOff(env.LP_PHOTO_GATE_OFF)
    const photos = gatedPhotosFor(view, off).map((photo) => {
        const caption = copy.captions[photo.procedure]
        return {
            ...photo,
            alt: copy.photoAlts[photo.id] ?? caption?.alt ?? '',
            caption: caption?.caption ?? '',
        }
    })

    return NextResponse.json<LpGatedPhotoResponse>(
        { photos },
        { headers: HEADERS }
    )
}
