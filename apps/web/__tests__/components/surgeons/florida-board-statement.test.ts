import { describe, expect, it } from 'vitest'

import { FLORIDA_UNAPPROVED_BOARD_STATEMENT } from '@workspace/shared/claims/surgeon'

import {
    needsFloridaStatement,
    withFloridaStatement,
} from '@/components/surgeons/florida-board-statement'

describe('withFloridaStatement (claims canon §2, #354)', () => {
    it('adds the statement to a mention of the cosmetic boards', () => {
        for (const text of [
            'Board Certified, American Board of Cosmetic Surgery',
            'American Board of Facial Cosmetic Surgery',
            'Certified by the ABCS',
        ]) {
            const out = withFloridaStatement(text)
            expect(out).toContain(FLORIDA_UNAPPROVED_BOARD_STATEMENT)
            expect(out.startsWith(text)).toBe(true)
        }
    })

    it('leaves the American Board of Surgery and FACS alone', () => {
        for (const text of [
            'Board Certified, American Board of Surgery',
            'Fellow, American College of Surgeons (FACS)',
        ]) {
            expect(needsFloridaStatement(text)).toBe(false)
            expect(withFloridaStatement(text)).toBe(text)
        }
    })

    it('never adds the statement twice', () => {
        const once = withFloridaStatement('American Board of Cosmetic Surgery')
        expect(withFloridaStatement(once)).toBe(once)
    })
})
