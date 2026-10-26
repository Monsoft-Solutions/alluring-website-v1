import { describe, expect, it } from 'vitest'

import { findTypedPrices } from '@workspace/shared/claims/typed-prices'

const { CONTACT_CHAT, HOME_CHAT, SPECIALS_CHAT } = await import(
    '@/components/shared/consult-chat/site-chat-copy'
)

const decks = { CONTACT_CHAT, HOME_CHAT, SPECIALS_CHAT }

describe('site consultation thread copy (claims canon, #354)', () => {
    for (const [name, chat] of Object.entries(decks)) {
        for (const [lang, copy] of Object.entries(chat.copy)) {
            it(`${name} ${lang}: names no reply time (§9)`, () => {
                const text = JSON.stringify(copy)
                expect(text).not.toMatch(/24\s*(?:hours|horas)|24hr/i)
            })

            it(`${name} ${lang}: a priced reply carries the confirm caveat (§5)`, () => {
                const priced = copy.procedureReply?.priced ?? ''
                expect(priced).toContain('{price}')
                expect(priced).toMatch(/confirm/i)
                expect(priced).toMatch(/consult/i)
            })

            it(`${name} ${lang}: types no Alluring price`, () => {
                const text = JSON.stringify(copy)
                expect(findTypedPrices(text)).toEqual([])
            })
        }
    }
})
