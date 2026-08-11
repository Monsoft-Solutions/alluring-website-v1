/**
 * Content Freshness Utility
 *
 * Decides whether an "updated" timestamp is worth surfacing. Rows get touched
 * for reasons that have nothing to do with the article (re-seeding, metadata
 * edits), so only updates that land meaningfully after publication count as a
 * real freshness signal.
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
