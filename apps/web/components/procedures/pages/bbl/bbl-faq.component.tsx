import { cn } from '@workspace/ui/lib/utils'

import type { ProcedureFAQ } from '@/lib/types/procedure.type'

import { bblContainer } from './bbl-ui.constant'

/** How many answers start open. */
const OPEN_BY_DEFAULT = 2

/**
 * "BBL questions, answered." The questions come from `procedure.faqs`, the
 * same list the page graph's `FAQPage` node and the paid landing page read,
 * so the visible answers and the structured data cannot differ.
 *
 * Native `<details>`: every answer is in the HTML whether it is open or not,
 * and opens with no JavaScript. `bbl-page.css` animates the height where the
 * browser can size to `auto`.
 */
export function BblFaq({ faqs }: { faqs: ProcedureFAQ[] }) {
    if (faqs.length === 0) return null

    return (
        <div className='bbl-defer bg-white'>
            <section
                id='faq'
                aria-labelledby='faq-heading'
                className={cn(
                    bblContainer,
                    'bbl-faq scroll-mt-32 py-12 md:py-24 lg:grid lg:scroll-mt-40 lg:grid-cols-[22.5rem_minmax(0,47.5rem)] lg:justify-between lg:gap-x-20'
                )}
            >
                <h2
                    id='faq-heading'
                    className='font-serif text-[1.75rem] leading-[1.2] font-medium text-balance text-stone-900 md:text-[2.375rem] md:leading-[1.15] lg:sticky lg:top-40 lg:self-start'
                >
                    BBL questions, answered
                </h2>
                <div className='mt-5 border-t border-stone-300 lg:mt-0'>
                    {faqs.map((faq, index) => (
                        <details
                            key={faq.question}
                            open={index < OPEN_BY_DEFAULT}
                            className='border-b border-stone-300'
                        >
                            <summary className='flex min-h-11 cursor-pointer items-center justify-between gap-5 py-4.5'>
                                <h3 className='text-[1.0625rem] leading-[1.35] font-bold text-stone-900 md:text-[1.1875rem]'>
                                    {faq.question}
                                </h3>
                                <svg
                                    aria-hidden='true'
                                    viewBox='0 0 24 24'
                                    className='bbl-plus size-5 shrink-0 text-stone-900'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth={1.6}
                                    strokeLinecap='round'
                                >
                                    <path d='M5 12h14' />
                                    <path className='bbl-plus-v' d='M12 5v14' />
                                </svg>
                            </summary>
                            <p className='pb-6 text-[1.0625rem] leading-[1.65] text-stone-700 tabular-nums md:pr-12'>
                                {faq.answer}
                            </p>
                        </details>
                    ))}
                </div>
            </section>
        </div>
    )
}
