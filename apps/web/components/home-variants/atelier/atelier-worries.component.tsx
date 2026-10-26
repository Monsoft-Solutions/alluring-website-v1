/**
 * Atelier Worries
 *
 * Objections in the visitor's own words. Native <details> so the answers
 * ship in the HTML and stay indexable, and so keyboard support is free.
 *
 * Tone is the point: these concede real limits rather than closing every
 * answer on a reassurance. "Some of it does" is a more persuasive answer
 * to "does it hurt" than "you'll be comfortable throughout", and it is the
 * only answer consistent with a direction built on candour.
 *
 * Server-rendered.
 */
import Link from 'next/link'
import { Plus } from 'lucide-react'

import { getFinancingPartnersString } from '@/lib/data/site-config'

const WORRIES: readonly {
    readonly worry: string
    readonly answer: string
}[] = [
    {
        worry: 'Will it look obviously done?',
        answer: 'Fair worry — you have seen the same results we have. It is usually a planning failure rather than a surgical one: work reads as work when the size or shape does not suit the frame it is on. If what you are asking for would look obvious on your body, your surgeon will say so in consultation instead of taking the booking.',
    },
    {
        worry: 'Does it hurt?',
        answer: 'Some of it does. The first few days after abdominal surgery are uncomfortable for most people. It is managed with medication and usually improves over the following days. Recovery from breast augmentation and eyelid surgery is usually shorter: at Alluring, about 1 week to light activity after breast augmentation, and 7 to 10 days to work after eyelid surgery.',
    },
    {
        worry: 'I cannot take a month off work.',
        answer: 'Almost nobody can. Most people are back at a desk job within a few days to a few weeks, depending on the procedure, and exercise comes back later: The Aesthetic Society advises 4 to 6 weeks without strenuous exercise after liposuction, and 8 weeks after a BBL. Your surgeon sets your dates, and Alluring confirms your surgery, pre-op and follow-up dates in writing, so you can arrange childcare and work around real dates.',
    },
    {
        worry: 'What if I cannot afford it?',
        answer: `Worth finding out rather than assuming. Financing through ${getFinancingPartnersString()} depends on credit, and approval and terms are set by the lender, so we cannot promise approval or a particular rate. A real number beats another year of wondering.`,
    },
    {
        worry: 'Is it safe?',
        answer: 'An anesthesia provider monitors you throughout surgery, and you are cleared with pre-operative lab work first. Surgery carries real risk. We will go through the risks that apply to your history specifically, not a generic list.',
    },
    {
        worry: 'I am not ready to commit to anything.',
        answer: 'Then do not. A consultation holds no date and takes no deposit. Leaving with a price and a plan and doing nothing with either is a completely normal outcome, and nobody here treats it as a failure.',
    },
] as const

export function AtelierWorries() {
    return (
        <section
            className='scroll-mt-24 bg-[#EFE3D6] px-6 py-20 md:px-10 md:py-28'
            aria-labelledby='atelier-worries-heading'
            id='worries'
        >
            <div className='mx-auto max-w-3xl'>
                <div className='mb-12'>
                    <span className='text-xs tracking-[0.3em] text-[#C4674D] uppercase'>
                        The honest answers
                    </span>
                    <h2
                        id='atelier-worries-heading'
                        className='mt-5 font-[family-name:var(--font-fraunces)] text-4xl leading-[1.05] text-[#3D2B23] md:text-5xl'
                    >
                        What is actually
                        <span className='text-[#C4674D] italic'>
                            {' '}
                            stopping you?
                        </span>
                    </h2>
                </div>

                <div className='space-y-3'>
                    {WORRIES.map((item) => (
                        <details
                            key={item.worry}
                            className='group rounded-[1.5rem] bg-[#F6EDE4] px-7 py-1'
                        >
                            <summary className='flex cursor-pointer list-none items-center justify-between gap-5 py-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C4674D]'>
                                <span className='font-[family-name:var(--font-fraunces)] text-xl leading-snug text-[#3D2B23]'>
                                    {item.worry}
                                </span>
                                <Plus
                                    className='h-5 w-5 shrink-0 text-[#C4674D] transition-transform duration-300 group-open:rotate-45'
                                    aria-hidden='true'
                                />
                            </summary>
                            <p className='pb-7 leading-[1.75] text-[#3D2B23]/70'>
                                {item.answer}
                            </p>
                        </details>
                    ))}
                </div>

                <p className='mt-10 text-center text-[#3D2B23]/70'>
                    Worried about something not listed?{' '}
                    <Link
                        href='#talk'
                        className='font-medium text-[#C4674D] underline underline-offset-4'
                    >
                        Ask it in a free consultation
                    </Link>
                    .
                </p>
            </div>
        </section>
    )
}
