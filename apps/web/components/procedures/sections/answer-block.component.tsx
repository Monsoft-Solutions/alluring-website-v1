import type { ReactNode } from 'react'
import { cn } from '@workspace/ui/lib/utils'

type AnswerBlockProps = {
    /** Anchor for jump links, e.g. "pricing". The heading gets `{id}-heading`. */
    id: string
    /** The heading, phrased as the question people search. */
    question: string
    /** The direct answer: 40–60 words, first under the heading. */
    answer: string
    /** Supporting content after the answer. */
    children?: ReactNode
    className?: string
}

/**
 * A question-phrased section that answers first.
 *
 * The heading is the query; the first paragraph under it is the complete
 * answer, so a reader — or an AI engine lifting one passage — gets it without
 * reading on. Everything else follows as `children`. The answer paragraph
 * carries `answer-block__answer` so a `speakable` selector can target it.
 *
 * Server component; no client JavaScript.
 */
export function AnswerBlock({
    id,
    question,
    answer,
    children,
    className,
}: AnswerBlockProps) {
    const headingId = `${id}-heading`

    return (
        <section
            id={id}
            aria-labelledby={headingId}
            className={cn('answer-block scroll-mt-24', className)}
        >
            <h2
                id={headingId}
                className='mb-5 font-serif text-3xl text-balance text-stone-900 md:text-4xl'
            >
                {question}
            </h2>
            <p className='answer-block__answer mb-6 max-w-[68ch] text-lg leading-relaxed text-stone-700'>
                {answer}
            </p>
            {children && (
                <div className='max-w-[68ch] text-base leading-relaxed text-stone-700 md:text-lg'>
                    {children}
                </div>
            )}
        </section>
    )
}
