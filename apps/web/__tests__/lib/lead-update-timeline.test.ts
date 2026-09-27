import { describe, expect, it } from 'vitest'

import { CHAT_TIMELINES } from '@/components/shared/consult-chat/site-chat-copy'
import { LEAD_TIMELINES } from '@/lib/constants/lead-fields'
import { leadUpdateSchema } from '@/lib/types/forms/contact-form.type'

const lead = { id: '6f1c2b1e-4a7d-4c1e-9d3a-2b5e8f0a1c2d', token: 't' }

describe('the thank-you page’s timeline answer (#307)', () => {
    it('offers the same values the thread asks with, in both languages', () => {
        for (const lang of ['en', 'es'] as const) {
            expect(CHAT_TIMELINES[lang].map((option) => option.value)).toEqual([
                ...LEAD_TIMELINES,
            ])
        }
    })

    it('saves a timeline on its own', () => {
        expect(
            leadUpdateSchema.parse({ ...lead, timeline: '1-3-months' })
        ).toMatchObject({ timeline: '1-3-months' })
    })

    it('rejects a timeline the form never offers', () => {
        expect(() =>
            leadUpdateSchema.parse({ ...lead, timeline: 'next-year' })
        ).toThrow()
    })

    it('still refuses an update with nothing in it', () => {
        expect(() => leadUpdateSchema.parse(lead)).toThrow()
    })
})
