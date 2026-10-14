import { describe, expect, it } from 'vitest'

import { CONTACT_SOURCES } from '@/lib/types/forms/contact-form.type'
import { validateBySource } from '@/lib/utils/validate-contact-by-source.util'

const base = { name: 'Ana Test', phone: undefined }

describe('validateBySource', () => {
    it('knows the Dr. Karlinsky Instagram source', () => {
        expect(CONTACT_SOURCES.DR_KARLINSKY_IG).toBe('dr-karlinsky-ig')
    })

    it('requires a phone for dr-karlinsky-ig, even with an email', () => {
        expect(
            validateBySource({
                ...base,
                source: 'dr-karlinsky-ig',
                email: 'ana@example.com',
            })
        ).toEqual({ valid: false, error: 'Phone number is required' })
    })

    it('accepts dr-karlinsky-ig with a phone', () => {
        expect(
            validateBySource({
                ...base,
                source: 'dr-karlinsky-ig',
                phone: '+13055550123',
            })
        ).toEqual({ valid: true })
    })

    it('keeps the general rule for other sources', () => {
        expect(validateBySource({ ...base, email: 'ana@example.com' })).toEqual(
            { valid: true }
        )
        expect(validateBySource({ ...base }).valid).toBe(false)
    })
})
