/**
 * Procedure Slugs Data for URL Classification
 *
 * Contains the procedure slugs used in the web app's sitemap generation.
 * This data is used by the URL registry service to classify pages from
 * Google Search Console.
 *
 * @module @/lib/data/procedures.data
 */

/**
 * All procedure slugs available on the website.
 * Must be kept in sync with apps/web/lib/data/procedures.data.ts
 */
export const PROCEDURE_SLUGS = [
    'breast-augmentation-miami',
    'breast-lift-miami',
    'breast-reduction-miami',
    'liposuction-miami',
    'brazilian-butt-lift-bbl-miami',
    'tummy-tuck-miami',
    'mommy-makeover-miami',
    'facelift-miami',
    'blepharoplasty-miami',
] as const

/**
 * Type for procedure slug values
 */
export type ProcedureSlug = (typeof PROCEDURE_SLUGS)[number]
