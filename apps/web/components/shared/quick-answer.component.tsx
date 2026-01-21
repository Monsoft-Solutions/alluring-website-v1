/**
 * QuickAnswer Component
 *
 * Optimized for AI citations and voice search. Provides structured content
 * that LLMs (ChatGPT, Claude, Perplexity) can easily extract and quote.
 *
 * Uses semantic HTML with schema.org Question/Answer markup for SEO
 * and machine readability. The structure follows the pattern:
 * 1. Direct answer (first 20-30 words)
 * 2. Supporting details (2-3 sentences)
 * 3. Optional expert attribution (builds E-E-A-T)
 *
 * @example
 * ```tsx
 * <QuickAnswer
 *   question="What is a Brazilian Butt Lift (BBL)?"
 *   answer="A Brazilian Butt Lift is a cosmetic procedure that uses fat transfer to enhance the shape and size of the buttocks."
 *   details="The procedure involves harvesting fat from areas like the abdomen or thighs via liposuction, purifying it, and then injecting it into the buttocks for natural-looking volume and contour."
 *   expert={{ name: "Dr. Smith", credentials: "Board-Certified Plastic Surgeon" }}
 * />
 * ```
 */
import { cn } from '@workspace/ui/lib/utils'

export type QuickAnswerExpert = {
    name: string
    credentials?: string
    url?: string
}

export type QuickAnswerProps = {
    /** The question being answered */
    question: string
    /** Direct, concise answer (ideally 20-30 words) */
    answer: string
    /** Optional supporting details (2-3 sentences) */
    details?: string
    /** Optional expert attribution for E-E-A-T */
    expert?: QuickAnswerExpert
    /** Optional className for customization */
    className?: string
    /** Whether to use h2 (default) or h3 for the question */
    headingLevel?: 'h2' | 'h3'
    /** Optional ID for anchor links */
    id?: string
}

export function QuickAnswer({
    question,
    answer,
    details,
    expert,
    className,
    headingLevel = 'h2',
    id,
}: QuickAnswerProps) {
    const Heading = headingLevel

    return (
        <section
            id={id}
            className={cn(
                'quick-answer rounded-xl border border-stone-200 bg-stone-50/50 p-6 md:p-8',
                className
            )}
            itemScope
            itemType='https://schema.org/Question'
        >
            {/* Question */}
            <Heading
                itemProp='name'
                className='mb-4 font-serif text-xl font-semibold text-stone-900 md:text-2xl'
            >
                {question}
            </Heading>

            {/* Answer Container */}
            <div
                itemScope
                itemType='https://schema.org/Answer'
                itemProp='acceptedAnswer'
            >
                {/* Direct Answer - The most quotable content for AI */}
                <p
                    itemProp='text'
                    className='article-summary mb-3 text-lg leading-relaxed font-medium text-stone-800 md:text-xl'
                >
                    {answer}
                </p>

                {/* Supporting Details */}
                {details && (
                    <p className='text-base leading-relaxed text-stone-600'>
                        {details}
                    </p>
                )}

                {/* Expert Attribution */}
                {expert && (
                    <div
                        className='mt-4 border-t border-stone-200 pt-4'
                        itemScope
                        itemType='https://schema.org/Person'
                        itemProp='author'
                    >
                        {expert.url ? (
                            <a
                                href={expert.url}
                                className='hover:text-gold-600 text-sm text-stone-500 transition-colors'
                            >
                                <span className='text-stone-400'>—</span>{' '}
                                <span itemProp='name'>{expert.name}</span>
                                {expert.credentials && (
                                    <span itemProp='jobTitle'>
                                        , {expert.credentials}
                                    </span>
                                )}
                            </a>
                        ) : (
                            <p className='text-sm text-stone-500'>
                                <span className='text-stone-400'>—</span>{' '}
                                <span itemProp='name'>{expert.name}</span>
                                {expert.credentials && (
                                    <span itemProp='jobTitle'>
                                        , {expert.credentials}
                                    </span>
                                )}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </section>
    )
}

/**
 * QuickAnswerList Component
 *
 * Renders multiple QuickAnswer components in a list format.
 * Useful for FAQ sections optimized for AI citations.
 */
export type QuickAnswerListProps = {
    items: Omit<QuickAnswerProps, 'headingLevel'>[]
    className?: string
    /** Whether to use h2 (default) or h3 for questions */
    headingLevel?: 'h2' | 'h3'
}

export function QuickAnswerList({
    items,
    className,
    headingLevel = 'h3',
}: QuickAnswerListProps) {
    return (
        <div className={cn('space-y-6', className)}>
            {items.map((item, index) => (
                <QuickAnswer
                    key={item.id || `quick-answer-${index}`}
                    {...item}
                    headingLevel={headingLevel}
                />
            ))}
        </div>
    )
}
