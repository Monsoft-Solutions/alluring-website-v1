import { describe, expect, it } from 'vitest'

import {
    mergeGroupsMedia,
    type GroupMediaRow,
} from '@/lib/utils/gallery-groups-media.util'

function row(groupId: string, id: string, title: string): GroupMediaRow {
    return {
        groupId,
        id,
        type: 'image',
        url: `https://example.com/${id}.jpg`,
        thumbnailUrl: null,
        title,
        slug: id,
        alt: title,
        blurDataUrl: null,
        width: 800,
        height: 1000,
        isFeatured: false,
    }
}

/** As the query returns them: media order across all groups at once. */
const ROWS = [
    row('lipo', 'l1', 'Lipo 360 before and after'),
    row('tummy', 't1', 'Mommy makeover before and after'),
    row('mommy', 'm1', 'Mommy makeover before and after'),
    row('lipo', 'l2', 'Mommy makeover with lipo, before and after'),
    row('tummy', 't2', 'Tummy tuck before and after'),
    // Filed in two groups.
    row('mommy', 'shared', 'Mommy makeover result'),
    row('tummy', 'shared', 'Mommy makeover result'),
]

const ids = (media: { id: string }[]) => media.map((m) => m.id)

describe('mergeGroupsMedia', () => {
    it('reads group by group in the order given, each in its query order', () => {
        expect(
            ids(
                mergeGroupsMedia(['mommy', 'tummy', 'lipo'], ROWS, {
                    limit: 10,
                })
            )
        ).toEqual(['m1', 'shared', 't1', 't2', 'l1', 'l2'])
    })

    it('lists an item filed in several groups once, under its first group', () => {
        const merged = mergeGroupsMedia(['tummy', 'mommy'], ROWS, { limit: 10 })
        expect(ids(merged)).toEqual(['t1', 't2', 'shared', 'm1'])
    })

    it('filters by the procedure named before applying the cap', () => {
        expect(
            ids(
                mergeGroupsMedia(['lipo', 'tummy', 'mommy'], ROWS, {
                    limit: 3,
                    mentioning: 'mommy-makeover-miami',
                })
            )
        ).toEqual(['l2', 't1', 'shared'])
    })

    it('ignores groups it was not asked for, and returns cards without groupId', () => {
        const merged = mergeGroupsMedia(['mommy'], ROWS, { limit: 10 })
        expect(ids(merged)).toEqual(['m1', 'shared'])
        expect(merged[0]).not.toHaveProperty('groupId')
    })
})
