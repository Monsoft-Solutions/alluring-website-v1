/**
 * Content Freshness Utility
 *
 * Decides whether an "updated" timestamp is worth surfacing. The input is
 * `content_updated_at`, which the database stamps only on reader-visible
 * edits, but a draft is edited right up to (and just after) publication, so
 * only edits that land meaningfully after the publish date count as a real
 * freshness signal.
 */

/** An update must be at least this far past publication to count */
const MEANINGFUL_UPDATE_THRESHOLD_MS = 24 * 60 * 60 * 1000

/**
 * Returns the update date when it is meaningfully newer than the publish date.
 *
 * @param publishedAt - Publication date (ISO string or Date)
 * @param updatedAt - Last modification date (ISO string, Date or null)
 * @returns The update date to display, or null when there is nothing to show
 */
export function getMeaningfulUpdateDate(
    publishedAt: string | Date,
    updatedAt: string | Date | null | undefined
): Date | null {
    if (!updatedAt) return null

    const updatedDate =
        updatedAt instanceof Date ? updatedAt : new Date(updatedAt)
    const publishedDate =
        publishedAt instanceof Date ? publishedAt : new Date(publishedAt)

    if (
        Number.isNaN(updatedDate.getTime()) ||
        Number.isNaN(publishedDate.getTime())
    ) {
        return null
    }

    const elapsedMs = updatedDate.getTime() - publishedDate.getTime()

    return elapsedMs > MEANINGFUL_UPDATE_THRESHOLD_MS ? updatedDate : null
}

/**
 * The date to report as "modified" to crawlers (Open Graph, sitemaps).
 *
 * A meaningful post-publication edit wins; otherwise the publish date, so a
 * modified time never precedes the published time even when the draft's last
 * edit happened before it went live.
 *
 * @param publishedAt - Publication date (ISO string or Date)
 * @param contentUpdatedAt - Last reader-visible edit (ISO string, Date or null)
 * @returns ISO 8601 string
 */
export function getContentModifiedDate(
    publishedAt: string | Date,
    contentUpdatedAt: string | Date | null | undefined
): string {
    const meaningful = getMeaningfulUpdateDate(publishedAt, contentUpdatedAt)
    if (meaningful) return meaningful.toISOString()
    return publishedAt instanceof Date
        ? publishedAt.toISOString()
        : new Date(publishedAt).toISOString()
}
