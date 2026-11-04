/**
 * Blog post template v2 (epic #293): which posts render with it.
 *
 * The new template ships dark. A post uses it only when its slug is listed in
 * `BLOG_V2_SLUGS`, or on a non-production build started with
 * `BLOG_V2_PREVIEW=all`, so a preview deployment or a local build can show
 * every post in the new template while production readers keep the old one.
 *
 * The release is staged on purpose. All nine procedure pages lost rankings the
 * week after the 29 Jan 2026 template change, and the blog now brings nearly
 * half of the site's visits, so the list is filled in its own PR (the top 15
 * posts first) and compared against each post's own Search Console history
 * before every post moves.
 *
 * Both variables are declared in turbo.json as well as env.ts: Turbo's strict
 * env mode strips undeclared ones, and a stripped `VERCEL_ENV` would let the
 * preview flag through on a production build.
 *
 * @module lib/blog/blog-v2
 */

/**
 * Slugs that render with the v2 template in every environment.
 *
 * Epic phase 3: the 15 posts with the most sessions (61% of blog sessions,
 * GA4 26 Jun – 25 Sep 2026), in that order. Released together and judged over
 * three weeks: each post's Search Console position and click-through rate
 * against its own four weeks before, and the blog lead rate against 0.11%.
 * If positions hold, phase 4 routes every post to v2 and removes this list.
 *
 * The last five are the mommy makeover posts rewritten in Nov 2026: they go to
 * v2 with their rewrites, by the owner's decision, so they aren't published
 * beside the old sidebar's claims. Read them against their rewrite baseline,
 * not as part of the 15-post template comparison.
 */
export const BLOG_V2_SLUGS: ReadonlySet<string> = new Set<string>([
    'breast-implant-size-guide',
    'how-to-reduce-pubic-swelling-after-tummy-tuck',
    'weeks-post-op-breast-augmentation-what-to-expect',
    'how-to-reduce-tightness-after-tummy-tuck',
    'when-can-i-sleep-without-a-bra-after-breast-reduction',
    'how-to-reduce-itching-after-lipo',
    'how-many-massages-after-bbl',
    'when-can-i-sleep-on-my-side-after-breast-reduction',
    'why-do-bbl-stink',
    'how-many-massages-after-lipo-360',
    'when-do-breast-augmentation-stitches-dissolve',
    'how-to-fix-dents-after-bbl',
    'how-to-regain-sensation-after-breast-reduction',
    'how-to-get-rid-of-fibrosis-after-lipo',
    'how-to-sleep-after-bbl',
    // The 2026-11-03 breast lift rewrite: 12 posts with no traffic to protect.
    'types-of-breast-lift',
    'breast-lift-without-implants',
    'breast-lift-cost',
    'non-surgical-breast-lift',
    'breast-lift-scars-miami',
    'breast-lift-implants-miami',
    'breast-lift-candidate-checklist',
    'breast-lift-recovery-weight-loss-miami',
    'breast-lift-vs-reduction-miami',
    'breast-augmentation-vs-breast-lift',
    'breast-lift-miami-post-pregnancy',
    'breast-lift-recovery-guide-miami',
    // The 2026-11-03 mommy makeover rewrite, see the note above.
    'how-long-after-mommy-makeover-can-i-drive',
    'mommy-makeover-compression-garments-guide',
    'mommy-makeover-recovery-exercises',
    'mommy-makeover-recovery-signs',
    'tummy-tuck-mommy-makeover-miami',
    // Breast augmentation rewrites (#319): rewritten posts ship on v2. Search
    // Console can't separate the rewrite from the template on these, so read
    // them as one change.
    'breast-augmentation-candidate-quiz',
    'breast-augmentation-pain-management',
    'breast-augmentation-recovery-miami',
    'breast-augmentation-scars-miami-timeline',
    'breast-implant-illness-symptoms',
    'breast-implants-drop-fluff-timeline',
    'how-long-after-breast-augmentation-can-i-drive',
    'how-long-after-breast-augmentation-can-i-swim',
    'how-often-to-massage-breast-after-augmentation',
    'swelling-and-asymmetry-after-breast-augmentation-faq',
    // when-can-i-do-push-ups-after-breast-augmentation joins with its rewrite:
    // its diagram is the canary for the same-URL image swap (read from 18 Nov),
    // and a template move on the same day would blur that reading.
    'when-can-i-sleep-on-my-side-after-breast-augmentation',
    'when-can-i-sleep-without-a-bra-after-breast-augmentation',
    'when-can-you-work-out-after-breast-augmentation',
    // New breast augmentation posts for readers still deciding (#319). They
    // have no history to compare, so they start on v2, with its consult thread.
    'breast-implants-over-or-under-the-muscle',
    'saline-vs-silicone-breast-implants',
    'how-long-do-breast-implants-last',
    'capsular-contracture',
    'breast-implant-rippling-bottoming-out',
    'mammograms-breastfeeding-with-breast-implants',
])

/** The two variables the switch reads; the routes pass `env`. */
export type BlogV2Env = {
    BLOG_V2_PREVIEW?: string
    VERCEL_ENV?: string
}

/**
 * Whether a post renders with the v2 template.
 *
 * @param slug - The post's slug, from either `/blog/[slug]` or `/[slug]`
 * @param environment - `env` from `@/env`
 * @returns True for listed slugs, or for every post on a non-production
 * build with `BLOG_V2_PREVIEW=all`
 */
export function isBlogV2(slug: string, environment: BlogV2Env): boolean {
    if (BLOG_V2_SLUGS.has(slug)) return true

    return (
        environment.BLOG_V2_PREVIEW === 'all' &&
        environment.VERCEL_ENV !== 'production'
    )
}
