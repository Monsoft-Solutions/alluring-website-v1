import type { ReactNode } from 'react'
import { cn } from '@workspace/ui/lib/utils'

type AnswerBlockProps = {
    /** Anchor for jump links, e.g. "pricing". The heading gets `{id}-heading`. */
    id: string
    /** The heading, phrased as the question people search. */
    question: string
    /** The direct answer: 40–60 words, first under the heading. */
    answer: ReactNode
    /** Supporting content after the answer, laid out by the caller. */
    children?: ReactNode
    /** `dark` for a section on stone-900. */
    tone?: 'light' | 'dark'
    /** Extra classes for the answer paragraph, e.g. a `speakable` hook. */
    answerClassName?: string
    className?: string
}

/**
 * A question-phrased section that answers first.
 *
 * The heading is the query; the first paragraph under it is the complete
 * answer, so a reader — or an AI engine lifting one passage — gets it without
 * reading on. Everything else follows as `children`, which the caller lays
 * out. The answer paragraph carries `answer-block__answer` so a `speakable`
 * selector can target it.
 *
 * Server component; no client JavaScript.
 */
export function AnswerBlock({
    id,
    question,
    answer,
    children,
    tone = 'light',
    answerClassName,
    className,
}: AnswerBlockProps) {
    const headingId = `${id}-heading`
    const dark = tone === 'dark'

    return (
        <section
            id={id}
            aria-labelledby={headingId}
            className={cn(
                'answer-block scroll-mt-32 lg:scroll-mt-40',
                className
            )}
        >
            <h2
                id={headingId}
                className={cn(
                    'font-serif text-[1.75rem] leading-[1.2] font-medium text-balance md:text-[2.375rem] md:leading-[1.15]',
                    dark ? 'text-stone-50' : 'text-stone-900'
                )}
            >
                {question}
            </h2>
            <p
                className={cn(
                    'answer-block__answer mt-4 max-w-[41.25rem] text-[1.0625rem] leading-[1.6] tabular-nums md:mt-5 md:text-lg md:leading-[1.65]',
                    dark ? 'text-stone-200' : 'text-stone-700',
                    answerClassName
                )}
            >
                {answer}
            </p>
            {children}
        </section>
    )
}
