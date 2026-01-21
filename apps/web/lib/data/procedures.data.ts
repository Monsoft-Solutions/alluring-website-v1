import type { Procedure } from '@/lib/types/procedure.type'
import { procedureSchema } from '@/lib/types/procedure.type'

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
        if (process.env.NODE_ENV === 'development') {
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

export const getProcedureBySlug = (slug: string): Procedure | undefined => {
    return procedures.find((procedure) => procedure.slug === slug)
}

export const getProceduresByCategory = (
    category: 'face' | 'breast' | 'body' | 'combined'
): Procedure[] => {
    return procedures.filter((procedure) => procedure.category === category)
}
