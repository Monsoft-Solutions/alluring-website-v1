import type { ReactNode } from 'react'
import { Phone } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

import { getPhoneLink, siteConfig } from '@/lib/data/site-config'
import { KARLINSKY_SHORT_NAME } from '@/lib/data/surgeons/karlinsky-credentials.constant'

import {
    moduleBodyDark,
    moduleButtonPrimary,
    moduleButtonSecondary,
    moduleContainer,
    moduleH3Dark,
} from './module-ui.constant'

/**
 * The page's one dark band, which opens from an inset card to full width as
 * it arrives (`pm-scene`). It holds the procedure's signature scene; the page
 * lays out what goes inside.
 */
export function ModuleScene({ children }: { children: ReactNode }) {
    return (
        <div className='pm-scene bg-stone-900'>
            <div className={cn(moduleContainer, 'py-12 md:py-24')}>
                {children}
            </div>
        </div>
    )
}

/**
 * "Questions to ask any … surgeon, including us", closing the dark band. It
 * ends where a reader has just been told to question every surgeon, so the
 * band's last word is an invitation to question ours.
 */
export function ModuleAskAnySurgeon({
    heading,
    questions,
    note = "Bring this list to your free consultation, and she answers each question before you decide anything. Her credentials are below, each one linked to the issuing body's own record.",
}: {
    /** e.g. "Questions to ask any BBL surgeon, including us". */
    heading: string
    questions: string[]
    /**
     * The line under "Ask Dr. Karlinsky every one of them". The default
     * points "below", to a surgeon section that follows the dark band; a page
     * that orders its sections differently passes its own.
     */
    note?: string
}) {
    return (
        <section
            aria-labelledby='ask-heading'
            className='mt-12 border-t border-stone-700 pt-10 md:mt-16 md:pt-12'
        >
            <h3 id='ask-heading' className={moduleH3Dark}>
                {heading}
            </h3>
            <ul className='mt-5.5 grid gap-3.5 md:grid-cols-2 md:gap-x-12 md:gap-y-4.5'>
                {questions.map((question) => (
                    <li
                        key={question}
                        className='flex gap-3.5 text-[1.0625rem] leading-[1.6] text-stone-200'
                    >
                        <span
                            aria-hidden='true'
                            className='border-gold-400 mt-1 size-[1.125rem] shrink-0 rounded-[3px] border-[1.5px]'
                        />
                        <span>{question}</span>
                    </li>
                ))}
            </ul>
            <p className='text-gold-100 mt-7 text-[1.0625rem] leading-[1.55] font-bold md:text-lg'>
                A clinic that cannot answer these clearly is one to walk away
                from.
            </p>
            <div className='mt-9 flex flex-col gap-6 border-t border-stone-700 pt-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12'>
                <div className='max-w-[37.5rem]'>
                    <p className='font-serif text-[1.375rem] leading-[1.3] text-stone-50 md:text-[1.625rem]'>
                        Ask {KARLINSKY_SHORT_NAME} every one of them.
                    </p>
                    <p className={cn(moduleBodyDark, 'mt-2')}>{note}</p>
                </div>
                <div className='flex flex-col gap-2.5 sm:flex-row sm:gap-3 lg:shrink-0'>
                    <a href='#book' className={moduleButtonPrimary}>
                        Book a free consultation
                    </a>
                    {/* Phones have the sticky bar's call button right below. */}
                    <a
                        href={getPhoneLink()}
                        data-copy-check='data'
                        className={cn(
                            moduleButtonSecondary,
                            'hidden tabular-nums sm:inline-flex'
                        )}
                    >
                        <Phone aria-hidden='true' className='size-[1.125rem]' />
                        Call {siteConfig.contact.phoneDisplay}
                    </a>
                </div>
            </div>
        </section>
    )
}
