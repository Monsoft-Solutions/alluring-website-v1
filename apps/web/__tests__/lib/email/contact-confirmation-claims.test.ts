/**
 * The confirmation email a lead receives says only what the claims canon
 * verifies (#354): no patient count, tenure or accreditation tile, no
 * "luxury", no plural surgeons, no promised response time, and financing
 * named with no figure.
 */
import { render } from '@react-email/render'
import { createElement } from 'react'
import { beforeAll, describe, expect, it } from 'vitest'

import { FINANCING_SENTENCE_LONG } from '@workspace/shared/claims/financing'
import { findClaimHits } from '@workspace/shared/claims/patterns'

import { generateProcedureTitle } from '@/lib/seo/generate-title.util'

const { ContactConfirmationEmail } = await import(
    '@/lib/email/templates/ContactConfirmation.template'
)

/** The visible text of the rendered email, links dropped. */
async function renderText(): Promise<string> {
    const plain = await render(
        createElement(ContactConfirmationEmail, {
            firstName: 'Ana',
            businessName: 'Alluring Plastic Surgery',
            businessEmail: 'info@alluringplasticsurgery.com',
        }),
        { plainText: true }
    )
    return plain
        .replace(/\[[^\]]*\]/g, ' ')
        .replace(/https?:\/\/\S+/g, ' ')
        .replace(/\s+/g, ' ')
}

describe('ContactConfirmationEmail claims', () => {
    let text = ''
    beforeAll(async () => {
        text = await renderText()
    })

    it('has no forbidden claim', () => {
        const fails = findClaimHits(text).filter(
            (hit) => hit.severity === 'fail'
        )
        expect(fails).toEqual([])
    })

    it('drops the retired trust tiles and the response-time promise', () => {
        expect(text).not.toMatch(/happy patients|years experience|accredited/i)
        expect(text).not.toMatch(/business day/i)
        expect(text).not.toMatch(/our surgeons|luxury/i)
    })

    it('names the financing partners with the approved sentence', () => {
        expect(text).toContain(FINANCING_SENTENCE_LONG)
    })

    it('states the board with the certification', () => {
        expect(text).toMatch(
            /board certified in general surgery, american board of surgery/i
        )
    })
})

describe('generateProcedureTitle', () => {
    it.each(['Breast Augmentation', 'Blepharoplasty (Eyelid Surgery)'])(
        'never says board-certified or names the surgeon: %s',
        (name) => {
            const title = generateProcedureTitle(name)
            expect(title).not.toMatch(/board[\s-]*certifi|karlinsky|surgeons/i)
            expect(findClaimHits(title, { scope: 'title' })).toEqual([])
        }
    )
})
