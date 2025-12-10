/**
 * Procedure name to slug mapping
 *
 * Maps user-friendly procedure names shown in the admin UI
 * to their corresponding URL slugs used in the database and frontend.
 */

export type ProcedureOption = {
    /** Display name shown to admin users */
    name: string
    /** URL slug saved to database (null for "Other" category) */
    slug: string | null
}

/**
 * Available procedures with their slugs
 * The `name` is what admins see, the `slug` is what gets saved
 */
export const PROCEDURE_OPTIONS: ProcedureOption[] = [
    {
        name: 'BBL (Brazilian Butt Lift)',
        slug: 'brazilian-butt-lift-bbl-miami',
    },
    {
        name: 'Breast Augmentation',
        slug: 'breast-augmentation-miami',
    },
    {
        name: 'Breast Lift',
        slug: 'breast-lift-miami',
    },
    {
        name: 'Breast Reduction',
        slug: 'breast-reduction-miami',
    },
    {
        name: 'Tummy Tuck',
        slug: 'tummy-tuck-miami',
    },
    {
        name: 'Liposuction',
        slug: 'liposuction-miami',
    },
    {
        name: 'Mommy Makeover',
        slug: 'mommy-makeover-miami',
    },
    {
        name: 'Facelift',
        slug: 'facelift-miami',
    },
    {
        name: 'Blepharoplasty',
        slug: 'blepharoplasty-miami',
    },
    {
        name: 'Rhinoplasty',
        slug: 'rhinoplasty-miami',
    },
    {
        name: 'Other',
        slug: null,
    },
]

/**
 * Get procedure slug by name
 */
export function getProcedureSlugByName(name: string): string | null {
    const procedure = PROCEDURE_OPTIONS.find((p) => p.name === name)
    return procedure?.slug ?? null
}

/**
 * Get procedure name by slug
 */
export function getProcedureNameBySlug(slug: string | null): string | null {
    if (!slug) return null
    const procedure = PROCEDURE_OPTIONS.find((p) => p.slug === slug)
    return procedure?.name ?? null
}
