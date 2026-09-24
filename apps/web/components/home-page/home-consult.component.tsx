import { cn } from '@workspace/ui/lib/utils'

import { SiteConsultChat } from '@/components/shared/consult-chat/site-consult-chat.component'
import {
    SITE_CHAT_LEAD_KEY,
    SITE_CHAT_THANK_YOU_PATH,
} from '@/components/shared/consult-chat/site-chat.constants'
import { HOME_CHAT } from '@/components/shared/consult-chat/site-chat-copy'
import { getPhoneLink, siteConfig } from '@/lib/data/site-config'
import { CONTACT_SOURCES } from '@/lib/types/forms/contact-form.type'

import { HomeEyebrow } from './home-eyebrow.component'
import {
    HOME_CHAT_ID,
    HOME_SECTION_IDS,
    HOME_SECTION_INDEX,
    homeContainer,
    homeHeading,
    homeLead,
    homeLink,
} from './home-page.constant'

/**
 * What the thread promises, stated once beside it. Two in three of the
 * home page's leads arrive outside office hours (180 days to 2026-09-23),
 * so the first line tells an evening visitor that now is fine.
 */
const PROMISES = [
    {
        title: 'Nights and weekends are fine',
        body: 'Most requests reach us outside office hours. Send yours now; a patient coordinator texts you back within 24 hours.',
    },
    {
        title: 'In Miami or by video',
        body: 'Meet in person, or by video from anywhere in the U.S. before you plan a trip.',
    },
    {
        title: 'Your price in writing',
        body: 'Your quote and your dates come in writing after your free consultation.',
    },
] as const

/**
 * The conversion scene: the consultation thread (#274), the same one the
 * contact and specials pages use, three steps and one tap each for the
 * first two. Every CTA on the page jumps here; the hero chips and the
 * procedure picker also answer its first question on the way.
 */
export function HomeConsult() {
    return (
        <section
            id={HOME_SECTION_IDS.consult}
            aria-labelledby='consult-title'
            className='hp-dark hp-grain relative isolate overflow-hidden py-16 md:py-28'
        >
            <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-0 -z-10'
            >
                <div className='absolute -top-48 -right-40 size-[40rem] rounded-full bg-[radial-gradient(closest-side,rgba(230,203,159,0.2),transparent)]' />
                <div className='absolute -bottom-60 -left-40 size-[34rem] rounded-full bg-[radial-gradient(closest-side,rgba(234,219,205,0.1),transparent)]' />
            </div>

            <div
                className={cn(
                    homeContainer,
                    'grid items-start gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] lg:gap-20'
                )}
            >
                <div className='lg:sticky lg:top-32'>
                    <HomeEyebrow index={HOME_SECTION_INDEX.consult}>
                        Free consultation
                    </HomeEyebrow>
                    <h2 id='consult-title' className={cn(homeHeading, 'mt-5')}>
                        Start here. <em>It takes a minute.</em>
                    </h2>
                    <p
                        className={cn(
                            homeLead,
                            'mt-6 max-w-[32rem] text-[var(--hp-fg-2)]'
                        )}
                    >
                        Three quick answers, no phone call. Tell us what you’re
                        thinking about and we’ll text you to set up your free
                        consultation.
                    </p>

                    <ul className='mt-10 hidden border-t border-[var(--hp-rule)] lg:block'>
                        {PROMISES.map((promise, index) => (
                            <li
                                key={promise.title}
                                className='grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 border-b border-[var(--hp-rule)] py-5'
                            >
                                <span
                                    aria-hidden='true'
                                    className='hp-display pt-0.5 text-xl text-[var(--hp-champagne)] italic'
                                >
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <span>
                                    <strong className='block font-semibold text-[var(--hp-fg)]'>
                                        {promise.title}
                                    </strong>
                                    <span className='mt-1 block leading-relaxed text-[var(--hp-fg-3)]'>
                                        {promise.body}
                                    </span>
                                </span>
                            </li>
                        ))}
                    </ul>

                    <p className='mt-8 hidden text-[var(--hp-fg-3)] lg:block'>
                        Prefer to talk?{' '}
                        <a href={getPhoneLink()} className={homeLink}>
                            {siteConfig.contact.phoneDisplay}
                        </a>
                    </p>
                </div>

                <div>
                    <SiteConsultChat
                        id={HOME_CHAT_ID}
                        copy={HOME_CHAT.copy}
                        staff={HOME_CHAT.staff}
                        source={CONTACT_SOURCES.HOME_PAGE}
                        formName='home_chat'
                        thankYouPath={SITE_CHAT_THANK_YOU_PATH}
                        leadStorageKey={SITE_CHAT_LEAD_KEY}
                        subjectPrefix='Home page lead'
                        noteLines={['Page: / (home)']}
                    />

                    <ul className='mt-8 grid gap-4 lg:hidden'>
                        {PROMISES.map((promise) => (
                            <li
                                key={promise.title}
                                className='flex gap-3.5 text-[0.9375rem]'
                            >
                                <span
                                    aria-hidden='true'
                                    className='mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-[rgba(230,203,159,0.5)] text-xs text-[var(--hp-champagne)]'
                                >
                                    ✓
                                </span>
                                <span>
                                    <strong className='font-semibold text-[var(--hp-fg)]'>
                                        {promise.title}.
                                    </strong>{' '}
                                    <span className='text-[var(--hp-fg-3)]'>
                                        {promise.body}
                                    </span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    )
}
