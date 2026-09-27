import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

const env = vi.hoisted(() => ({
    NEXT_PUBLIC_ALLOW_CRAWLING: 'false',
    LP_FORM_SPLIT: 'card:100' as string | undefined,
    LP_COPY_SPLIT: 'plain:100' as string | undefined,
}))
vi.mock('@/env', () => ({ env }))

const { middleware } = await import('@/middleware')

const LP = 'https://www.alluringplasticsurgery.com/lp/request-consultation'

const withCookie = (url: string, cookie: string) =>
    new NextRequest(url, { headers: { cookie } })

describe('middleware: the landing page form arm', () => {
    it('draws an arm, passes it to the page and keeps it in a cookie', () => {
        const response = middleware(new NextRequest(`${LP}?p=bbl`))
        expect(response.headers.get('x-middleware-request-x-lp-fv')).toBe(
            'card'
        )
        const cookie = response.cookies.get('lp_fv')
        expect(cookie?.value).toBe('card')
        expect(cookie?.path).toBe('/lp')
        expect(cookie?.maxAge).toBe(60 * 60 * 24 * 90)
    })

    it('honours ?fv= even for an arm the split has closed', () => {
        const response = middleware(new NextRequest(`${LP}?fv=thread`))
        expect(response.headers.get('x-middleware-request-x-lp-fv')).toBe(
            'thread'
        )
        expect(response.cookies.get('lp_fv')?.value).toBe('thread')
    })

    it('leaves every other page alone', () => {
        const response = middleware(
            new NextRequest('https://www.alluringplasticsurgery.com/bbl')
        )
        expect(response.headers.get('x-middleware-request-x-lp-fv')).toBeNull()
        expect(response.headers.get('x-middleware-request-x-lp-cv')).toBeNull()
        expect(response.cookies.get('lp_fv')).toBeUndefined()
        expect(response.cookies.get('lp_cv')).toBeUndefined()
        expect(response.headers.get('X-Robots-Tag')).toMatch(/noindex/)
    })

    it('still redirects trailing slashes first', () => {
        const response = middleware(new NextRequest(`${LP}/`))
        expect(response.status).toBe(308)
    })
})

describe('middleware: the last step’s wording arm (#302)', () => {
    afterEach(() => {
        env.LP_FORM_SPLIT = 'card:100'
        env.LP_COPY_SPLIT = 'plain:100'
        vi.restoreAllMocks()
    })

    it('sets both arms’ headers and cookies', () => {
        const response = middleware(new NextRequest(`${LP}?p=tummy-tuck`))
        expect(response.headers.get('x-middleware-request-x-lp-fv')).toBe(
            'card'
        )
        expect(response.headers.get('x-middleware-request-x-lp-cv')).toBe(
            'plain'
        )
        expect(response.cookies.get('lp_fv')?.value).toBe('card')
        const cookie = response.cookies.get('lp_cv')
        expect(cookie?.value).toBe('plain')
        expect(cookie?.path).toBe('/lp')
        expect(cookie?.maxAge).toBe(60 * 60 * 24 * 90)
    })

    it('lets ?cv=reassure win over the cookie, and keeps it', () => {
        const response = middleware(
            withCookie(`${LP}?cv=reassure`, 'lp_cv=plain; lp_fv=card')
        )
        expect(response.headers.get('x-middleware-request-x-lp-cv')).toBe(
            'reassure'
        )
        expect(response.cookies.get('lp_cv')?.value).toBe('reassure')
    })

    it('keeps a returning visitor’s arm while it is open', () => {
        env.LP_COPY_SPLIT = undefined
        const response = middleware(withCookie(LP, 'lp_cv=reassure'))
        expect(response.headers.get('x-middleware-request-x-lp-cv')).toBe(
            'reassure'
        )
    })

    it('redraws a cookie whose arm the split closed', () => {
        const response = middleware(withCookie(LP, 'lp_cv=reassure'))
        expect(response.headers.get('x-middleware-request-x-lp-cv')).toBe(
            'plain'
        )
        expect(response.cookies.get('lp_cv')?.value).toBe('plain')
    })

    it('draws the two arms with separate random numbers', () => {
        env.LP_FORM_SPLIT = undefined
        env.LP_COPY_SPLIT = undefined
        vi.spyOn(Math, 'random')
            .mockReturnValueOnce(0.1)
            .mockReturnValueOnce(0.9)
        const response = middleware(new NextRequest(LP))
        expect(response.headers.get('x-middleware-request-x-lp-fv')).toBe(
            'thread'
        )
        expect(response.headers.get('x-middleware-request-x-lp-cv')).toBe(
            'reassure'
        )
    })
})
