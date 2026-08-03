/**
 * AudiencePaths Component
 *
 * Segment-routing section: instead of asking visitors to translate their
 * situation into a procedure name, it states four situations in the
 * visitor's own words and routes each to the consultation page built for
 * that segment.
 *
 * Conversion rationale: most homepage visitors know how they feel, not what
 * the operation is called. Naming the feeling first ("my body changed after
 * kids") qualifies the lead and sends them to a page whose copy already
 * matches their intent, instead of a generic procedure index.
 *
 * Server-rendered — pure content and links, no interactivity.
 */
import Link from 'next/link'
import { ArrowRight, Baby, Plane, Scale, Sparkles } from 'lucide-react'

import { SectionContainer } from '@/components/shared/section-container.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'

type AudiencePath = {
    readonly icon: React.ReactNode
    /** The visitor's situation, in their words. */
    readonly situation: string
    /** What we do about it. */
    readonly answer: string
    readonly label: string
    readonly href: string
}

const AUDIENCE_PATHS: readonly AudiencePath[] = [
    {
        icon: <Baby className='h-5 w-5' />,
        situation: '“My body changed after kids and it never changed back.”',
        answer: 'A mommy makeover combines the procedures that address pregnancy changes together — one surgery, one recovery, one plan.',
        label: 'Mommy Makeover',
        href: '/mommy-makeover-consultation',
    },
    {
        icon: <Scale className='h-5 w-5' />,
        situation: '“I lost the weight. I still don’t look like I did it.”',
        answer: 'Body contouring after major weight loss removes the loose skin that diet and the gym cannot reach.',
        label: 'After Weight Loss',
        href: '/after-weight-loss-consultation',
    },
    {
        icon: <Plane className='h-5 w-5' />,
        situation:
            '“I’d be flying in from out of state — or out of the country.”',
        answer: 'Meet your surgeon by video first, then get your dates in writing so you can book travel around a confirmed schedule. Hablamos Español.',
        label: 'Flying In',
        href: '/fly-in-consultation',
    },
    {
        icon: <Sparkles className='h-5 w-5' />,
        situation: '“I’ve wanted this for years. I keep putting it off.”',
        answer: 'Start with a free, no-pressure consultation. No commitment, no salespeople — just honest answers and a real number.',
        label: 'Start the Conversation',
        href: '/free-consultation',
    },
] as const

export function AudiencePaths() {
    return (
        <SectionContainer
            id='where-you-are'
            variant='default'
            className='bg-stone-50'
            paddingY='py-20 md:py-28'
            ariaLabel='Find the path that matches your situation'
        >
            <ContentWrapper size='lg' paddingX='px-6 md:px-12'>
                {/* Header */}
                <div className='mb-14 max-w-2xl'>
                    <span className='text-gold-500 mb-4 block text-xs font-bold tracking-[0.25em] uppercase'>
                        Start Where You Are
                    </span>
                    <h2 className='mb-5 font-serif text-4xl leading-tight text-stone-900 md:text-5xl'>
                        Which one sounds
                        <span className='text-stone-400 italic'>
                            {' '}
                            like you?
                        </span>
                    </h2>
                    <p className='text-lg leading-relaxed text-stone-600'>
                        You don&apos;t need to know the name of the procedure.
                        You just need to know how you feel about it. Pick the
                        one that fits and we&apos;ll take it from there.
                    </p>
                </div>

                {/* Paths */}
                <ul className='grid gap-6 md:grid-cols-2'>
                    {AUDIENCE_PATHS.map((path) => (
                        <li key={path.href}>
                            <Link
                                href={path.href}
                                className='hover:border-gold-300 group flex h-full flex-col border border-stone-200 bg-white p-8 transition-all duration-300 hover:shadow-xl'
                            >
                                <div className='text-gold-500 border-gold-200 bg-gold-50 mb-6 flex h-11 w-11 items-center justify-center rounded-full border'>
                                    {path.icon}
                                </div>

                                <p className='mb-4 font-serif text-xl leading-snug text-stone-900 md:text-2xl'>
                                    {path.situation}
                                </p>

                                <p className='mb-8 flex-1 leading-relaxed text-stone-600'>
                                    {path.answer}
                                </p>

                                <span className='text-gold-600 group-hover:text-gold-700 mt-auto inline-flex items-center gap-2 text-sm font-bold tracking-widest uppercase'>
                                    {path.label}
                                    <ArrowRight
                                        className='h-4 w-4 transition-transform duration-300 group-hover:translate-x-1'
                                        aria-hidden='true'
                                    />
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </ContentWrapper>
        </SectionContainer>
    )
}
