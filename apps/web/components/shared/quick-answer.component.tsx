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
 * Variants:
 * - "featured": Elegant callout with gold accent for procedure pages
 * - "minimal": Clean, borderless design for FAQ lists
 *
 * @example
 * ```tsx
 * <QuickAnswer
 *   question="What is a Brazilian Butt Lift (BBL)?"
 *   answer="A Brazilian Butt Lift is a cosmetic procedure that uses fat transfer to enhance the shape and size of the buttocks."
 *   details="The procedure involves harvesting fat from areas like the abdomen or thighs via liposuction, purifying it, and then injecting it into the buttocks for natural-looking volume and contour."
 *   variant="featured"
 * />
 * ```
 */
import { cn } from '@workspace/ui/lib/utils'

export type QuickAnswerExpert = {
    name: string
    credentials?: string
    url?: string
}

export type QuickAnswerVariant = 'featured' | 'minimal'

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
    /** Visual variant - "featured" for prominent display, "minimal" for lists */
    variant?: QuickAnswerVariant
}

export function QuickAnswer({
    question,
    answer,
    details,
    expert,
    className,
    headingLevel = 'h2',
    id,
    variant = 'featured',
}: QuickAnswerProps) {
    const Heading = headingLevel
    const headingId = id ? `${id}-heading` : undefined

    if (variant === 'featured') {
        return (
            <section
                id={id}
                className={cn('quick-answer', className)}
                itemScope
                itemType='https://schema.org/Question'
                aria-labelledby={headingId}
                aria-label={headingId ? undefined : question}
            >
                {/* Gold accent line */}
                <div className='mb-6 flex items-center gap-3'>
                    <div className='bg-gold-500 h-px w-8' />
                    <span className='text-gold-600 text-xs font-semibold tracking-[0.2em] uppercase'>
                        Quick Answer
                    </span>
                </div>

                {/* Question */}
                <Heading
                    id={headingId}
                    itemProp='name'
                    className='mb-5 font-serif text-2xl text-stone-900 md:text-3xl'
                >
                    {question}
                </Heading>

                {/* Answer Container */}
                <div
                    itemScope
                    itemType='https://schema.org/Answer'
                    itemProp='acceptedAnswer'
                    className='border-gold-200 border-l-2 pl-6'
                >
                    {/* Direct Answer - The most quotable content for AI */}
                    <p
                        itemProp='text'
                        className='article-summary mb-4 text-lg leading-relaxed text-stone-700 md:text-xl'
                    >
                        {answer}
                    </p>

                    {/* Supporting Details */}
                    {details && (
                        <p className='text-base leading-relaxed text-stone-500'>
                            {details}
                        </p>
                    )}

                    {/* Expert Attribution */}
                    {expert && (
                        <div
                            className='mt-5'
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

    // Minimal variant - clean, no borders, for list contexts
    return (
        <article
            id={id}
            className={cn('quick-answer group', className)}
            itemScope
            itemType='https://schema.org/Question'
            aria-labelledby={headingId}
            aria-label={headingId ? undefined : question}
        >
            {/* Question */}
            <Heading
                id={headingId}
                itemProp='name'
                className='mb-3 font-serif text-xl text-stone-900'
            >
                {question}
            </Heading>

            {/* Answer Container */}
            <div
                itemScope
                itemType='https://schema.org/Answer'
                itemProp='acceptedAnswer'
            >
                {/* Direct Answer */}
                <p
                    itemProp='text'
                    className='article-summary mb-2 text-base leading-relaxed text-stone-700'
                >
                    {answer}
                </p>

                {/* Supporting Details */}
                {details && (
                    <p className='text-sm leading-relaxed text-stone-500'>
                        {details}
                    </p>
                )}

                {/* Expert Attribution */}
                {expert && (
                    <div
                        className='mt-3'
                        itemScope
                        itemType='https://schema.org/Person'
                        itemProp='author'
                    >
                        <p className='text-xs text-stone-400'>
                            <span>—</span>{' '}
                            <span itemProp='name'>{expert.name}</span>
                            {expert.credentials && (
                                <span itemProp='jobTitle'>
                                    , {expert.credentials}
                                </span>
                            )}
                        </p>
                    </div>
                )}
            </div>
        </article>
    )
}

/**
 * QuickAnswerList Component
 *
 * Renders multiple QuickAnswer components in a clean, elegant list format.
 * Uses minimal variant with subtle dividers for visual rhythm.
 * Useful for FAQ sections optimized for AI citations.
 */
export type QuickAnswerListProps = {
    items: Omit<QuickAnswerProps, 'headingLevel' | 'variant'>[]
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
        <div
            className={cn(
                'divide-y divide-stone-100 border-t border-stone-100',
                className
            )}
        >
            {items.map((item, index) => (
                <div key={item.id || `quick-answer-${index}`} className='py-8'>
                    <QuickAnswer
                        {...item}
                        headingLevel={headingLevel}
                        variant='minimal'
                    />
                </div>
            ))}
        </div>
    )
}
