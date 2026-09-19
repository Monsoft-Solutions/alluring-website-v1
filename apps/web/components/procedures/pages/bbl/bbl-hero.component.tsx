import Link from 'next/link'
import Image from 'next/image'
import { Phone } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

import { bblFigure } from '@/lib/data/procedures/facts/bbl.facts'
import { getPhoneLink } from '@/lib/data/site-config'

import { AI_MODEL_LABEL, bblImages } from './bbl-page.constant'
import { BblStars } from './bbl-stars.component'
import {
    bblButtonPrimary,
    bblButtonSecondary,
    bblContainer,
} from './bbl-ui.constant'

export type BblRating = {
    /** Average star rating on the Google Business Profile. */
    value: number
    /** Number of reviews behind it; 0 when unknown. */
    count: number
}

type BblHeroProps = {
    /** The H1: `procedure.title`, unchanged by the redesign. */
    title: string
    rating: BblRating
}

/**
 * The BBL page hero: the H1, a direct answer, three facts and both calls to
 * action, beside the #254 portrait.
 *
 * The H1 and lede are the mobile LCP and never animate. The photograph and
 * the rating card carry the page's one load-time motion (`bbl-page.css`).
 * The lede has `procedure-intro` so the page graph's `speakable` selector
 * reaches it.
 */
export function BblHero({ title, rating }: BblHeroProps) {
    const chips = [
        `Starting at ${bblFigure('price-starting-at')}`,
        '3–5 hour outpatient surgery',
        'Ultrasound-guided, as Florida law requires',
    ]

    return (
        <section
            aria-labelledby='bbl-hero-heading'
            className='bbl-hero bg-stone-50'
        >
            <div
                className={cn(
                    bblContainer,
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
                            <li aria-current='page'>BBL</li>
                        </ol>
                    </nav>
                    <h1
                        id='bbl-hero-heading'
                        className='font-serif text-[2.375rem] leading-[1.08] font-medium tracking-[-0.01em] text-balance text-stone-900 md:text-5xl lg:text-[3.5rem] lg:leading-[1.05]'
                    >
                        {title}
                    </h1>
                    <p className='procedure-intro max-w-[35rem] text-[1.0625rem] leading-[1.6] text-stone-700 md:text-xl md:leading-[1.6]'>
                        A Brazilian butt lift moves your own fat from areas such
                        as the abdomen, flanks and back to your buttocks for
                        more shape and fullness, without implants. In Florida,
                        the law requires that fat to stay under the skin, placed
                        with ultrasound guidance.
                    </p>
                    <ul
                        aria-label='BBL at Alluring in brief'
                        className='flex flex-wrap gap-2 md:gap-2.5'
                    >
                        {chips.map((chip) => (
                            <li
                                key={chip}
                                className='inline-flex min-h-[2.375rem] items-center rounded-[4px] border border-stone-300 bg-white px-3.5 text-[0.9375rem] text-stone-900 tabular-nums'
                            >
                                {chip}
                            </li>
                        ))}
                    </ul>
                    <div className='flex flex-col gap-2.5 pt-1.5 sm:flex-row sm:gap-3'>
                        <a href='#book' className={bblButtonPrimary}>
                            Book a free consultation
                        </a>
                        <a href={getPhoneLink()} className={bblButtonSecondary}>
                            <Phone
                                aria-hidden='true'
                                className='size-[1.125rem]'
                            />
                            Call us
                        </a>
                    </div>
                </div>

                <figure className='relative mx-auto w-full max-w-[31.5rem] lg:mx-0'>
                    <div className='bbl-hero-frame aspect-[4/5] overflow-hidden bg-stone-200'>
                        <Image
                            src={bblImages.hero.src}
                            alt={bblImages.hero.alt}
                            width={bblImages.hero.width}
                            height={bblImages.hero.height}
                            sizes='(min-width: 640px) 504px, calc(100vw - 40px)'
                            priority
                            className='block size-full object-cover'
                        />
                    </div>
                    <figcaption className='mt-2.5 text-right text-[0.8125rem] leading-[1.4] text-stone-500'>
                        {AI_MODEL_LABEL}
                    </figcaption>
                    <div className='bbl-hero-card absolute bottom-[3.75rem] left-3 w-[15.75rem] rounded-2xl border border-white/70 bg-white/80 px-5 py-4.5 shadow-[0_12px_32px_rgba(28,25,23,0.12)] backdrop-blur-xl lg:bottom-[5.25rem] lg:-left-18 lg:w-[18.25rem] lg:px-5.5 lg:py-5'>
                        <div
                            data-copy-check='data'
                            className='flex items-center gap-3'
                        >
                            <span className='font-serif text-[2.125rem] leading-none text-stone-900 tabular-nums'>
                                {rating.value.toFixed(1)}
                            </span>
                            <BblStars
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
                            Ultrasound-guided under Florida law
                        </p>
                    </div>
                </figure>
            </div>
        </section>
    )
}
