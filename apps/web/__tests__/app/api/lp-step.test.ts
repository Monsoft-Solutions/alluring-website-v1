import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const values = vi.fn()
vi.mock('@workspace/db/client', () => ({
    db: { insert: () => ({ values }) },
}))
vi.mock('@workspace/db/schema/analytics', () => ({ lpFormStep: {} }))

const { POST } = await import('@/app/api/lp/step/route')

const URL_ = 'http://localhost:3148/api/lp/step'
const valid = {
    tab: 'a1b2c3d4e5f6a7b8',
    page: 'ads-consultation-v6',
    form: 'card',
    ad: 'tummy-tuck',
    section: null,
    lang: 'en',
    step: 'procedure',
    answer: 'tummy-tuck',
    entry: 'hero',
}

const post = (body: unknown, origin = 'http://localhost:3148') =>
    POST(
        new NextRequest(URL_, {
            method: 'POST',
            body: typeof body === 'string' ? body : JSON.stringify(body),
            headers: { origin },
        })
    )

describe('POST /api/lp/step', () => {
    beforeEach(() => values.mockReset())

    it('stores a valid answer and returns 204', async () => {
        const response = await post(valid)
        expect(response.status).toBe(204)
        expect(values).toHaveBeenCalledWith({
            tabKey: valid.tab,
            pageVariant: valid.page,
            formVariant: 'card',
            adVariant: 'tummy-tuck',
            section: null,
            language: 'en',
            step: 'procedure',
            answer: 'tummy-tuck',
            entryPoint: 'hero',
        })
    })

    it('refuses another site', async () => {
        const response = await post(valid, 'https://example.com')
        expect(response.status).toBe(403)
        expect(values).not.toHaveBeenCalled()
    })

    it.each([
        ['free text answer', { ...valid, answer: 'my phone is 305' }],
        ['unknown arm', { ...valid, form: 'chat' }],
        ['unknown step', { ...valid, step: 'contact' }],
        ['bad tab key', { ...valid, tab: 'x' }],
        ['extra identifying field kept out', { ...valid, entry: 'email' }],
    ])('rejects a %s', async (_, body) => {
        const response = await post(body)
        expect(response.status).toBe(400)
        expect(values).not.toHaveBeenCalled()
    })

    it('rejects a body that is not JSON', async () => {
        expect((await post('nope')).status).toBe(400)
    })

    it('still answers 204 when the insert fails', async () => {
        values.mockRejectedValueOnce(new Error('db down'))
        const error = vi.spyOn(console, 'error').mockImplementation(() => {})
        expect((await post(valid)).status).toBe(204)
        error.mockRestore()
    })
})
