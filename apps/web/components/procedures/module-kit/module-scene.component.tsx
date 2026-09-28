import Link from 'next/link'
import type { ReactNode } from 'react'
import { Phone } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

import { sourceAnchorId } from '@/components/procedures/sections/sources-list.component'
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

/** One rule of the law, or one finding: a bold title over its body. */
export type ModuleSceneItem = { title: string; body: ReactNode }

/** A finding, with the source it links to in the page's source list. */
export type ModuleSceneEvidence = ModuleSceneItem & { sourceId: string }

/** A source named under the law's heading, linked to the source list. */
export type ModuleSceneSource = { label: string; sourceId: string }

/**
 * The diagram column's width from `lg`, beside the 40 rem reading column:
 * `wide` for a drawing with room to label (BBL's layers), `narrow` for a
 * tall, thin one (liposuction's scale).
 */
const DIAGRAM_COLUMNS = {
    wide: 'lg:grid-cols-[minmax(0,40rem)_28.75rem]',
    narrow: 'lg:grid-cols-[minmax(0,40rem)_24rem]',
} as const

export type ModuleSceneSectionProps = {
    /** The section's anchor; the jump nav's "Safety" points at it. */
    id?: string
    /** The H2, phrased as her question, e.g. "Is a BBL safe in Miami?" */
    question: string
    /** The direct answer, 40–60 words. */
    answer: ReactNode
    /**
     * The procedure's signature diagram, page-owned: it sits between the
     * answer and the law on phones and stays pinned beside the reading
     * column from `lg`.
     */
    diagram: ReactNode
    diagramWidth?: keyof typeof DIAGRAM_COLUMNS
    /** Tabular figures in the answer and the law's titles, for copy full of numbers. */
    tabularFigures?: boolean
    /** What the law requires, with the sources it rests on. */
    law: {
        heading: string
        sources: ModuleSceneSource[]
        items: ModuleSceneItem[]
    }
    /** What the research shows, each finding linked to its source. */
    evidence: {
        heading?: string
        items: ModuleSceneEvidence[]
        /** A closing link to the post that goes further. */
        link?: { label: string; href: string }
    }
    /** The questions to ask any surgeon, closing the band. */
    checklist?: {
        heading: string
        questions: string[]
        note?: string
    }
}

/**
 * The signature scene's layout, in the page's one dark band: the question
 * and its answer, the page's own diagram, what the law requires, what the
 * research shows, then the questions to ask any surgeon. The diagram sits
 * between the answer and the law on phones, and stays pinned beside the
 * reading column from `lg`.
 *
 * Every procedure page tells its safety story this way, so the layout lives
 * here and the page passes its copy and its diagram. Figures in the copy
 * come from the page's facts file, like everywhere else on the page.
 */
export function ModuleSceneSection({
    id = 'safety',
    question,
    answer,
    diagram,
    diagramWidth = 'wide',
    tabularFigures = false,
    law,
    evidence,
    checklist,
}: ModuleSceneSectionProps) {
    const headingId = `${id}-heading`

    return (
        <ModuleScene>
            <section
                id={id}
                aria-labelledby={headingId}
                className={`answer-block grid scroll-mt-32 lg:scroll-mt-40 ${DIAGRAM_COLUMNS[diagramWidth]} lg:grid-rows-[auto_auto_1fr] lg:justify-between lg:gap-x-16`}
            >
                <h2
                    id={headingId}
                    className='font-serif text-[1.75rem] leading-[1.2] font-medium text-balance text-stone-50 md:text-[2.375rem] md:leading-[1.15] lg:col-start-1 lg:row-start-1'
                >
                    {question}
                </h2>
                <p
                    className={[
                        'answer-block__answer mt-4 text-[1.0625rem] leading-[1.6] text-stone-200',
                        tabularFigures && 'tabular-nums',
                        'md:mt-5 md:text-lg md:leading-[1.65] lg:col-start-1 lg:row-start-2',
                    ]
                        .filter(Boolean)
                        .join(' ')}
                >
                    {answer}
                </p>
                <div className='mt-8 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:mt-0'>
                    <div className='lg:sticky lg:top-40'>{diagram}</div>
                </div>
                <div className='lg:col-start-1 lg:row-start-3'>
                    <h3 className={cn(moduleH3Dark, 'mt-10 md:mt-12')}>
                        {law.heading}
                    </h3>
                    <p className='mt-1.5 text-sm text-stone-400'>
                        {/* One flat run of links and separators, the
                            separator as three text nodes: the markup a
                            hand-written " · " between two links makes. */}
                        {law.sources.flatMap((source, index) => [
                            ...(index > 0 ? [' ', '·', ' '] : []),
                            <a
                                key={source.sourceId}
                                href={`#${sourceAnchorId(source.sourceId)}`}
                                className='underline decoration-stone-600 underline-offset-4 hover:text-stone-200'
                            >
                                {source.label}
                            </a>,
                        ])}
                    </p>
                    <ul className='mt-5 flex flex-col gap-4.5'>
                        {law.items.map((item) => (
                            <li
                                key={item.title}
                                className='grid grid-cols-[0.5rem_minmax(0,1fr)] gap-x-3.5'
                            >
                                <span
                                    aria-hidden='true'
                                    className='bg-gold-400 mt-2.5 size-2'
                                />
                                <div>
                                    <p
                                        className={`text-[1.0625rem] leading-[1.55] font-bold text-stone-100${tabularFigures ? ' tabular-nums' : ''}`}
                                    >
                                        {item.title}
                                    </p>
                                    <p className={cn(moduleBodyDark, 'mt-0.5')}>
                                        {item.body}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <h3 className={cn(moduleH3Dark, 'mt-10 md:mt-12')}>
                        {evidence.heading ?? 'What the research shows'}
                    </h3>
                    <div className='mt-4.5 flex flex-col gap-6'>
                        {evidence.items.map((item) => (
                            <div key={item.title}>
                                <p className='text-[1.0625rem] leading-[1.55] font-bold text-stone-100'>
                                    {item.title}
                                </p>
                                <p
                                    className={cn(
                                        moduleBodyDark,
                                        'mt-1 tabular-nums'
                                    )}
                                >
                                    {item.body}{' '}
                                    <a
                                        href={`#${sourceAnchorId(item.sourceId)}`}
                                        className='text-sm whitespace-nowrap text-stone-400 underline decoration-stone-600 underline-offset-4 hover:text-stone-200'
                                    >
                                        Source
                                    </a>
                                </p>
                            </div>
                        ))}
                    </div>
                    {evidence.link ? (
                        <p className={cn(moduleBodyDark, 'mt-6')}>
                            <Link
                                href={evidence.link.href}
                                className='decoration-gold-400 text-stone-100 underline underline-offset-4 hover:text-white'
                            >
                                {evidence.link.label}
                            </Link>
                        </p>
                    ) : null}
                </div>
            </section>

            {checklist ? (
                <ModuleAskAnySurgeon
                    heading={checklist.heading}
                    questions={checklist.questions}
                    note={checklist.note}
                />
            ) : null}
        </ModuleScene>
    )
}
