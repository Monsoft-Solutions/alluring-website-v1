/**
 * The last section of a lead page: back to the thread, answers kept. A link,
 * not a second form — one conversation per page.
 */

import { getPhoneLink, siteConfig } from '@/lib/data/site-config'

interface ResumeChatCtaProps {
    readonly id?: string
    readonly chatId: string
    readonly eyebrow: string
    readonly heading: string
    readonly body: string
    readonly buttonLabel: string
}

export function ResumeChatCta({
    id = 'resume',
    chatId,
    eyebrow,
    heading,
    body,
    buttonLabel,
}: ResumeChatCtaProps) {
    return (
        <section
            id={id}
            aria-labelledby={`${id}-title`}
            className='bg-stone-900 px-4 py-16 text-center sm:py-20'
        >
            <div className='mx-auto max-w-xl'>
                <p className='text-gold-400 text-[11px] font-bold tracking-[0.18em] uppercase'>
                    {eyebrow}
                </p>
                <h2
                    id={`${id}-title`}
                    className='mt-3 font-serif text-3xl text-balance text-stone-50 sm:text-4xl'
                >
                    {heading}
                </h2>
                <p className='mt-4 text-base leading-relaxed text-stone-300'>
                    {body}
                </p>
                <div className='mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row'>
                    <a
                        href={`#${chatId}`}
                        className='from-gold-300 via-gold-400 to-gold-500 shadow-gold-500/20 inline-flex min-h-13 items-center justify-center rounded-xl bg-gradient-to-br px-7 text-base font-bold text-stone-950 shadow-lg'
                    >
                        {buttonLabel} →
                    </a>
                    <a
                        href={getPhoneLink()}
                        className='inline-flex min-h-13 items-center justify-center rounded-xl border border-white/15 px-6 text-base font-semibold text-stone-100'
                    >
                        Call {siteConfig.contact.phoneDisplay}
                    </a>
                </div>
            </div>
        </section>
    )
}
