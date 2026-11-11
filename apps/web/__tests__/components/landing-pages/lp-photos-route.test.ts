import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const env = vi.hoisted(() => ({
    LP_PHOTO_GATE_OFF: undefined as string | undefined,
}))
vi.mock('@/env', () => ({ env }))

const { GET } = await import('@/app/lp/request-consultation/photos/route')
const { LP_OPEN_PHOTOS } = await import(
    '@/components/landing-pages/request-consultation/lp-assets'
)
const { gatedPhotosFor } = await import(
    '@/components/landing-pages/request-consultation/lp-gated-photos'
)
const { AD_VARIANTS } = await import(
    '@/components/landing-pages/request-consultation/lp-variants'
)

interface Body {
    photos: { id: string; src: string; alt: string; caption: string }[]
}

async function get(query: string): Promise<{ response: Response; body: Body }> {
    const response = GET(
        new NextRequest(
            `http://localhost:3000/lp/request-consultation/photos${query}`
        )
    )
    return { response, body: (await response.json()) as Body }
}

describe('GET /lp/request-consultation/photos', () => {
    beforeEach(() => {
        env.LP_PHOTO_GATE_OFF = undefined
    })

    it.each(AD_VARIANTS)(
        'returns the photos behind the card for %s',
        async (view) => {
            const { response, body } = await get(`?p=${view}&hl=en`)
            expect(response.status).toBe(200)
            expect(body.photos.map((photo) => photo.src)).toEqual(
                gatedPhotosFor(view, new Set()).map((photo) => photo.src)
            )
            const open = new Set(LP_OPEN_PHOTOS[view].map((photo) => photo.src))
            for (const photo of body.photos) {
                expect(open.has(photo.src)).toBe(false)
                expect(photo.alt).toBeTruthy()
            }
        }
    )

    it('labels the photos in the language asked for', async () => {
        const en = (await get('?p=bbl&hl=en')).body.photos
        const es = (await get('?p=bbl&hl=es')).body.photos
        expect(en.map((photo) => photo.src)).toEqual(
            es.map((photo) => photo.src)
        )
        expect(en[0]?.alt).toMatch(/^Before and after/)
        expect(es[0]?.alt).toMatch(/^Antes y después/)
    })

    it('marks the response noindex', async () => {
        const { response } = await get('?p=default&hl=en')
        expect(response.headers.get('X-Robots-Tag')).toContain('noindex')
    })

    it.each([
        ['an unknown view', '?p=nope&hl=en'],
        ['an alias rather than a view', '?p=lipo&hl=en'],
        ['no view', '?hl=en'],
        ['an unknown language', '?p=default&hl=fr'],
        ['no language', '?p=default'],
    ])('returns no photos for %s', async (_, query) => {
        const { response, body } = await get(query)
        expect(response.status).toBe(200)
        expect(response.headers.get('X-Robots-Tag')).toContain('noindex')
        expect(body.photos).toEqual([])
    })

    it('returns no photos for a view whose card is off', async () => {
        env.LP_PHOTO_GATE_OFF = 'liposuction,tummy-tuck'
        expect((await get('?p=liposuction&hl=en')).body.photos).toEqual([])
        expect((await get('?p=tummy-tuck&hl=es')).body.photos).toEqual([])
        expect(
            (await get('?p=bbl&hl=en')).body.photos.map((photo) => photo.id)
        ).toEqual(['01', '06'])
    })
})
