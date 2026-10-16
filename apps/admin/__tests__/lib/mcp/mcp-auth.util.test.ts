/**
 * MCP bearer auth (issue #343): fails closed when unset, 401 with a
 * WWW-Authenticate challenge on a missing or wrong token.
 */
import { describe, expect, it } from 'vitest'

import { safeEqual, verifyMcpRequest } from '@/lib/mcp/mcp-auth.util'

const SECRET = 'a'.repeat(64)

function request(authorization?: string) {
    return new Request('https://admin.example.com/api/mcp', {
        method: 'POST',
        headers: authorization ? { authorization } : {},
    })
}

describe('verifyMcpRequest', () => {
    it('answers 503 when the token is not configured', () => {
        expect(
            verifyMcpRequest(request(`Bearer ${SECRET}`), undefined)?.status
        ).toBe(503)
    })

    it('answers 401 with a Bearer challenge when the header is missing', () => {
        const response = verifyMcpRequest(request(), SECRET)
        expect(response?.status).toBe(401)
        expect(response?.headers.get('WWW-Authenticate')).toMatch(/^Bearer/)
    })

    it('answers 401 for a wrong token or another scheme', () => {
        expect(verifyMcpRequest(request('Bearer nope'), SECRET)?.status).toBe(
            401
        )
        expect(
            verifyMcpRequest(request(`Basic ${SECRET}`), SECRET)?.status
        ).toBe(401)
    })

    it('lets the right token through', () => {
        expect(verifyMcpRequest(request(`Bearer ${SECRET}`), SECRET)).toBeNull()
    })
})

describe('safeEqual', () => {
    it('compares exactly, including length', () => {
        expect(safeEqual('abc', 'abc')).toBe(true)
        expect(safeEqual('abc', 'abd')).toBe(false)
        expect(safeEqual('abc', 'abc\0')).toBe(false)
        expect(safeEqual('', 'abc')).toBe(false)
    })
})
