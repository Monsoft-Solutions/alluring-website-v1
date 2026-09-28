/**
 * One results rail from several gallery groups: a combined procedure's
 * photos are filed under its parts (a mommy makeover's under tummy tuck,
 * breast lift, liposuction…), so its page reads every group that may hold
 * them.
 *
 * Pure: no database, Next or React, so a unit test can read it.
 *
 * @module
 */
import { mentionsProcedure } from '@/lib/procedures/procedure-mentions'
import type { GalleryMediaCard } from '@/lib/types/gallery/gallery-group.type'

/** A media item as read through one of its groups. */
export type GroupMediaRow = GalleryMediaCard & { groupId: string }

/**
 * The groups' media as one list: group by group in `groupIds`' order, each
 * group's media in the order the query returned them, every item once (an
 * item can sit in several groups), then, with `mentioning`, only the items
 * whose title or alt text names that procedure, then the first `limit`.
 *
 * Filtering before the cap is the point: a group of 40 liposuction photos
 * would otherwise use up the cap before a mommy makeover photo is reached.
 */
export function mergeGroupsMedia(
    groupIds: readonly string[],
    rows: readonly GroupMediaRow[],
    { limit, mentioning }: { limit: number; mentioning?: string }
): GalleryMediaCard[] {
    const rank = new Map(groupIds.map((id, index) => [id, index]))
    const byGroup = rows
        .filter((row) => rank.has(row.groupId))
        // Stable, so each group keeps the query's order.
        .sort((a, b) => rank.get(a.groupId)! - rank.get(b.groupId)!)

    const seen = new Set<string>()
    const merged: GalleryMediaCard[] = []
    for (const row of byGroup) {
        if (merged.length === limit) break
        if (seen.has(row.id)) continue
        seen.add(row.id)
        if (
            mentioning &&
            !mentionsProcedure(mentioning, `${row.title} ${row.alt}`)
        ) {
            continue
        }
        merged.push({
            id: row.id,
            type: row.type,
            url: row.url,
            thumbnailUrl: row.thumbnailUrl,
            title: row.title,
            slug: row.slug,
            alt: row.alt,
            blurDataUrl: row.blurDataUrl,
            width: row.width,
            height: row.height,
            isFeatured: row.isFeatured,
        })
    }
    return merged
}
