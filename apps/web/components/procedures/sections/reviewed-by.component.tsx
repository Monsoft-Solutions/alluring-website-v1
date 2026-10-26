import { cn } from '@workspace/ui/lib/utils'

type ReviewedByProps = {
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
 * "Last updated …".
 *
 * Says only what is recorded: nothing falls back to today's date, a
 * freshness claim the content can't support (#250). There is no "medically
 * reviewed by" line: no medical review is recorded, and the claims canon
 * bans the phrase (§2, CR11, #354). The page's graph emits no
 * `MedicalWebPage.reviewedBy` / `lastReviewed` either.
 *
 * Server component; no client JavaScript.
 */
export function ReviewedBy({ updatedOn, className }: ReviewedByProps) {
    if (!updatedOn) return null

    return (
        <p className={cn('text-sm leading-relaxed text-stone-600', className)}>
            <span className='block'>
                Last updated{' '}
                <time dateTime={updatedOn}>{readableDate(updatedOn)}</time>
            </span>
        </p>
    )
}
