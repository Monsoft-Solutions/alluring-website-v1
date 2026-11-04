/**
 * The date on a blog post card.
 *
 * The cards are client components, so this runs on the server and again in the
 * reader's browser. Without a fixed time zone a post published at 00:13 reads
 * "Jan 31" on the server (UTC) and "Jan 30" in Miami, the text no longer
 * matches, and React throws hydration error #418. `published_at` holds no time
 * zone and is read as UTC, so formatting in UTC also shows the stored date.
 *
 * @param publishedAt - ISO 8601 date string, or null for an unpublished post
 * @returns The date as "Jan 31, 2026", or null when there is no date
 */
export function formatPostCardDate(publishedAt: string | null): string | null {
    if (!publishedAt) return null

    return new Date(publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
    })
}
