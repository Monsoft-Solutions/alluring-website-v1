import { preload } from 'react-dom'
import { cn } from '@workspace/ui/lib/utils'

import { HeroVideo } from '@/components/home/hero-video.component'
import { HomeMotionToggle } from './home-motion-toggle.component'
import { ModuleStars } from '@/components/procedures/module-kit/module-stars.component'
import { bblFigure } from '@/lib/data/procedures/facts/bbl.facts'
import { lipoFigure } from '@/lib/data/procedures/facts/lipo.facts'
import { KARLINSKY_NAME } from '@/lib/data/surgeons/karlinsky-credentials.constant'

import {
    HOME_CHAT_ID,
    HOME_MEDIA,
    HOME_PROCEDURES,
    HOME_SECTION_IDS,
    MODEL_DISCLOSURE,
    PRICE_VARIABLES,
    homeContainer,
} from './home-page.constant'

/**
 * The first tap. Each chip answers the consultation thread's first question
 * and jumps to it (`data-consult-procedure`, read by `ConsultChat`), so a
 * visitor's first action on the page costs one tap and no typing. Ordered
 * by what the home page's leads picked.
 */
const HERO_CHIPS = [
    { label: HOME_PROCEDURES.lipo.name, chat: HOME_PROCEDURES.lipo.chat },
    { label: HOME_PROCEDURES.bbl.name, chat: HOME_PROCEDURES.bbl.chat },
    { label: HOME_PROCEDURES.mommy.name, chat: HOME_PROCEDURES.mommy.chat },
    { label: HOME_PROCEDURES.tummy.name, chat: HOME_PROCEDURES.tummy.chat },
    { label: 'Breasts', chat: HOME_PROCEDURES.breast.chat },
] as const

type HomeHeroProps = {
    rating: number | null
    reviewCount: number
}

/**
 * Opening scene: a sunlit Miami terrace on film, the promise, the two
 * settled prices, the surgeon's name and the first question of the
 * consultation thread as a row of one-tap answers.
 *
 * Server-rendered. The poster is a plain `<img>` in a `<picture>`, so the
 * browser picks the cut and paints it with no JavaScript; `HeroVideo`
 * attaches the film once the page is idle (and never under reduced motion).
 * The headline never moves: only the photograph settles and, where
 * scroll-driven animation exists, drifts as the hero leaves.
 */
