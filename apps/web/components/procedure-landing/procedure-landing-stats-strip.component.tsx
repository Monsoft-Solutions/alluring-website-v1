/**
 * ProcedureLandingStatsStrip
 *
 * Quiet quick-facts strip that anchors the hero with concrete answers
 * (duration, anesthesia, recovery, setting). Mirrors the rhythm of the
 * doctor-landing "trust strip" so visitors who scroll past the form
 * keep absorbing reassurance.
 */
import { Activity, Clock, Hotel, Sparkles, Syringe } from 'lucide-react'

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
        { icon: Clock, label: 'Duration', value: stats.duration },
        { icon: Syringe, label: 'Anesthesia', value: stats.anesthesia },
        { icon: Activity, label: 'Recovery', value: stats.recovery },
        { icon: Sparkles, label: 'Results', value: stats.results },
    ]

    if (stats.inpatientOutpatient) {
        items.push({
            icon: Hotel,
            label: 'Setting',
            value: stats.inpatientOutpatient,
        })
    }

    return (
        <SectionContainer
            id={id}
            variant='default'
            className='relative border-y border-stone-200/70 bg-stone-50'
            paddingY='py-10 lg:py-12'
        >
            <ContentWrapper size='xl' paddingX='px-6 md:px-12'>
                <div className='mb-6 flex flex-col items-center gap-1 text-center'>
                    <p className='text-gold-600 text-xs font-bold tracking-[0.22em] uppercase'>
                        The honest answers
                    </p>
                    <p className='font-serif text-lg text-stone-800'>
                        What this actually looks like.
                    </p>
                </div>
                <ul
                    className='grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5'
                    aria-label='Procedure quick facts'
                >
                    {items.map((item) => (
                        <li
                            key={item.label}
                            className='group hover:border-gold-300/70 flex items-center gap-3 rounded-xl border border-stone-200/80 bg-white px-3 py-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md'
                        >
                            <span className='border-gold-500/30 bg-gold-500/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border'>
                                <item.icon className='text-gold-600 h-4 w-4' />
                            </span>
                            <div className='min-w-0'>
                                <p className='text-[10px] font-bold tracking-[0.18em] text-stone-500 uppercase'>
                                    {item.label}
                                </p>
                                <p className='truncate text-sm font-medium text-stone-900'>
                                    {item.value}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            </ContentWrapper>
        </SectionContainer>
    )
}
