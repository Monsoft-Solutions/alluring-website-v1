/**
 * The slice of a procedure a card needs.
 *
 * Cards are client components, so whatever they are handed is serialized into
 * the RSC payload of every page that renders one. They were handed whole
 * `Procedure` objects — markdown body, FAQs, pricing, process steps, content
 * images — which is how the BBL page came to carry roughly 216k characters of
 * *other* procedures' copy (#250). This is the same lesson as
 * `procedure-nav.data.ts` and issue #210, applied to the cards.
 *
 * Derived from `Procedure` with `Pick`, so the two shapes cannot drift, and
 * imported as a type, which the compiler erases — nothing in
 * `@/lib/types/procedure.type`, and so nothing in zod, reaches the bundle
 * through here.
 *
 * @module
 */
import type { Procedure } from '@/lib/types/procedure.type'

export type ProcedureSummary = Pick<
    Procedure,
    'title' | 'slug' | 'image' | 'shortDescription' | 'category'
>

/**
 * Project a procedure down to what a card renders.
 *
 * Resolves the `shortDescription ?? description` fallback here rather than in
 * the card, so the long `description` never has to travel either.
 */
export function toProcedureSummary(procedure: Procedure): ProcedureSummary {
    return {
        title: procedure.title,
        slug: procedure.slug,
        image: procedure.image,
        shortDescription:
            procedure.shortDescription || procedure.description || '',
        category: procedure.category,
    }
}
