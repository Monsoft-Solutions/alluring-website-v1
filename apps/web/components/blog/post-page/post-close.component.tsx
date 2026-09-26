import { cn } from '@workspace/ui/lib/utils'

import { moduleContainer } from '@/components/procedures/module-kit/module-ui.constant'
import type { PostProcedure } from '@/lib/blog/post-procedure.util'
import { getPhoneLink, getSmsLink, siteConfig } from '@/lib/data/site-config'

import { closeCopy, POST_CLOSE_ID, POST_CONSULT_ID } from './post-page.copy'

type PostCloseProps = {
    procedure: PostProcedure | null
}

/**
 * The closing band: the practice's promise in its tagline, what the reader
 * gets in writing, and the two ways to act. Champagne on cocoa, the site's
 * dark band.
 *
 * The second button texts the practice once a texting number is set and
 * calls it until then: the main line does not take texts (`siteConfig`).
 */
export function PostClose({ procedure }: PostCloseProps) {
    const copy = closeCopy(procedure)
    const smsLink = getSmsLink()
    const { phoneDisplay, textPhoneDisplay } = siteConfig.contact

    return (
        <section
            id={POST_CLOSE_ID}
            aria-labelledby='post-close-title'
            className='bg-stone-900 text-stone-50'
        >
            <div className={cn(moduleContainer, 'py-16 md:py-24')}>
                <p className='text-gold-300 text-xs font-semibold tracking-[0.18em] uppercase'>
                    {copy.eyebrow}
                </p>
                <h2
                    id='post-close-title'
                    className='mt-4 max-w-[40rem] font-serif text-[2.25rem] leading-[1.05] font-normal tracking-[-0.015em] text-balance text-stone-50 md:text-[3.25rem]'
                >
                    {copy.heading.lead}
                    <em className='text-gold-300'>{copy.heading.em}</em>
                </h2>
                <p className='mt-5 max-w-[34rem] text-[1.0625rem] leading-[1.6] text-stone-300 md:text-lg'>
                    {copy.body}
                </p>
                <div className='mt-9 flex flex-wrap items-center gap-3'>
                    <a
                        href={`#${POST_CONSULT_ID}`}
                        data-consult-procedure={procedure?.chatValue}
                        data-consult-entry='closing'
                        data-cta='blog_close_price'
                        className='bg-gold-300 hover:bg-gold-200 inline-flex min-h-13 items-center justify-center gap-2 rounded-full px-7 text-base font-semibold text-stone-950 transition-colors'
                    >
                        {copy.primary} <span aria-hidden='true'>→</span>
                    </a>
                    {smsLink ? (
                        <a
                            href={smsLink}
                            data-cta='blog_close_text'
                            className='border-gold-300/40 hover:border-gold-300 inline-flex min-h-13 items-center justify-center rounded-full border px-7 text-base font-semibold text-stone-50 transition-colors'
                        >
                            Text {textPhoneDisplay}
                        </a>
                    ) : (
                        <a
                            href={getPhoneLink()}
                            data-cta='blog_close_call'
                            className='border-gold-300/40 hover:border-gold-300 inline-flex min-h-13 items-center justify-center rounded-full border px-7 text-base font-semibold text-stone-50 tabular-nums transition-colors'
                        >
                            Call {phoneDisplay}
                        </a>
                    )}
                </div>
            </div>
        </section>
    )
}
