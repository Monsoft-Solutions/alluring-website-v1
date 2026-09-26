import { NextRequest } from 'next/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/env', () => ({
    env: { NEXT_PUBLIC_ALLOW_CRAWLING: 'false', LP_FORM_SPLIT: 'card:100' },
}))

const { middleware } = await import('@/middleware')

const LP = 'https://www.alluringplasticsurgery.com/lp/request-consultation'

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
        expect(response.cookies.get('lp_fv')).toBeUndefined()
        expect(response.headers.get('X-Robots-Tag')).toMatch(/noindex/)
    })

    it('still redirects trailing slashes first', () => {
        const response = middleware(new NextRequest(`${LP}/`))
        expect(response.status).toBe(308)
    })
})
