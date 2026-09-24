/**
 * Contact hero (#274): the consultation thread next to the phone number,
 * the address and the hours.
 *
 * A quarter of this page's visitors are on desktop (against 2% on
 * specials), so it gets a real two-column layout; on a phone the thread
 * comes first and call / directions sit right under it. The old hero put a
 * six-field form under four lines of headline and three rows of badges.
 */

import {
    ReachUsCard,
    QuickReachRow,
} from '@/components/sections/lead-page/reach-us-card.component'
import { SurgeonCredentialCard } from '@/components/sections/lead-page/surgeon-credential-card.component'
import { SiteConsultChat } from '@/components/shared/consult-chat/site-consult-chat.component'
import {
    SITE_CHAT_LEAD_KEY,
    SITE_CHAT_THANK_YOU_PATH,
} from '@/components/shared/consult-chat/site-chat.constants'
import { CONTACT_CHAT } from '@/components/shared/consult-chat/site-chat-copy'
import { LEAD_PAGE_CHAT_IDS } from '@/lib/constants/standalone-routes'
import { CONTACT_SOURCES } from '@/lib/types/forms/contact-form.type'

export const CONTACT_CHAT_ID = LEAD_PAGE_CHAT_IDS['/contact-us']

export function ContactChatHero() {
    return (
        <section
            id='contact-hero'
            aria-labelledby='contact-hero-title'
            className='relative overflow-hidden bg-stone-900 px-4 pt-28 pb-12 sm:pt-32 lg:pt-40 lg:pb-20'
        >
            <div
                className='pointer-events-none absolute inset-0'
                aria-hidden='true'
            >
                <div className='absolute inset-0 bg-linear-to-br from-stone-900 via-stone-800 to-stone-900' />
                <div className='bg-gold-600/10 absolute -top-[20%] -right-[15%] h-[700px] w-[700px] rounded-full blur-3xl' />
            </div>

            <div className='relative mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12'>
                <div>
                    <p className='text-gold-400 text-[11px] font-bold tracking-[0.18em] uppercase'>
                        Free consultation · Miami
                    </p>
                    <h1
                        id='contact-hero-title'
                        className='mt-3 font-serif text-[2rem] leading-[1.08] text-balance text-stone-50 sm:text-5xl'
                    >
                        Tell us what you’re{' '}
                        <em className='text-gold-400'>thinking about</em>
                    </h1>
                    {/* Most visitors are outside Florida. */}
                    <p className='mt-3 text-sm text-stone-300 sm:hidden'>
                        In person in Miami, or by video from anywhere in the
                        U.S.
                    </p>
                    <p className='mt-4 hidden max-w-lg text-base leading-relaxed text-stone-300 sm:block sm:text-lg'>
                        Three quick answers and a patient coordinator texts you
                        back within 24 hours — in person in Miami, or by video
                        from anywhere in the U.S.
                    </p>

                    <div className='mt-6'>
                        <SiteConsultChat
                            id={CONTACT_CHAT_ID}
                            copy={CONTACT_CHAT.copy}
                            staff={CONTACT_CHAT.staff}
                            source={CONTACT_SOURCES.CONTACT_PAGE}
                            formName='contact_chat'
                            thankYouPath={SITE_CHAT_THANK_YOU_PATH}
                            leadStorageKey={SITE_CHAT_LEAD_KEY}
                            subjectPrefix='Contact page lead'
                            noteLines={['Page: /contact-us']}
                        />
                    </div>

                    <QuickReachRow className='mt-3 lg:hidden' />
                </div>

                <div className='grid gap-3 lg:pt-24'>
                    <ReachUsCard />
                    <SurgeonCredentialCard tone='dark' headingLevel='h2' />
                </div>
            </div>
        </section>
    )
}
