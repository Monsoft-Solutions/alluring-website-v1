'use client'

import { useState } from 'react'
import {
    Clock,
    BedDouble,
    Footprints,
    Briefcase,
    Dumbbell,
    Sparkles,
    ChevronRight,
} from 'lucide-react'

import { cn } from '@workspace/ui/lib/utils'

import { SectionContainer } from '../shared/section-container.component'
import { ContentWrapper } from '../shared/content-wrapper.component'

/**
 * Timeline phase type
 */
type TimelinePhase = {
    readonly period: string
    readonly title: string
    readonly icon: React.ReactNode
    readonly description: string
    readonly tips: string[]
}

/**
 * Procedure recovery data type
 */
type ProcedureRecovery = {
    readonly id: string
    readonly name: string
    readonly timeline: TimelinePhase[]
}

/**
 * Recovery Timeline Component
 *
 * Displays interactive recovery timeline for popular procedures.
 * Client component for tab interactivity.
 *
 * Features:
 * - Visual timeline with milestone icons
 * - Procedure-specific tabs (BBL, Breast Aug, Tummy Tuck)
 * - Key recovery milestones
 * - Featured snippet optimized content
 */
export function RecoveryTimeline() {
    const procedures: ProcedureRecovery[] = [
        {
            id: 'bbl',
            name: 'BBL',
            timeline: [
                {
                    period: 'Day 1',
                    title: 'Surgery Day',
                    icon: <BedDouble className='h-5 w-5' />,
                    description:
                        'Discharged the same day to rest wherever you are staying. Expect soreness and swelling, and plan to have someone with you.',
                    tips: [
                        'Use BBL pillow for all sitting',
                        'Take prescribed medications',
                        'Stay hydrated',
                    ],
                },
                {
                    period: 'Week 1',
                    title: 'Initial Healing',
                    icon: <Footprints className='h-5 w-5' />,
                    description:
                        'Light walking encouraged. Compression garment worn 24/7. Most swelling peaks.',
                    tips: [
                        'Short walks every 2-3 hours',
                        'Sleep on stomach or side',
                        'Avoid sitting directly',
                    ],
                },
                {
                    period: 'Week 2-3',
                    title: 'Light Activities',
                    icon: <Briefcase className='h-5 w-5' />,
                    description:
                        'Return to desk work with modifications. Swelling begins to decrease.',
                    tips: [
                        'Continue compression garment',
                        'Use BBL pillow at work',
                        'Gentle stretching okay',
                    ],
                },
                {
                    period: 'Month 1-2',
                    title: 'Gradual Return',
                    icon: <Dumbbell className='h-5 w-5' />,
                    description:
                        'Most normal activities resume. Light exercise begins at week 6.',
                    tips: [
                        'Start light cardio at 6 weeks',
                        'Avoid direct pressure on grafts',
                        'Massage may begin if cleared',
                    ],
                },
                {
                    period: 'Month 3-6',
                    title: 'Final Results',
                    icon: <Sparkles className='h-5 w-5' />,
                    description:
                        'Final shape emerges as swelling fully resolves. Full activity resumes.',
                    tips: [
                        'Results continue improving',
                        'Maintain stable weight',
                        'Share your transformation!',
                    ],
                },
            ],
        },
        {
            id: 'breast',
            name: 'Breast Augmentation',
            timeline: [
                {
                    period: 'Day 1',
                    title: 'Surgery Day',
                    icon: <BedDouble className='h-5 w-5' />,
                    description:
                        'Rest at home with support. Surgical bra provided. Mild to moderate discomfort.',
                    tips: [
                        'Keep upper body elevated',
                        'Take medications as directed',
                        'Ice packs for comfort',
                    ],
                },
                {
                    period: 'Week 1',
                    title: 'Initial Healing',
                    icon: <Footprints className='h-5 w-5' />,
                    description:
                        'Light walking encouraged. Avoid lifting arms above shoulder level.',
                    tips: [
                        'Wear surgical bra 24/7',
                        'No driving while on medications',
                        'Sleep on back',
                    ],
                },
                {
                    period: 'Week 2-3',
                    title: 'Back to Work',
                    icon: <Briefcase className='h-5 w-5' />,
                    description:
                        'Most patients return to desk jobs. Bruising fades, swelling decreases.',
                    tips: [
                        'No heavy lifting (>10 lbs)',
                        'Transition to support bra',
                        'Keep incisions clean',
                    ],
                },
                {
                    period: 'Week 4-6',
                    title: 'Exercise Returns',
                    icon: <Dumbbell className='h-5 w-5' />,
                    description:
                        'Lower body exercise resumes. Upper body at 6 weeks if cleared.',
                    tips: [
                        'Start with light cardio',
                        'Sports bra for exercise',
                        'Avoid high-impact activities',
                    ],
                },
                {
                    period: 'Month 3-6',
                    title: 'Final Results',
                    icon: <Sparkles className='h-5 w-5' />,
                    description:
                        'Implants settle into final position. Shape continues to soften.',
                    tips: [
                        'Results keep improving',
                        'Follow-up as scheduled',
                        'Enjoy your new confidence!',
                    ],
                },
            ],
        },
        {
            id: 'tummy',
            name: 'Tummy Tuck',
            timeline: [
                {
                    period: 'Day 1-3',
                    title: 'Surgery & Rest',
                    icon: <BedDouble className='h-5 w-5' />,
                    description:
                        'Rest in a reclined position. Drains may be in place. Walking hunched over is normal.',
                    tips: [
                        'Keep partially reclined',
                        'Use pillows under knees',
                        'Empty drains as instructed',
                    ],
                },
                {
                    period: 'Week 1-2',
                    title: 'Limited Mobility',
                    icon: <Footprints className='h-5 w-5' />,
                    description:
                        'Gradually stand straighter. Drains typically removed week 1-2.',
                    tips: [
                        'Short walks several times daily',
                        'Compression garment 24/7',
                        'Continue blood thinners if prescribed',
                    ],
                },
                {
                    period: 'Week 3-4',
                    title: 'Increasing Activity',
                    icon: <Briefcase className='h-5 w-5' />,
                    description:
                        'Return to desk work. Most patients driving again. Swelling fluctuates.',
                    tips: [
                        'Light daily activities okay',
                        'No core exercises yet',
                        'Keep incision moisturized',
                    ],
                },
                {
                    period: 'Week 6-8',
                    title: 'Exercise Begins',
                    icon: <Dumbbell className='h-5 w-5' />,
                    description:
                        'Light exercise approved. Core strengthening begins gradually.',
                    tips: [
                        'Start with walking/elliptical',
                        'Avoid heavy abdominal strain',
                        'Listen to your body',
                    ],
                },
                {
                    period: 'Month 3-6',
                    title: 'Final Results',
                    icon: <Sparkles className='h-5 w-5' />,
                    description:
                        'Scar fades significantly. Final contour visible. Full activity resumes.',
                    tips: [
                        'Scar massage helps healing',
                        'Sun protection on scar',
                        'Maintain healthy lifestyle',
                    ],
                },
            ],
        },
    ]

    const [activeProcedure, setActiveProcedure] = useState<string>('bbl')

    const currentProcedure = procedures.find((p) => p.id === activeProcedure)

    if (!currentProcedure) {
        return null
    }

    return (
        <SectionContainer
            id='recovery'
            variant='default'
            className='relative overflow-hidden bg-stone-100'
            paddingY='py-24 lg:py-32'
            ariaLabel='Recovery timeline information'
        >
            <ContentWrapper size='lg' paddingX='px-6 md:px-12'>
                {/* Header */}
                <div className='mb-12 max-w-2xl'>
                    <span className='text-gold-500 mb-4 block text-sm font-bold tracking-widest uppercase'>
                        Recovery Guide
                    </span>
                    <h2 className='mb-6 font-serif text-4xl leading-tight text-stone-900 md:text-5xl'>
                        What to Expect{' '}
                        <span className='text-stone-400 italic'>
                            After Surgery
                        </span>
                    </h2>
                    <p
                        className='text-xl leading-relaxed font-light text-stone-600'
                        data-speakable='true'
                    >
                        Understanding your recovery timeline helps you plan for
                        time off work, arrange help at home, and set realistic
                        expectations for your results.
                    </p>
                </div>

                {/* Procedure Tabs */}
                <div className='mb-10 flex flex-wrap gap-2'>
                    {procedures.map((procedure) => (
                        <button
                            key={procedure.id}
                            onClick={() => setActiveProcedure(procedure.id)}
                            className={cn(
                                'rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200',
                                activeProcedure === procedure.id
                                    ? 'bg-gold-500 text-stone-900 shadow-md'
                                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                            )}
                            aria-pressed={activeProcedure === procedure.id}
                        >
                            {procedure.name}
                        </button>
                    ))}
                </div>

                {/* Timeline */}
                <div className='relative'>
                    {/* Horizontal Line - Desktop */}
                    <div
                        className='from-gold-400 via-gold-400 absolute top-8 left-0 hidden h-0.5 w-full bg-gradient-to-r to-stone-200 lg:block'
                        aria-hidden='true'
                    />

                    {/* Vertical Line - Mobile */}
                    <div
                        className='from-gold-400 via-gold-400 absolute top-0 left-8 h-full w-0.5 bg-gradient-to-b to-stone-200 lg:hidden'
                        aria-hidden='true'
                    />

                    {/* Timeline Phases */}
                    <div className='grid gap-8 lg:grid-cols-5 lg:gap-4'>
                        {currentProcedure.timeline.map((phase, index) => (
                            <div
                                key={index}
                                className='relative flex gap-6 lg:flex-col lg:items-center lg:gap-4'
                            >
                                {/* Timeline Node */}
                                <div
                                    className={cn(
                                        'relative z-10 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300',
                                        index === 0
                                            ? 'bg-gold-500 border-gold-500 text-stone-900'
                                            : 'hover:border-gold-300 hover:text-gold-500 border-stone-200 bg-white text-stone-400'
                                    )}
                                >
                                    {phase.icon}
                                </div>

                                {/* Content */}
                                <div className='flex-1 lg:text-center'>
                                    <div className='mb-2'>
                                        <span className='text-gold-500 text-xs font-bold tracking-wider uppercase'>
                                            {phase.period}
                                        </span>
                                        <h3 className='font-serif text-lg font-medium text-stone-900'>
                                            {phase.title}
                                        </h3>
                                    </div>
                                    <p className='mb-3 text-sm leading-relaxed text-stone-600'>
                                        {phase.description}
                                    </p>
                                    <ul className='space-y-1'>
                                        {phase.tips.map((tip, tipIndex) => (
                                            <li
                                                key={tipIndex}
                                                className='flex items-start gap-1.5 text-xs text-stone-500 lg:justify-center'
                                            >
                                                <ChevronRight className='text-gold-400 mt-0.5 h-3 w-3 flex-shrink-0' />
                                                <span>{tip}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Important Note */}
                <div className='mt-12 flex items-start gap-3 rounded-lg border border-stone-200 bg-stone-50 p-5'>
                    <Clock className='text-gold-500 mt-0.5 h-5 w-5 flex-shrink-0' />
                    <div>
                        <p className='text-sm font-medium text-stone-900'>
                            Recovery varies by individual
                        </p>
                        <p className='text-sm text-stone-600'>
                            These timelines are general guidelines. Your surgeon
                            will provide personalized instructions based on your
                            specific procedure and healing progress.
                        </p>
                    </div>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