export function HomeHero({ rating, reviewCount }: HomeHeroProps) {
    preload(HOME_MEDIA.heroPosterMobile, {
        as: 'image',
        media: '(width < 48rem)',
        fetchPriority: 'high',
    })
    preload(HOME_MEDIA.heroPosterDesktop, {
        as: 'image',
        media: '(width >= 48rem)',
        fetchPriority: 'high',
    })

    return (
        <section
            id={HOME_SECTION_IDS.hero}
            aria-labelledby='hero-title'
            className='hp-hero relative isolate overflow-hidden bg-[var(--hp-porcelain)]'
        >
            {/* On phones the film fills the hero behind a transparent header.
                From `md` it starts under the header: the landscape cut puts
                her face in its top quarter, which would sit behind the nav. */}
            <div
                className='hp-hero-media absolute inset-x-0 top-0 bottom-0 -z-10 overflow-hidden md:top-[calc(var(--announcement-bar-height,0px)+6rem)] lg:top-[calc(var(--announcement-bar-height,0px)+6.5rem)]'
                aria-hidden='true'
            >
                <picture>
                    <source
                        media='(width >= 48rem)'
                        srcSet={HOME_MEDIA.heroPosterDesktop}
                    />
                    <img
                        src={HOME_MEDIA.heroPosterMobile}
                        alt=''
                        fetchPriority='high'
                        decoding='async'
                        className='h-full w-full object-cover object-top'
                    />
                </picture>
                <HeroVideo
                    desktopSrc={HOME_MEDIA.heroVideoDesktop}
                    mobileSrc={HOME_MEDIA.heroVideoMobile}
                    label='Lifestyle film: a woman on a sunlit terrace in Miami. Model shown, not a patient.'
                />
                <div className='hp-hero-scrim absolute inset-0' />
            </div>

            <div
                className={cn(
                    homeContainer,
                    'flex min-h-[100svh] flex-col justify-end pt-[calc(var(--announcement-bar-height,0px)+22rem)] pb-24',
                    'md:min-h-[46rem] md:justify-center md:pt-[calc(var(--announcement-bar-height,0px)+8rem)] md:pb-24 lg:min-h-[100svh]'
                )}
            >
                <div className='max-w-[40rem]'>
                    <h1 id='hero-title'>
                        <span className='hp-eyebrow'>
                            <span
                                className='hp-eyebrow__rule'
                                aria-hidden='true'
                            />
                            Alluring Plastic Surgery · Miami
                        </span>
                        <span className='hp-display mt-5 block text-[3.9rem] leading-[0.88] font-medium tracking-[-0.035em] sm:text-[5.25rem] lg:text-[7rem]'>
                            Become the <em>after</em>.
                        </span>
                    </h1>

                    <p className='mt-6 max-w-[31rem] text-[1.0625rem] leading-relaxed text-[var(--hp-ink-2)] md:text-lg'>
                        Body contouring by {KARLINSKY_NAME}.{' '}
                        <strong className='font-semibold text-[var(--hp-ink)]'>
                            Lipo 360 from {lipoFigure('price-starting-at')}. BBL
                            from {bblFigure('price-starting-at')}.*
                        </strong>{' '}
                        Financing available.
                    </p>

                    {rating !== null && reviewCount > 0 && (
                        <p className='mt-4 flex items-center gap-2.5 text-sm text-[var(--hp-ink-2)]'>
                            <ModuleStars
                                rating={rating}
                                className='text-[0.9rem] text-[var(--hp-star)]'
                            />
                            <span className='hp-num'>
                                <strong className='font-semibold text-[var(--hp-ink)]'>
                                    {rating.toFixed(1)}
                                </strong>{' '}
                                from {reviewCount} Google reviews
                            </span>
                        </p>
                    )}

                    <div
                        role='group'
                        aria-labelledby='hero-chips-label'
                        className='mt-8 border-t border-[var(--hp-line)] pt-6'
                    >
                        <p
                            id='hero-chips-label'
                            className='flex items-center gap-2.5 text-[0.9375rem] font-semibold text-[var(--hp-ink)]'
                        >
                            <span
                                className='relative flex size-2'
                                aria-hidden='true'
                            >
                                <span className='absolute inline-flex size-full rounded-full bg-emerald-500/60 motion-safe:animate-ping' />
                                <span className='relative inline-flex size-2 rounded-full bg-emerald-600' />
                            </span>
                            What are you thinking about?
                        </p>
                        <ul className='mt-3.5 flex flex-wrap gap-2'>
                            {HERO_CHIPS.map((chip) => (
                                <li key={chip.chat}>
                                    <a
                                        href={`#${HOME_CHAT_ID}`}
                                        data-consult-procedure={chip.chat}
                                        data-cta='home_hero_chip'
                                        className='hp-chip'
                                    >
                                        {chip.label}
                                    </a>
                                </li>
                            ))}
                            <li>
                                <a
                                    href={`#${HOME_CHAT_ID}`}
                                    data-consult-procedure='other'
                                    data-cta='home_hero_chip'
                                    className='hp-chip hp-chip--quiet'
                                >
                                    Not sure yet
                                </a>
                            </li>
                        </ul>
                        <p className='mt-4 text-[0.8125rem] leading-snug text-[var(--hp-mute)]'>
                            Free consultation in Miami, or by video from
                            anywhere in the U.S. A coordinator replies by text.
                        </p>
                    </div>
                </div>
            </div>

            <div className='absolute inset-x-0 bottom-3 flex items-center justify-between gap-4 px-4 md:px-8'>
                <HomeMotionToggle />
                <p className='max-w-[34rem] text-right text-[0.6875rem] leading-snug text-[var(--hp-mute)]'>
                    *{PRICE_VARIABLES} {MODEL_DISCLOSURE}
                </p>
            </div>
        </section>
    )
}
