/**
 * Promotion Boundaries
 *
 * Clears the web app's promotion cache tags when a promotion has started or
 * ended since the last run. A promotion going live or expiring is not a
 * write, so nothing else invalidates it, and the web app caches promotion
 * reads for a day: the announcement bar reads the featured promotion in the
 * root layout, which caps the ISR window of every page (#337).
 *
 * Runs hourly from the cron dispatch. The lookback is a little longer than
 * the schedule so a late invocation does not miss a boundary; clearing the
 * tags twice is harmless.
 *
 * @module @admin/lib/services/promotion-boundary
 */
import { and, count, gt, lte, or } from 'drizzle-orm'
import { db } from '@workspace/db/client'
import { promotion } from '@workspace/db/schema/promotion'

import {
    getAllPromotionTags,
    revalidateWebAppCache,
} from '@/lib/utils/revalidate-web.util'

/** How far back a start or end counts as "since the last run". */
export const PROMOTION_BOUNDARY_LOOKBACK_MINUTES = 70

export type PromotionBoundaryResult = {
    outcome: 'revalidated' | 'no-boundary'
    crossed: number
}

/**
 * Count promotions whose start or end fell inside the lookback window and,
 * if any did, clear every promotion cache tag on the web app.
 *
 * Compares with a JS Date like the web app's own active-promotion filter
 * (`lib/queries/promotion.query.ts`), so both read the timestamps the same way.
 */
export async function runPromotionBoundaryJob(
    now: Date = new Date()
): Promise<PromotionBoundaryResult> {
    const since = new Date(
        now.getTime() - PROMOTION_BOUNDARY_LOOKBACK_MINUTES * 60 * 1000
    )

    const [row] = await db
        .select({ crossed: count() })
        .from(promotion)
        .where(
            or(
                and(
                    gt(promotion.startsAt, since),
                    lte(promotion.startsAt, now)
                ),
                and(gt(promotion.endsAt, since), lte(promotion.endsAt, now))
            )
        )

    const crossed = row?.crossed ?? 0
    if (crossed === 0) {
        return { outcome: 'no-boundary', crossed }
    }

    await revalidateWebAppCache(getAllPromotionTags())
    return { outcome: 'revalidated', crossed }
}
