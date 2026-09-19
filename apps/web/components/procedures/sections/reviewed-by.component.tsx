import { cn } from '@workspace/ui/lib/utils'

/** The clinician who reviewed a page, as the page credits them. */
export type MedicalReviewer = {
    name: string
    /** Exactly as the practice approves them, e.g. board certifications. */
    credentials?: string
    /** Profile page on this site. */
    url?: string
}

type ReviewedByProps = {
    /** Omit until a review is recorded; the line then shows the update date only. */
    reviewer?: MedicalReviewer
    /** ISO 8601 date of the recorded review. Required with `reviewer`. */
    reviewedOn?: string
    /** ISO 8601 date the content last changed. */
    updatedOn?: string
    className?: string
}

const readableDate = (iso: string): string =>
    new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
    })

/**
 * "Medically reviewed by … on …" and "Last updated …".
 *
 * Says only what is recorded: the reviewer line appears when both a reviewer
 * and a review date exist, and nothing falls back to today's date — a
 * freshness claim the content can't support (#250). Keep it in step with
 * `MedicalWebPage.reviewedBy` / `lastReviewed` in the page's graph.
 *
 * Server component; no client JavaScript.
 */
export function ReviewedBy({
    reviewer,
    reviewedOn,
    updatedOn,
    className,
}: ReviewedByProps) {
    const showReview = Boolean(reviewer && reviewedOn)

    if (!showReview && !updatedOn) return null

    return (
        <p className={cn('text-sm leading-relaxed text-stone-600', className)}>
            {showReview && reviewer && reviewedOn && (
                <span className='block'>
                    Medically reviewed by{' '}
                    {reviewer.url ? (
                        <a
                            href={reviewer.url}
                            className='hover:text-gold-600 font-bold text-stone-900 underline decoration-stone-300 underline-offset-2'
                        >
                            {reviewer.name}
                        </a>
                    ) : (
                        <span className='font-bold text-stone-900'>
                            {reviewer.name}
                        </span>
                    )}
                    {reviewer.credentials && `, ${reviewer.credentials}`} on{' '}
                    <time dateTime={reviewedOn}>
                        {readableDate(reviewedOn)}
                    </time>
                </span>
            )}
            {updatedOn && (
                <span className='block'>
                    Last updated{' '}
                    <time dateTime={updatedOn}>{readableDate(updatedOn)}</time>
                </span>
            )}
        </p>
    )
}
