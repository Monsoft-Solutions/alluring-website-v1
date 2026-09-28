import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@workspace/ui/lib/utils'

import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'

import type { ModuleGuide } from './module-steps.component'
import { moduleH3, moduleLink, moduleSectionPad } from './module-ui.constant'

/** One reason another procedure may suit her better, with where to read on. */
export type ModuleCandidateAlternative = {
    /** Her situation, e.g. "Loose skin is the main concern". */
    concern: string
    /** What that means for this procedure, and what may suit her instead. */
    body: ReactNode
    /** The page for the procedure that may suit her better. */
    link?: ModuleGuide
}

/**
 * "Am I a good candidate for …?" Answers the question that decides whether
 * she books this consultation at all, including when another procedure
 * suits her better: who it may suit, then the situations where another
 * option may, each linked to that procedure's page. The posts that own the
 * full checklist or comparison are linked under both columns, not repeated.
 */
export function ModuleCandidate({
    id = 'candidate',
    question,
    answer,
    suitsHeading,
    suits,
    elsewhereHeading = 'Another option may suit you better if',
    elsewhere,
    guides = [],
}: {
    /** The section's anchor. */
    id?: string
    /** e.g. "Am I a good candidate for liposuction?" */
    question: string
    /** The direct answer, 40–60 words. */
    answer: ReactNode
    /** e.g. "Liposuction may suit you if". */
    suitsHeading: string
    suits: string[]
    elsewhereHeading?: string
    elsewhere: ModuleCandidateAlternative[]
    /** The posts that go deeper, e.g. a tummy tuck vs liposuction guide. */
    guides?: ModuleGuide[]
}) {
    return (
        <AnswerBlock
            id={id}
            question={question}
            className={moduleSectionPad}
            answer={answer}
        >
            <div className='mt-9 grid gap-9 md:grid-cols-2 md:gap-10'>
                <div>
                    <h3 className={moduleH3}>{suitsHeading}</h3>
                    <ul className='mt-4 flex flex-col gap-3'>
                        {suits.map((item) => (
                            <li
                                key={item}
                                className='grid grid-cols-[0.5rem_minmax(0,1fr)] gap-x-3.5 text-[1.0625rem] leading-[1.55] text-stone-800'
                            >
                                <span
                                    aria-hidden='true'
                                    className='bg-gold-500 mt-2.5 size-2 rounded-full'
                                />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3 className={moduleH3}>{elsewhereHeading}</h3>
                    <dl className='mt-4 flex flex-col gap-4'>
                        {elsewhere.map((item) => (
                            <div
                                key={item.concern}
                                className='border-t border-stone-200 pt-3'
                            >
                                <dt className='text-[1.0625rem] leading-[1.45] font-bold text-stone-900'>
                                    {item.concern}
                                </dt>
                                <dd className='mt-1 text-[1.0625rem] leading-[1.6] text-stone-700 md:text-base'>
                                    {item.body}
                                    {item.link && (
                                        <>
                                            {' '}
                                            <Link
                                                href={item.link.href}
                                                className={moduleLink}
                                            >
                                                {item.link.label}
                                            </Link>
                                        </>
                                    )}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
            {guides.length > 0 && (
                <ul className='mt-8 flex flex-col gap-1 border-t border-stone-200 pt-6'>
                    {guides.map((guide) => (
                        <li key={guide.href}>
                            <Link
                                href={guide.href}
                                className={cn(
                                    moduleLink,
                                    'inline-flex min-h-11 items-center text-base font-bold'
                                )}
                            >
                                {guide.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </AnswerBlock>
    )
}
