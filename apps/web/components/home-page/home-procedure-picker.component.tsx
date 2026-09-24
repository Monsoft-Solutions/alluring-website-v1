import type { CSSProperties, ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

import { getProcedureBySlug } from '@/lib/data/procedures.data'
import { bblFigure } from '@/lib/data/procedures/facts/bbl.facts'
import { lipoFigure } from '@/lib/data/procedures/facts/lipo.facts'

import {
    HOME_CHAT_ID,
    HOME_MEDIA,
    HOME_PROCEDURES,
    HOME_SECTION_IDS,
    type HomeProcedureKey,
    homeContainer,
    homeEyebrow,
    homeHeading,
    homeLink,
    homePrimaryButton,
} from './home-page.constant'

type Zone = {
    key: HomeProcedureKey
    /** The area, in the visitor's words: the chip's label. */
    area: string
    title: string
    body: ReactNode
    facts: readonly string[]
    /** Where the figure's hotspots sit, as % of the trimmed figure. */
    dots: readonly { x: number; y: number; label: string }[]
    /** Extra pages for zones that cover more than one procedure. */
    more?: readonly { label: string; href: string }[]
    /** The main link's text, when "<title> in detail" doesn't fit. */
    link?: string
    /** The button's text, when "Ask about <procedure>" doesn't fit. */
    ask?: string
}

/**
 * The areas people come in about, each answered by the procedure that
 * addresses it. Figures come from the facts files and are stated with the
 * attribution those files require; procedures without a settled price say
 * that the price comes in writing, rather than guessing one (#232).
 */
const ZONES: readonly Zone[] = [
    {
        key: 'lipo',
        area: 'Waist & back',
        title: 'Lipo 360',
        body: 'Liposuction all the way around the midsection (abdomen, waist, flanks and back) in one procedure, to bring the waist in. Arms and thighs can be added. It removes fat; it does not tighten loose skin.',
        facts: [
            `From ${lipoFigure('price-starting-at')}`,
            'Usually 1 to 3 hours, home the same day',
            'Most normal activities within 10 days, per The Aesthetic Society',
        ],
        dots: [
            { x: 24, y: 34, label: 'Waist' },
            { x: 72, y: 24, label: 'Arms' },
            { x: 41, y: 57, label: 'Thighs' },
        ],
    },
    {
        key: 'bbl',
        area: 'Hips & curves',
        title: 'Brazilian butt lift (BBL)',
        body: 'Your own fat, taken by liposuction and moved to the buttocks and hips for more shape and fullness, with no implants. Florida law requires the surgeon to use ultrasound guidance while placing it.',
        facts: [
            `From ${bblFigure('price-starting-at')}`,
            'Ultrasound-guided, as Florida law requires',
            'Desk work at 10 to 14 days, per Cleveland Clinic',
        ],
        dots: [{ x: 66, y: 44, label: 'Hips' }],
    },
    {
        key: 'tummy',
        area: 'Tummy',
        title: 'Tummy tuck',
        body: 'Removes loose skin from the lower abdomen and, where the muscles have separated, repairs them, for a flatter, firmer stomach after pregnancy or weight loss.',
        facts: ['Your price in writing after a free consultation'],
        dots: [{ x: 35, y: 38, label: 'Tummy' }],
    },
    {
        key: 'breast',
        area: 'Breasts',
        title: 'Breast augmentation, lift or reduction',
        body: 'Implants for size and shape, a lift for position, or a reduction for comfort. Which one, and in what size, is decided with your surgeon for your frame.',
        facts: ['Your price in writing after a free consultation'],
        dots: [{ x: 38, y: 27, label: 'Breasts' }],
        more: [
            { label: 'Breast lift', href: '/procedures/breast-lift-miami' },
            {
                label: 'Breast reduction',
                href: '/procedures/breast-reduction-miami',
            },
        ],
    },
    {
        key: 'mommy',
        area: 'After kids',
        title: 'Mommy makeover',
        body: 'A tummy tuck, a breast procedure and liposuction combined in one plan, so the changes pregnancy left are addressed together: one surgery, one recovery.',
        facts: ['Your price in writing after a free consultation'],
        dots: [],
    },
    {
        key: 'weightLoss',
        area: 'After weight loss',
        title: 'Body contouring after weight loss',
        body: 'Loose skin that stays after a big weight loss, including weight lost on GLP-1 medication, doesn’t respond to diet or exercise. A tummy tuck, an arm lift or a body lift removes it, planned in stages or combined.',
        facts: ['Your plan and price in writing after a free consultation'],
        dots: [],
        link: 'After-weight-loss consultations',
        ask: 'Ask about my options',
        more: [{ label: 'Tummy tuck', href: '/procedures/tummy-tuck-miami' }],
    },
    {
        key: 'face',
        area: 'Face & eyes',
        title: 'Facelift & eyelid surgery',
        body: 'A facelift for the jawline and neck; eyelid surgery (blepharoplasty) for heavy upper lids and under-eye bags.',
        facts: ['Your price in writing after a free consultation'],
        dots: [{ x: 50, y: 10.5, label: 'Face' }],
        more: [
            {
                label: 'Eyelid surgery',
                href: '/procedures/blepharoplasty-miami',
            },
        ],
    },
]

const DEFAULT_ZONE: HomeProcedureKey = 'lipo'

const zoneInputId = (key: HomeProcedureKey) => `hp-zone-${key}`

/**
 * "Where do you want to see the change?" A gold line figure with hotspots,
 * a row of areas, and the procedure for the chosen one: what it does, what
 * it costs where the price is settled, a recovery marker, and a button that
 * opens the consultation thread with that procedure already answered.
 *
 * No JavaScript: the areas are a radio group, the hotspots are extra labels
 * for the same radios, and CSS `:has()` shows the chosen panel. Every panel
 * is in the HTML, so crawlers and assistants read all six; a browser
 * without `:has()` shows them stacked.
 */
export function HomeProcedurePicker() {
    return (
        <section
            id={HOME_SECTION_IDS.picker}
            aria-labelledby='picker-title'
            className='hp-defer relative overflow-hidden bg-[var(--hp-ivory)] py-16 md:py-28'
        >
            <div className={homeContainer}>
                <div className='max-w-[44rem]'>
                    <p className={homeEyebrow}>Find your procedure</p>
                    <h2
                        id='picker-title'
                        className={cn(homeHeading, 'mt-4 text-stone-950')}
                    >
                        Where do you want to see{' '}
                        <em className='text-[#8a6c12] italic'>the change?</em>
                    </h2>
                    <p className='mt-5 text-lg leading-relaxed text-stone-600'>
                        You don’t need to know the name of the procedure. Tap
                        the area, and we’ll show you what addresses it and what
                        it costs where we can say.
                    </p>
                </div>

                <div className='hp-map mt-10 grid gap-8 md:mt-14 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-14'>
                    <div className='grid grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] items-center gap-5 sm:grid-cols-[minmax(0,0.6fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:self-start'>
                        {/* The figure, with a hotspot per area. Decorative for
                        assistive technology: the radio group beside it
                        carries the same choice with text labels. */}
                        <div
                            className='relative mx-auto aspect-[700/2135] w-full max-w-[11rem] lg:max-w-[13.5rem]'
                            aria-hidden='true'
                        >
                            <div className='absolute inset-x-[-40%] top-[20%] aspect-square rounded-full bg-[radial-gradient(closest-side,rgba(212,175,55,0.16),transparent)]' />
                            <Image
                                src={HOME_MEDIA.figure}
                                alt=''
                                fill
                                sizes='(width >= 64rem) 14rem, 11rem'
                                className='object-contain'
                            />
                            {ZONES.flatMap((zone) =>
                                zone.dots.map((dot) => (
                                    <label
                                        key={`${zone.key}-${dot.label}`}
                                        htmlFor={zoneInputId(zone.key)}
                                        data-zone={zone.key}
                                        className='hp-dot'
                                        style={
                                            {
                                                '--x': `${dot.x}%`,
                                                '--y': `${dot.y}%`,
                                            } as CSSProperties
                                        }
                                        title={zone.area}
                                    />
                                ))
                            )}
                        </div>

                        <fieldset>
                            <legend className='text-sm font-bold text-stone-950'>
                                Choose an area
                            </legend>
                            <div className='mt-3 flex flex-col items-start gap-2'>
                                {ZONES.map((zone) => (
                                    <span key={zone.key} className='contents'>
                                        <input
                                            type='radio'
                                            name='hp-zone'
                                            id={zoneInputId(zone.key)}
                                            value={zone.key}
                                            defaultChecked={
                                                zone.key === DEFAULT_ZONE
                                            }
                                            className='hp-zone sr-only'
                                        />
                                        <label
                                            htmlFor={zoneInputId(zone.key)}
                                            className='hp-chip cursor-pointer'
                                        >
                                            {zone.area}
                                        </label>
                                    </span>
                                ))}
                            </div>
                        </fieldset>
                    </div>

                    <div>
                        {ZONES.map((zone) => (
                            <ZonePanel key={zone.key} zone={zone} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

function ZonePanel({ zone }: { zone: Zone }) {
    const procedure = HOME_PROCEDURES[zone.key]
    const page = getProcedureBySlug(procedure.href.split('/').pop() ?? '')
    const titleId = `hp-panel-${zone.key}`

    return (
        <article
            data-zone={zone.key}
            aria-labelledby={titleId}
            className={cn(
                'hp-panel mb-6 grid overflow-hidden rounded-[2rem] border border-stone-200/80 bg-white shadow-[0_40px_80px_-50px_rgba(28,25,23,0.45)] last:mb-0',
                page?.image && 'md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]'
            )}
        >
            {page?.image && (
                <div className='relative hidden bg-stone-100 md:block md:min-h-[22rem]'>
                    <Image
                        src={page.image}
                        alt=''
                        fill
                        sizes='(width >= 48rem) 22rem, 100vw'
                        className='object-cover'
                    />
                    <span className='absolute bottom-3 left-3 rounded-full bg-black/45 px-2.5 py-1 text-[0.6875rem] text-white backdrop-blur'>
                        Model shown
                    </span>
                </div>
            )}
            <div className='p-6 md:p-8'>
                <p className='text-[0.75rem] font-bold tracking-[0.18em] text-[#7d6311] uppercase'>
                    {zone.area}
                </p>
                <h3
                    id={titleId}
                    className='mt-2 font-serif text-[1.875rem] leading-tight text-stone-950 md:text-[2.25rem]'
                >
                    {zone.title}
                </h3>
                <p className='mt-3 leading-relaxed text-stone-600'>
                    {zone.body}
                </p>
                <ul className='mt-5 grid gap-2'>
                    {zone.facts.map((fact, index) => (
                        <li
                            key={fact}
                            className={cn(
                                'flex items-start gap-2.5 text-[0.9375rem]',
                                index === 0 && fact.startsWith('From')
                                    ? 'font-bold text-stone-950'
                                    : 'text-stone-700'
                            )}
                        >
                            <span
                                aria-hidden='true'
                                className='bg-gold-400 mt-2 size-1.5 shrink-0 rounded-full'
                            />
                            {fact}
                        </li>
                    ))}
                </ul>
                <div className='mt-6 flex flex-wrap items-center gap-x-5 gap-y-3'>
                    <a
                        href={`#${HOME_CHAT_ID}`}
                        data-consult-procedure={procedure.chat}
                        data-cta='home_picker_ask'
                        className={homePrimaryButton}
                    >
                        {zone.ask ?? `Ask about ${procedure.name}`}
                    </a>
                    <Link
                        href={procedure.href}
                        className={cn(homeLink, 'text-stone-900')}
                    >
                        {zone.link ??
                            `${zone.title.split(/[,(&]/)[0]?.trim()} in detail`}
                    </Link>
                </div>
                {zone.more && (
                    <p className='mt-4 text-sm text-stone-500'>
                        Also:{' '}
                        {zone.more.map((link, index) => (
                            <span key={link.href}>
                                {index > 0 && ' · '}
                                <Link
                                    href={link.href}
                                    className='underline underline-offset-4 hover:text-stone-900'
                                >
                                    {link.label}
                                </Link>
                            </span>
                        ))}
                    </p>
                )}
            </div>
        </article>
    )
}
