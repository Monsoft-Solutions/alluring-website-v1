import type { ReactNode } from 'react'
import { cn } from '@workspace/ui/lib/utils'

import { bmiEyebrow, bmiHeading } from './bmi-page.constant'

/**
 * A question-phrased section that answers first, in the page's display type.
 *
 * Same contract as the procedure kit's `AnswerBlock`
 * (`components/procedures/sections/answer-block.component.tsx`): the
 * `answer-block` section, its H2 phrased as the search, and the direct
 * 40–60-word answer as the first paragraph (`answer-block__answer`), which
 * the copy sweep measures and a `speakable` selector can lift. The heading
 * takes a node so one word can be set in italic.
 */
export function BmiAnswerSection({
    id,
    eyebrow,
    question,
    answer,
    children,
    tone = 'light',
    className,
    headerClassName,
}: {
    id: string
    eyebrow?: string
    /** The H2, phrased as the search, with one word in `<em>`. */
    question: ReactNode
    /** The direct answer: 40–60 words. */
    answer: ReactNode
    children?: ReactNode
    tone?: 'light' | 'dark'
    className?: string
    /** Classes for the eyebrow, heading and answer's wrapper. */
    headerClassName?: string
}) {
    const dark = tone === 'dark'
    return (
        <section
            id={id}
            aria-labelledby={`${id}-heading`}
            className={cn('answer-block', className)}
        >
            <div className={cn('max-w-[46rem]', headerClassName)}>
                {eyebrow && (
                    <p
                        className={cn(
                            bmiEyebrow,
                            dark ? 'text-gold-300' : 'text-gold-700'
                        )}
                    >
                        {eyebrow}
                    </p>
                )}
                <h2
                    id={`${id}-heading`}
                    className={cn(
                        bmiHeading,
                        eyebrow && 'mt-4',
                        dark ? 'text-stone-50' : 'text-stone-900'
                    )}
                >
                    {question}
                </h2>
                <p
                    className={cn(
                        'answer-block__answer mt-5 text-[1.0625rem] leading-[1.65] text-pretty md:text-[1.1875rem]',
                        dark ? 'text-stone-300' : 'text-stone-700'
                    )}
                >
                    {answer}
                </p>
            </div>
            {children}
        </section>
    )
}
