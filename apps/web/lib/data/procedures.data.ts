import type { Procedure } from '@/lib/types/procedure.type'
import { procedureSchema } from '@/lib/types/procedure.type'
import type { ProcedureNavItem } from './procedure-nav.data'
import { procedureNavItems } from './procedure-nav.data'
import { env } from '@/env'

// Import individual procedure data files
import { breastAugmentationMiami } from './procedures/breast-augmentation-miami.data'
import { breastLiftMiami } from './procedures/breast-lift-miami.data'
import { breastReductionMiami } from './procedures/breast-reduction-miami.data'
import { liposuctionMiami } from './procedures/liposuction-miami.data'
import { brazilianButtLiftBblMiami } from './procedures/brazilian-butt-lift-bbl-miami.data'
import { tummyTuckMiami } from './procedures/tummy-tuck-miami.data'
import { mommyMakeoverMiami } from './procedures/mommy-makeover-miami.data'
import { faceliftMiami } from './procedures/facelift-miami.data'
import { blepharoplastyMiami } from './procedures/blepharoplasty-miami.data'

// Raw procedures array (unvalidated)
const rawProcedures: Procedure[] = [
    breastAugmentationMiami,
    breastLiftMiami,
    breastReductionMiami,
    liposuctionMiami,
    brazilianButtLiftBblMiami,
    tummyTuckMiami,
    mommyMakeoverMiami,
    faceliftMiami,
    blepharoplastyMiami,
]

/**
 * Validated procedures array with runtime schema validation
 *
 * Validates each procedure object against the procedureSchema to ensure:
 * - Required fields (title, slug, description) are present
 * - Date fields (dateModified, datePublished) are valid ISO 8601 datetime strings
 * - All other fields match expected types and constraints
 *
 * The dateModified field is used as the source of truth for:
 * - XML sitemap lastmod values (see app/sitemap/procedures.xml/route.ts)
 * - JSON-LD structured data freshness signals
 * - SEO/LLM optimization signals
 *
 * Update dateModified in individual procedure files when content changes.
 *
 * @throws {Error} If any procedure fails validation in development
 */
export const procedures: Procedure[] = rawProcedures.map((procedure) => {
    const result = procedureSchema.safeParse(procedure)

    if (!result.success) {
        console.error(
            `Validation failed for procedure: ${procedure.slug}`,
            result.error.format()
        )

        // In development, throw an error to catch issues early
        if (env.NODE_ENV === 'development') {
            throw new Error(
                `Procedure validation failed for "${procedure.slug}": ${result.error.message}`
            )
        }

        // In production, log the error but continue with the original data
        // This prevents the site from breaking if validation fails
        return procedure
    }

    return result.data as Procedure
})

/** One comparable line per procedure: what navigation renders, in order. */
const navSignature = (item: ProcedureNavItem): string =>
    `${item.slug}|${item.title}|${item.category ?? ''}`

/**
 * Reports the first way `procedure-nav.data.ts` disagrees with this barrel, or
 * `null` if the two are in step.
 */
function findNavDrift(): string | null {
    const expected = procedures.map(({ title, slug, category }) =>
        navSignature({ title, slug, category })
    )
    const actual = procedureNavItems.map(navSignature)

    if (expected.length !== actual.length) {
        return `expected ${expected.length} entries, found ${actual.length}`
    }

    const index = expected.findIndex((signature, i) => signature !== actual[i])

    return index === -1
        ? null
        : `entry ${index} is "${actual[index] ?? ''}", expected "${expected[index] ?? ''}"`
}

/**
 * Keeps the navigation list honest.
 *
 * The header, mobile menu and footer read their nine links from
 * `procedure-nav.data.ts` rather than from this barrel, so that the catalog —
 * full copy, benefits, surgical steps, anaesthesia notes — never reaches the
 * browser (issue #210). The price of that split is a second list, and this is
 * what stops it drifting: add a procedure here without adding it there and the
 * dev server refuses to start, and CI fails, rather than the nav quietly
 * dropping it.
 *
 * It lives in the barrel, which only the server graph imports, so it costs the
 * client nothing.
 *
 * Note the two-tier failure policy. `NODE_ENV` is 'production' during
 * `next build` as well as at runtime, so it cannot tell a pipeline apart from a
 * live server on its own — hence the explicit `CI` check, without which a drift
 * introduced in a pull request would be one line in a green build log. On a
 * running production server it stays a log: a wrong nav link is worse than a
 * missing one, but neither is worth taking the site down for.
 */
const navDrift = findNavDrift()

if (navDrift) {
    console.error(
        `lib/data/procedure-nav.data.ts is out of step with the procedures barrel: ${navDrift}`
    )

    if (env.NODE_ENV === 'development' || env.CI) {
        throw new Error(
            `Procedure navigation data is out of step with the procedures barrel: ${navDrift}`
        )
    }
}

export const getProcedureBySlug = (slug: string): Procedure | undefined => {
    return procedures.find((procedure) => procedure.slug === slug)
}

export const getProceduresByCategory = (
    category: 'face' | 'breast' | 'body' | 'combined'
): Procedure[] => {
    return procedures.filter((procedure) => procedure.category === category)
}
