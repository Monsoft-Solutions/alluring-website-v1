import Link from 'next/link'
import Image from 'next/image'
import type { ReactNode } from 'react'
import { Phone } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

import { getPhoneLink, siteConfig } from '@/lib/data/site-config'
import { KARLINSKY_NAME } from '@/lib/data/surgeons/karlinsky-credentials.constant'
import { surgeons } from '@/lib/data/surgeons/surgeons-data'

import { ModuleStars } from './module-stars.component'
import {
    AI_MODEL_LABEL,
    moduleButtonPrimary,
    moduleButtonSecondary,
    moduleContainer,
    moduleLink,
    type ModuleImage,
} from './module-ui.constant'

const portrait = surgeons.find((surgeon) => surgeon.id === 'dr-karlinsky')
    ?.images.portrait

export type ModuleRating = {
    /** Average star rating on the Google Business Profile. */
    value: number
    /** Number of reviews behind it; 0 when unknown. */
    count: number
}

export type ModuleHeroChip = { label: string; lang?: string }

type ModuleHeroProps = {
    /** The H1: `procedure.title`, unchanged by a redesign. */
    title: string
    /** The H1's id, which the hero section is labelled by. */
    headingId: string
    /** The last breadcrumb, e.g. "BBL". */
    breadcrumb: string
    /**
     * The direct answer under the H1: what the procedure is, then the one
     * surgeon who performs it. Carries `procedure-intro` for `speakable`.
     */
    lede: ReactNode
    rating: ModuleRating
    /** Three short facts: the price, financing, the language. */
    chips: ModuleHeroChip[]
    /** Names the chip list, e.g. "BBL at Alluring in brief". */
    chipsLabel: string
    /** The 4:5 editorial photograph, labelled as a model. */
    image: ModuleImage
    /** The bold line under the rating on the glass card, from `lg`. */
    cardNote: ReactNode
}

/**
 * A procedure page's hero: the H1, a direct answer that names the one
 * surgeon, who she is and how patients rate the practice, three facts and
 * both calls to action, beside the page's editorial portrait.
 *
 * Everything a phone shows on the first screen is here: the rating card on
 * the photograph sits below the fold on a phone, so the trust row carries the
 * rating there, and the card takes over from `lg`.
 *
 * The H1 and lede are the mobile LCP and never animate. The photograph and
 * the rating card carry the page's one load-time motion (`module-kit.css`).
 */
