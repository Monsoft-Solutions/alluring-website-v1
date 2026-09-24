import { cn } from '@workspace/ui/lib/utils'

import { homePageFaqs } from '@/lib/data/faq/home-page-faqs.data'

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
 * Straight answers to what visitors ask before they book. The same list is
 * the page's FAQPage schema (`app/page.tsx`), so the two stay in step.
 * Native `<details>`: no JavaScript, and every answer is in the HTML.
 */
export function HomeFaq() {
    return (
        <section
            id={HOME_SECTION_IDS.faq}
            aria-labelledby='faq-title'
            className='hp-defer bg-[var(--hp-linen)] py-16 md:py-28'
        >
            <div
                className={cn(
                    homeContainer,
                    'grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16'
                )}
            >
                <div className='lg:sticky lg:top-32 lg:self-start'>
                    <HomeEyebrow index={HOME_SECTION_INDEX.faq}>
                        Questions
                    </HomeEyebrow>
                    <h2 id='faq-title' className={cn(homeHeading, 'mt-5')}>
                        Before you <em>book.</em>
                    </h2>
                    <p className={cn(homeLead, 'mt-6 text-[var(--hp-fg-2)]')}>
                        Something else on your mind? Start the consultation
                        thread, and ask your coordinator when they text you
                        back.
                    </p>
                    <a
                        href={`#${HOME_CHAT_ID}`}
                        data-cta='home_faq_ask'
                        className={cn(homeLink, 'mt-6 inline-block')}
                    >
                        Ask us anything
                    </a>
                </div>

                <div className='hp-faq divide-y divide-[var(--hp-line)] border-y border-[var(--hp-line)]'>
                    {homePageFaqs.map((faq) => (
                        <details key={faq.question} className='group'>
                            <summary className='flex cursor-pointer items-start justify-between gap-6 py-6 text-left md:py-7'>
                                <h3 className='hp-display hp-display--small text-[1.3125rem] leading-[1.25] md:text-[1.5rem]'>
                                    {faq.question}
                                </h3>
                                <svg
                                    viewBox='0 0 24 24'
                                    aria-hidden='true'
                                    className='mt-1 size-7 shrink-0 rounded-full border border-[var(--hp-line)] p-1 text-[var(--hp-bronze)]'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='1.6'
                                    strokeLinecap='round'
                                >
                                    <path d='M5 12h14' />
                                    <path className='hp-plus-v' d='M12 5v14' />
                                </svg>
                            </summary>
                            <p className='pb-7 leading-relaxed text-[var(--hp-ink-2)] md:pr-14'>
                                {faq.answer}
                            </p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    )
}
