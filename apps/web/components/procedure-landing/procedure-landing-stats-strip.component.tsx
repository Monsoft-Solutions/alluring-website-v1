/**
 * ProcedureLandingStatsStrip
 *
 * Editorial spec-sheet that gives the visitor concrete answers
 * (duration, anesthesia, recovery, setting) directly after the hero.
 * Designed to read like a magazine sidebar — no boxed pills, just
 * typographic hierarchy with thin gold dividers — so the rhythm
 * established in the hero carries forward.
 */
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import type { ProcedureStats } from '@/lib/types/procedure.type'

export type ProcedureLandingStatsStripProps = {
    readonly id?: string
    readonly stats: ProcedureStats
}

export function ProcedureLandingStatsStrip({
    id = 'quick-stats',
    stats,
}: ProcedureLandingStatsStripProps) {
    const items = [
        { label: 'Duration', value: stats.duration },
        { label: 'Anesthesia', value: stats.anesthesia },
        { label: 'Recovery', value: stats.recovery },
        { label: 'Results', value: stats.results },
    ]

    if (stats.inpatientOutpatient) {
        items.push({
            label: 'Setting',
            value: stats.inpatientOutpatient,
        })
    }

    return (
        <SectionContainer
            id={id}
            variant='default'
            className='relative border-y border-stone-200/70 bg-stone-50'
            paddingY='py-14 lg:py-20'
        >
            {/* Subtle warm wash — keeps the section from reading as a hard
                white block against the dark hero above */}
            <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-amber-50/40 to-transparent'
            />

            <ContentWrapper size='xl' paddingX='px-6 md:px-12'>
                {/* Editorial section header — chapter marker, gold hairline,
                    italic-serif subhead */}
                <header className='mb-10 flex flex-col items-center gap-2 text-center md:mb-14'>
                    <div className='flex w-full max-w-md items-center gap-4'>
                        <span
                            aria-hidden='true'
                            className='h-px flex-1 bg-gradient-to-l from-amber-500/40 to-transparent'
                        />
                        <span className='font-serif text-[11px] tracking-[0.4em] text-amber-700 uppercase'>
                            №02 — The Honest Answers
                        </span>
                        <span
                            aria-hidden='true'
                            className='h-px flex-1 bg-gradient-to-r from-amber-500/40 to-transparent'
                        />
                    </div>
                    <h2 className='font-serif text-2xl text-stone-900 italic md:text-3xl'>
                        What this actually looks like.
                    </h2>
                </header>

                {/* Editorial data sheet — clean typography hierarchy, thin gold
                    dividers, no boxed pills */}
                <dl
                    className='mx-auto grid max-w-5xl grid-cols-2 gap-y-8 md:grid-cols-4 lg:grid-cols-5'
                    aria-label='Procedure quick facts'
                >
                    {items.map((item, idx) => (
                        <div
                            key={item.label}
                            className={
                                idx === 0
                                    ? 'px-4 sm:px-6'
                                    : 'border-amber-500/20 px-4 sm:px-6 md:border-l'
                            }
                        >
                            <dt className='font-sans text-[10px] tracking-[0.32em] text-amber-700/90 uppercase'>
                                {item.label}
                            </dt>
                            <dd className='mt-2 font-serif text-lg leading-snug text-stone-900 md:text-xl'>
                                {item.value}
                            </dd>
                        </div>
                    ))}
                </dl>
            </ContentWrapper>
        </SectionContainer>
    )
}
