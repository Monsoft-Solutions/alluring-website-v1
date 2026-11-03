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
    BMI_CHAT_ID,
    bmiBody,
    bmiContainer,
    bmiEyebrow,
    bmiHeading,
    bmiLink,
} from './bmi-page.constant'

const WHAT_HAPPENS = [
    'Pick your procedure and when you’re hoping to have it.',
    'A patient coordinator texts you to set up your consultation.',
    'Your surgeon looks at your whole health and tells you exactly what applies to you, including the way to your range if you’re above it.',
] as const

/**
 * The page's one form: the consultation thread the home, contact and blog
 * pages use. Every "ask what applies to you" link on the page jumps here,
 * and the procedure links answer its first question on the way.
 *
 * Leads keep the page's own source (`bmi-calculator`), so they report as
 * they did from the old form.
 */
export function BmiConsult() {
    return (
        <div className='bg-stone-100'>
            <section
                aria-labelledby='bmi-consult-title'
                className={cn(
                    bmiContainer,
                    'grid items-start gap-10 py-16 md:py-24 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:gap-20'
                )}
            >
                <div className='lg:sticky lg:top-36'>
                    <p className={cn(bmiEyebrow, 'text-gold-700')}>
                        Your next step
                    </p>
                    <h2
                        id='bmi-consult-title'
                        className={cn(bmiHeading, 'mt-4 text-stone-900')}
                    >
                        Ask what applies to <em>you</em>
                    </h2>
                    <p className={cn(bmiBody, 'mt-5 max-w-[32rem]')}>
                        A range on a page can&apos;t see your health, your
                        history or your goals. Tell us your procedure, and
                        we&apos;ll tell you exactly what applies to you.
                    </p>
                    <ol className='mt-8 flex max-w-[32rem] flex-col gap-4'>
                        {WHAT_HAPPENS.map((step, index) => (
                            <li
                                key={step}
                                className='grid grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-x-3.5'
                            >
                                <span
                                    aria-hidden='true'
                                    className='border-gold-500 flex size-9 items-center justify-center rounded-full border font-serif text-stone-900 italic'
                                >
                                    {['i', 'ii', 'iii'][index]}
                                </span>
                                <p className='pt-1.5 text-[1rem] leading-[1.55] text-stone-800'>
                                    {step}
                                </p>
                            </li>
                        ))}
                    </ol>
                    <p
                        data-copy-check='data'
                        className='mt-8 text-[0.9375rem] text-stone-600'
                    >
                        Prefer to talk?{' '}
                        <a href={getPhoneLink()} className={bmiLink}>
                            {siteConfig.contact.phoneDisplay}
                        </a>
                    </p>
                </div>

                <div data-copy-check='data'>
                    <SiteConsultChat
                        id={BMI_CHAT_ID}
                        copy={HOME_CHAT.copy}
                        staff={HOME_CHAT.staff}
                        source={CONTACT_SOURCES.BMI_CALCULATOR}
                        formName='bmi_chat'
                        thankYouPath={SITE_CHAT_THANK_YOU_PATH}
                        leadStorageKey={SITE_CHAT_LEAD_KEY}
                        subjectPrefix='BMI calculator lead'
                        noteLines={['Page: /bmi-calculator']}
                    />
                </div>
            </section>
        </div>
    )
}