export function ModuleHero({
    title,
    headingId,
    breadcrumb,
    lede,
    rating,
    chips,
    chipsLabel,
    image,
    cardNote,
}: ModuleHeroProps) {
    return (
        <section aria-labelledby={headingId} className='pm-hero bg-stone-50'>
            <div
                className={cn(
                    moduleContainer,
                    'grid gap-10 pt-[calc(var(--announcement-bar-height,0px)+7rem)] pb-12 md:pt-[calc(var(--announcement-bar-height,0px)+8rem)] lg:grid-cols-[minmax(0,1fr)_31.5rem] lg:gap-24 lg:pt-[calc(var(--announcement-bar-height,0px)+8.5rem)] lg:pb-20'
                )}
            >
                <div className='flex flex-col gap-6 lg:gap-7 lg:pt-6'>
                    <nav aria-label='Breadcrumb'>
                        <ol className='flex flex-wrap gap-x-2 text-[0.9375rem] text-stone-600 [&>li+li]:before:mr-2 [&>li+li]:before:text-stone-400 [&>li+li]:before:content-["/"]'>
                            <li>
                                <Link
                                    href='/'
                                    className='underline-offset-4 hover:underline'
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href='/procedures'
                                    className='underline-offset-4 hover:underline'
                                >
                                    Procedures
                                </Link>
                            </li>
                            <li aria-current='page'>{breadcrumb}</li>
                        </ol>
                    </nav>
                    <h1
                        id={headingId}
                        className='font-serif text-[2.375rem] leading-[1.08] font-medium tracking-[-0.01em] text-balance text-stone-900 md:text-5xl lg:text-[3.5rem] lg:leading-[1.05]'
                    >
                        {title}
                    </h1>
                    <p className='procedure-intro max-w-[35rem] text-[1.0625rem] leading-[1.6] text-stone-700 md:text-xl md:leading-[1.6]'>
                        {lede}
                    </p>
                    <div className='flex flex-wrap items-center gap-x-6 gap-y-4'>
                        <a
                            href='#surgeon'
                            className='group flex items-center gap-3 no-underline'
                        >
                            {portrait && (
                                <Image
                                    src={portrait}
                                    alt=''
                                    width={96}
                                    height={96}
                                    sizes='48px'
                                    className='size-12 shrink-0 rounded-full bg-stone-200 object-cover object-top ring-2 ring-white'
                                />
                            )}
                            <span className='flex flex-col'>
                                <span className='text-[0.9375rem] leading-[1.35] font-bold text-stone-900 group-hover:underline'>
                                    {KARLINSKY_NAME}
                                </span>
                                <span className='text-[0.9375rem] leading-[1.35] text-stone-600'>
                                    Your surgeon
                                </span>
                            </span>
                        </a>
                        <div
                            data-copy-check='data'
                            className='flex items-center gap-2.5 sm:border-l sm:border-stone-300 sm:pl-6 lg:hidden'
                        >
                            <span className='font-serif text-[1.75rem] leading-none text-stone-900 tabular-nums'>
                                {rating.value.toFixed(1)}
                            </span>
                            <span className='flex flex-col gap-1'>
                                <ModuleStars
                                    rating={rating.value}
                                    className='text-[0.9375rem]'
                                />
                                <span className='text-[0.8125rem] leading-none text-stone-600 tabular-nums'>
                                    {rating.count > 0
                                        ? `${rating.count} Google reviews`
                                        : 'On Google'}
                                </span>
                            </span>
                        </div>
                    </div>
                    <ul
                        aria-label={chipsLabel}
                        className='flex flex-wrap gap-2 md:gap-2.5'
                    >
                        {chips.map((chip) => (
                            <li
                                key={chip.label}
                                lang={chip.lang}
                                className='inline-flex min-h-[2.375rem] items-center rounded-[4px] border border-stone-300 bg-white px-3.5 text-[0.9375rem] text-stone-900 tabular-nums'
                            >
                                {chip.label}
                            </li>
                        ))}
                    </ul>
                    <div className='flex flex-col gap-2.5 pt-1.5 sm:flex-row sm:flex-wrap sm:gap-3'>
                        <a href='#book' className={moduleButtonPrimary}>
                            Book a free consultation
                        </a>
                        {/* A tel: link often does nothing on a desktop, so
                            from `sm` the button shows the number itself. */}
                        <a
                            href={getPhoneLink()}
                            className={cn(
                                moduleButtonSecondary,
                                'tabular-nums'
                            )}
                        >
                            <Phone
                                aria-hidden='true'
                                className='size-[1.125rem]'
                            />
                            <span className='sm:hidden'>Call us</span>
                            <span
                                data-copy-check='data'
                                className='hidden sm:inline'
                            >
                                Call {siteConfig.contact.phoneDisplay}
                            </span>
                        </a>
                    </div>
                    <p className='-mt-1 text-[0.9375rem] leading-normal text-stone-600'>
                        Live in another state?{' '}
                        <Link
                            href='/fly-in-consultation'
                            className={moduleLink}
                        >
                            Start with a virtual consultation
                        </Link>
                    </p>
                </div>

                <figure className='relative mx-auto w-full max-w-[31.5rem] lg:mx-0'>
                    <div className='pm-hero-frame aspect-[4/5] overflow-hidden bg-stone-200'>
                        <Image
                            src={image.src}
                            alt={image.alt}
                            width={image.width}
                            height={image.height}
                            sizes='(min-width: 640px) 504px, calc(100vw - 40px)'
                            priority
                            className='block size-full object-cover'
                        />
                    </div>
                    <figcaption className='mt-2.5 text-right text-[0.8125rem] leading-[1.4] text-stone-500'>
                        {AI_MODEL_LABEL}
                    </figcaption>
                    <div className='pm-hero-card absolute bottom-[3.75rem] left-3 hidden w-[15.75rem] rounded-2xl border border-white/70 bg-white/80 px-5 py-4.5 shadow-[0_12px_32px_rgba(28,25,23,0.12)] backdrop-blur-xl lg:bottom-[5.25rem] lg:-left-18 lg:block lg:w-[18.25rem] lg:px-5.5 lg:py-5'>
                        <div
                            data-copy-check='data'
                            className='flex items-center gap-3'
                        >
                            <span className='font-serif text-[2.125rem] leading-none text-stone-900 tabular-nums'>
                                {rating.value.toFixed(1)}
                            </span>
                            <ModuleStars
                                rating={rating.value}
                                className='text-lg'
                            />
                        </div>
                        <p
                            data-copy-check='data'
                            className='mt-2.5 text-[0.9375rem] leading-[1.4] text-stone-700 tabular-nums'
                        >
                            {rating.count > 0
                                ? `From ${rating.count} reviews on Google`
                                : 'Rating on Google'}
                        </p>
                        <p className='mt-3 border-t border-stone-900/15 pt-3 text-[0.9375rem] leading-[1.4] font-bold text-stone-900'>
                            {cardNote}
                        </p>
                    </div>
                </figure>
            </div>
        </section>
    )
}
