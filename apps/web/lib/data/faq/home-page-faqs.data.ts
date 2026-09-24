/**
 * The home page's questions and answers: shown on the page and published as
 * its FAQPage schema, so the two can never disagree.
 *
 * Every figure comes from a procedure facts file, and the surgeon's
 * credentials from the shared constant. The questions are the ones the home
 * page's visitors ask before they book: price, who operates, how it works
 * from another state, and whether a Miami BBL is safe.
 *
 * @module
 */

import { bblFigure } from '@/lib/data/procedures/facts/bbl.facts'
import { lipoFigure } from '@/lib/data/procedures/facts/lipo.facts'
import { siteConfig } from '@/lib/data/site-config'
import {
    KARLINSKY_CREDENTIALS,
    KARLINSKY_NAME,
} from '@/lib/data/surgeons/karlinsky-credentials.constant'
import type { FaqItem } from '@/lib/types/shared/faq.type'

export const homePageFaqs: readonly FaqItem[] = [
    {
        question: 'How much does plastic surgery cost at Alluring?',
        answer: `A BBL at Alluring starts at ${bblFigure('price-starting-at')}, and most patients pay ${bblFigure('price-most-patients')}. Lipo 360 starts at ${lipoFigure('price-starting-at')}. Tummy tuck, mommy makeover, breast and face procedures are priced for each patient, and you get your price in writing after a free consultation. Your price depends on the areas treated, your anatomy and whether procedures are combined. Financing is available, subject to credit approval.`,
    },
    {
        question: 'Who performs the surgery?',
        answer: `Every procedure at Alluring is performed by ${KARLINSKY_NAME}. ${KARLINSKY_CREDENTIALS}`,
    },
    {
        question: 'I live in another state. How does it work?',
        answer: `Start with a free video consultation from home. When you decide to go ahead, we confirm your surgery, pre-op and follow-up dates in writing and tell you how many nights to stay in Miami; for a BBL, plan on ${bblFigure('stay-in-miami-7-10-days')} so you can be seen at follow-up and cleared before you fly. You arrange your own flights and lodging: we don't book travel, hotels or recovery houses.`,
    },
    {
        question: 'Is a BBL in Miami safe?',
        answer: 'Florida has specific rules for BBL surgery. The surgeon must use ultrasound guidance, may place fat only in the layer under the skin and not into the muscle, must stay with one patient for the whole procedure, and must examine you in person no later than the day before surgery. Ask any practice you are considering how it follows each of them.',
    },
    {
        question: 'Is the consultation free?',
        answer: 'Yes. Your consultation is free, in person in Miami or by video from anywhere in the U.S., and there is no obligation to book.',
    },
    {
        question: 'How do I get started?',
        answer: `Answer three quick questions in the consultation form on this page, or call ${siteConfig.contact.phoneDisplay}. A patient coordinator texts you back within 24 hours to set up your free consultation.`,
    },
    {
        question: '¿Hablan español?',
        answer: 'Sí. Our team speaks English and Spanish, and consultations are available in both languages.',
    },
]
