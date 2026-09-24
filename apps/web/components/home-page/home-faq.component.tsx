import { cn } from '@workspace/ui/lib/utils'

import { homePageFaqs } from '@/lib/data/faq/home-page-faqs.data'

import {
    HOME_CHAT_ID,
    HOME_SECTION_IDS,
    homeContainer,
    homeEyebrow,
    homeHeading,
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
            className='hp-defer bg-white py-16 md:py-28'
        >
            <div
                className={cn(
                    homeContainer,
                    'grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16'
                )}
            >
                <div className='lg:sticky lg:top-32 lg:self-start'>
                    <p className={homeEyebrow}>Questions</p>
                    <h2
                        id='faq-title'
                        className={cn(homeHeading, 'mt-4 text-stone-950')}
                    >
                        Before you{' '}
                        <em className='text-[#8a6c12] italic'>book.</em>
                    </h2>
                    <p className='mt-5 text-lg leading-relaxed text-stone-600'>
                        Something else on your mind? Start the consultation
                        thread, and ask your coordinator when they text you
                        back.
                    </p>
                    <a
                        href={`#${HOME_CHAT_ID}`}
                        data-cta='home_faq_ask'
                        className={cn(
                            homeLink,
                            'mt-5 inline-block text-stone-900'
                        )}
                    >
                        Ask us anything
                    </a>
                </div>

                <div className='hp-faq divide-y divide-stone-200 border-y border-stone-200'>
                    {homePageFaqs.map((faq) => (
                        <details key={faq.question} className='group'>
                            <summary className='flex cursor-pointer items-start justify-between gap-6 py-6 text-left'>
                                <h3 className='font-serif text-xl leading-snug text-stone-950 md:text-[1.4rem]'>
                                    {faq.question}
                                </h3>
                                <svg
                                    viewBox='0 0 24 24'
                                    aria-hidden='true'
                                    className='mt-1 size-6 shrink-0 text-[#8a6c12]'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='1.6'
                                    strokeLinecap='round'
                                >
                                    <path d='M5 12h14' />
                                    <path className='hp-plus-v' d='M12 5v14' />
                                </svg>
                            </summary>
                            <p className='pb-6 leading-relaxed text-stone-600 md:pr-12'>
                                {faq.answer}
                            </p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    )
}
