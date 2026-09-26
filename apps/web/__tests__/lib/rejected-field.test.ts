import { describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push() {} }) }))

const { rejectedField } = await import('@/hooks/useContactFormSubmission.hook')

describe('rejectedField', () => {
    it('reads the field the API blamed', () => {
        expect(
            rejectedField(
                JSON.stringify({
                    success: false,
                    message: 'Validation failed',
                    error: 'phone: Please enter a valid US phone number',
                })
            )
        ).toBe('phone')
    })

    it.each([
        [undefined],
        [''],
        ['<html>'],
        [JSON.stringify({ error: 'Something went wrong' })],
        [JSON.stringify({ message: 'x' })],
    ])('returns null for %s', (body) => {
        expect(rejectedField(body)).toBeNull()
    })
})
