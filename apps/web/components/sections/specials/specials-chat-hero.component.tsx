/**
 * Specials hero (#274): the live offer as a headline, and the consultation
 * thread on the first screen.
 *
 * 97% of this page's visitors are on a phone, most of them arriving from an
 * influencer's bio link. The old hero spent the first screen on a 238px
 * creative and an urgency bar, and put the form 1.8 screens down. Here the
 * offer is text (read from the active promotion, so it changes with it) and
 * the first question sits above the fold.
 */

import { SiteConsultChat } from '@/components/shared/consult-chat/site-consult-chat.component'
import {
    SITE_CHAT_LEAD_KEY,
    SITE_CHAT_THANK_YOU_PATH,
} from '@/components/shared/consult-chat/site-chat.constants'
import { SPECIALS_CHAT } from '@/components/shared/consult-chat/site-chat-copy'
import { LEAD_PAGE_CHAT_IDS } from '@/lib/constants/standalone-routes'
import { CONTACT_SOURCES } from '@/lib/types/forms/contact-form.type'

export const SPECIALS_CHAT_ID =
    LEAD_PAGE_CHAT_IDS['/miami-plastic-surgery-specials']

export interface SpecialsOffer {
    readonly title: string
    /** e.g. "September Sign & Save" — the part of the title before the dash. */
    readonly name: string
    /** e.g. "Up to 20% Off" — the part after it, or the whole title. */
    readonly headline: string
    /** "September 30", in Miami time; null for an open-ended promotion. */
    readonly endsOn: string | null
    /** The same date in Spanish ("30 de septiembre"), for the thread. */
    readonly endsOnEs: string | null
    readonly slug: string
}

export function SpecialsChatHero({
    offer,
    monthYear,
}: {
    readonly offer: SpecialsOffer | null
    readonly monthYear: string
}) {
    const intro = offer
        ? {
              en: (
                  <li
                      key='offer'
                      className='cc-bubble cc-bubble--them cc-bubble--offer'
                  >
                      <p>
                          <strong>{offer.title}</strong>
                          {offer.endsOn && (
                              <small>
                                  Ends {offer.endsOn}. Your coordinator confirms
                                  how it applies to your plan.
                              </small>
                          )}
                      </p>
                  </li>
              ),
              es: (
                  <li
                      key='offer'
                      className='cc-bubble cc-bubble--them cc-bubble--offer'
                  >
                      <p>
                          <strong>{offer.title}</strong>
                          {offer.endsOnEs && (
                              <small>
                                  Termina el {offer.endsOnEs}. Tu coordinadora
                                  confirma cómo aplica a tu plan.
                              </small>
                          )}
                      </p>
                  </li>
              ),
          }
        : undefined

    return (
        <section
            id='specials-hero'
            aria-labelledby='specials-hero-title'
            className='relative overflow-hidden bg-stone-900 px-4 pt-28 pb-12 sm:pt-32 lg:pt-40 lg:pb-20'
        >
            <div
                className='pointer-events-none absolute inset-0'
                aria-hidden='true'
            >
                <div className='absolute inset-0 bg-linear-to-br from-stone-900 via-stone-800 to-stone-900' />
                <div className='bg-gold-600/10 absolute -top-[20%] right-0 h-[600px] w-[600px] rounded-full blur-3xl' />
            </div>

            <div className='relative mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-[1fr_minmax(0,480px)] lg:gap-14'>
                <div className='lg:pt-6'>
                    <h1 id='specials-hero-title' className='text-balance'>
                        <span className='text-gold-400 block text-[11px] font-bold tracking-[0.18em] uppercase'>
                            Miami plastic surgery specials · {monthYear}
                        </span>
                        <span className='mt-3 block font-serif text-[2rem] leading-[1.08] text-stone-50 sm:text-5xl lg:text-6xl'>
                            {offer ? (
                                <>
                                    {offer.headline}
                                    {offer.name !== offer.headline && (
                                        <em className='text-gold-400 mt-1 block text-[0.62em] not-italic sm:italic'>
                                            {offer.name}
                                        </em>
                                    )}
                                </>
                            ) : (
                                <>
                                    Your free consultation,{' '}
                                    <em className='text-gold-400'>
                                        your price in writing
                                    </em>
                                </>
                            )}
                        </span>
                    </h1>
                    {/* Four in five visitors are outside Florida. */}
                    <p className='mt-3 text-sm text-stone-300 sm:hidden'>
                        Video consultations from anywhere in the U.S.
                    </p>
                    <p className='mt-4 hidden max-w-xl text-base leading-relaxed text-stone-300 sm:block sm:text-lg'>
                        {offer?.endsOn
                            ? `The offer ends ${offer.endsOn}. Answer three quick questions and a patient coordinator texts you within 24 hours — in person in Miami, or by video from anywhere in the U.S.`
                            : 'Answer three quick questions and a patient coordinator texts you within 24 hours to book your free consultation — in person in Miami, or by video from anywhere in the U.S.'}
                    </p>
                    <ul className='mt-5 hidden flex-wrap gap-x-5 gap-y-2 text-sm text-stone-400 lg:flex'>
                        <li>✓ Free consultation</li>
                        <li>✓ 4.7★ on Google</li>
                        <li>✓ Financing available</li>
                        <li>✓ Hablamos español</li>
                    </ul>
                </div>

                <div>
                    <SiteConsultChat
                        id={SPECIALS_CHAT_ID}
                        copy={SPECIALS_CHAT.copy}
                        staff={SPECIALS_CHAT.staff}
                        source={CONTACT_SOURCES.SPECIALS_PAGE}
                        formName='specials_chat'
                        thankYouPath={SITE_CHAT_THANK_YOU_PATH}
                        leadStorageKey={SITE_CHAT_LEAD_KEY}
                        subjectPrefix='Specials lead'
                        noteLines={[
                            'Page: /miami-plastic-surgery-specials',
                            `Offer: ${offer?.title ?? 'none active'}`,
                        ]}
                        offer={offer?.title}
                        intro={intro}
                    />
                    <p className='mt-3 text-center text-xs text-stone-400 lg:hidden'>
                        Free consultation · 4.7★ on Google · Hablamos español
                    </p>
                </div>
            </div>
        </section>
    )
}
