import { cn } from '@workspace/ui/lib/utils'

/** One published source a page's figures rest on. */
export type Source = {
    /** Stable key; the list item's anchor is `#source-{id}`. */
    id: string
    /** Organization or journal, e.g. "American Society of Plastic Surgeons". */
    publisher: string
    /** Title of the page, article or statute. */
    title: string
    url?: string
    /** Publication or review date, ISO 8601. */
    date?: string
    /** How the page uses it, when the attribution needs a caveat. */
    note?: string
}

/** A pointer from a figure to the source it comes from. */
export type Citation = {
    sourceId: string
    /** Short visible label, e.g. "ASPS". */
    label: string
}

/** The in-page anchor of a source in a `SourcesList`. */
export function sourceAnchorId(sourceId: string): string {
    return `source-${sourceId}`
}

/** Inline citation links, rendered after a figure. */
export function CitationLinks({ citations }: { citations?: Citation[] }) {
    if (!citations?.length) return null

    return (
        <span className='ml-1 text-xs whitespace-nowrap text-stone-500'>
            (
            {citations.map((citation, index) => (
                <span key={citation.sourceId}>
                    {index > 0 && ', '}
                    <a
                        href={`#${sourceAnchorId(citation.sourceId)}`}
                        className='hover:text-gold-600 underline decoration-stone-300 underline-offset-2'
                    >
                        {citation.label}
                    </a>
                </span>
            ))}
            )
        </span>
    )
}

type SourcesListProps = {
    sources: Source[]
    heading?: string
    id?: string
    className?: string
}

const sourceDate = (iso: string): string =>
    new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
    })

/**
 * The numbered list of sources behind a page's figures.
 *
 * Each item carries a stable anchor so `CitationLinks` next to a figure can
 * jump to it. Server component; no client JavaScript.
 */
export function SourcesList({
    sources,
    heading = 'Sources',
    id = 'sources',
    className,
}: SourcesListProps) {
    if (sources.length === 0) return null

    const headingId = `${id}-heading`

    return (
        <section
            id={id}
            aria-labelledby={headingId}
            className={cn('scroll-mt-24', className)}
        >
            <h2
                id={headingId}
                className='mb-6 font-serif text-2xl text-stone-900 md:text-3xl'
            >
                {heading}
            </h2>
            <ol className='list-decimal space-y-3 pl-5 text-sm leading-relaxed text-stone-700 marker:text-stone-400'>
                {sources.map((source) => (
                    <li
                        key={source.id}
                        id={sourceAnchorId(source.id)}
                        className='scroll-mt-24'
                    >
                        <span className='font-bold'>{source.publisher}.</span>{' '}
                        {source.url ? (
                            <a
                                href={source.url}
                                rel='noopener noreferrer'
                                target='_blank'
                                className='hover:text-gold-600 underline decoration-stone-300 underline-offset-2'
                            >
                                {source.title}
                            </a>
                        ) : (
                            source.title
                        )}
                        {source.date && (
                            <>
                                {', '}
                                <time dateTime={source.date}>
                                    {sourceDate(source.date)}
                                </time>
                            </>
                        )}
                        .
                        {source.note && (
                            <span className='block text-stone-500'>
                                {source.note}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </section>
    )
}
