import { cn } from '@workspace/ui/lib/utils'

import { SiteConsultChat } from '@/components/shared/consult-chat/site-consult-chat.component'
import {
    SITE_CHAT_LEAD_KEY,
    SITE_CHAT_THANK_YOU_PATH,
} from '@/components/shared/consult-chat/site-chat.constants'
import { HOME_CHAT } from '@/components/shared/consult-chat/site-chat-copy'
import { getPhoneLink, siteConfig } from '@/lib/data/site-config'
import { CONTACT_SOURCES } from '@/lib/types/forms/contact-form.type'

import {
    HOME_CHAT_ID,
    HOME_SECTION_IDS,
    homeContainer,
    homeHeading,
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
            className='relative isolate overflow-hidden bg-stone-950 py-16 text-stone-100 md:py-28'
        >
            <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-0 -z-10'
            >
                <div className='absolute -top-40 -right-40 size-[38rem] rounded-full bg-[radial-gradient(closest-side,rgba(212,175,55,0.22),transparent)]' />
                <div className='absolute -bottom-56 -left-40 size-[34rem] rounded-full bg-[radial-gradient(closest-side,rgba(233,196,170,0.12),transparent)]' />
            </div>

            <div
                className={cn(
                    homeContainer,
                    'grid items-start gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] lg:gap-16'
                )}
            >
                <div className='lg:sticky lg:top-32'>
                    <p className='text-gold-300 text-[0.75rem] font-bold tracking-[0.2em] uppercase'>
                        Free consultation
                    </p>
                    <h2
                        id='consult-title'
                        className={cn(homeHeading, 'mt-4 text-stone-50')}
                    >
                        Start here.{' '}
                        <em className='text-gold-300 italic'>
                            It takes a minute.
                        </em>
                    </h2>
                    <p className='mt-5 max-w-[32rem] text-lg leading-relaxed text-stone-300'>
                        Three quick answers, no phone call. Tell us what you’re
                        thinking about and we’ll text you to set up your free
                        consultation.
                    </p>

                    <ul className='mt-8 hidden gap-5 lg:grid'>
                        {PROMISES.map((promise) => (
                            <li key={promise.title} className='flex gap-4'>
                                <span
                                    aria-hidden='true'
                                    className='border-gold-400/50 text-gold-300 mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border text-sm'
                                >
                                    ✓
                                </span>
                                <span>
                                    <strong className='block text-stone-50'>
                                        {promise.title}
                                    </strong>
                                    <span className='text-stone-400'>
                                        {promise.body}
                                    </span>
                                </span>
                            </li>
                        ))}
                    </ul>

                    <p className='mt-8 hidden text-stone-400 lg:block'>
                        Prefer to talk?{' '}
                        <a
                            href={getPhoneLink()}
                            className='decoration-gold-400 font-bold text-stone-50 underline underline-offset-4'
                        >
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
                                    className='border-gold-400/50 text-gold-300 mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border text-xs'
                                >
                                    ✓
                                </span>
                                <span>
                                    <strong className='text-stone-50'>
                                        {promise.title}.
                                    </strong>{' '}
                                    <span className='text-stone-400'>
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
