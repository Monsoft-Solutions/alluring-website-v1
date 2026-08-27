import type { Procedure } from '@/lib/types/procedure.type'

/**
 * The three fields navigation needs from a procedure.
 *
 * Derived from `Procedure` so the shapes stay tied together, but as a *type*
 * import, which the compiler erases — nothing in `@/lib/types/procedure.type`
 * (and so nothing in zod) reaches the bundle through this file.
 */
export type ProcedureNavItem = Pick<Procedure, 'title' | 'slug' | 'category'>

/**
 * Procedure titles and slugs for the header dropdown, the mobile menu and the
 * footer — the three places that render on every non-standalone route.
 *
 * **This file must import neither zod nor `./procedures/*.data`.** It exists
 * because the header, mobile menu and footer are client components, so
 * everything they import is downloaded by all 313 routes. Reaching for the
 * validated `procedures` barrel to render nine links pulled the entire
 * catalog — 216 KB of source: full copy, benefits, surgical steps, anaesthesia
 * notes — into the shared chunk of every page, 41.4 KiB of it over the wire
 * (issue #210). The nine titles and slugs below are under 1 KB.
 *
 * `procedures.data.ts` asserts that this list matches the barrel on slug,
 * title, category and order, so the two cannot drift silently. Add a procedure
 * there and here in the same commit; the check throws in development if you
 * miss one.
 */
export const procedureNavItems: ProcedureNavItem[] = [
    {
        title: 'Breast Augmentation Miami',
        slug: 'breast-augmentation-miami',
        category: 'breast',
    },
    {
        title: 'Breast Lift Miami',
        slug: 'breast-lift-miami',
        category: 'breast',
    },
    {
        title: 'Breast Reduction Miami',
        slug: 'breast-reduction-miami',
        category: 'breast',
    },
    {
        title: 'Liposuction Miami',
        slug: 'liposuction-miami',
        category: 'body',
    },
    {
        title: 'Brazilian Butt Lift (BBL) Miami',
        slug: 'brazilian-butt-lift-bbl-miami',
        category: 'body',
    },
    {
        title: 'Tummy Tuck Miami',
        slug: 'tummy-tuck-miami',
        category: 'body',
    },
    {
        title: 'Mommy Makeover Miami',
        slug: 'mommy-makeover-miami',
        category: 'combined',
    },
    {
        title: 'Facelift (Rhytidectomy) Miami',
        slug: 'facelift-miami',
        category: 'face',
    },
    {
        title: 'Blepharoplasty (Eyelid Surgery) Miami',
        slug: 'blepharoplasty-miami',
        category: 'face',
    },
]
