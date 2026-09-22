/**
 * Whether a piece of text talks about a procedure: a Google review, a gallery
 * photo's title or alt text, an Instagram caption.
 *
 * One pattern per procedure page, so a page module and
 * `scripts/audit-procedure-assets.ts` agree on which reviews and photos
 * belong to it. Reviews come in English and Spanish (Google stores its
 * translation and the original together), so each pattern covers both.
 *
 * Pure data: no imports from `@/env`, Next or React, so a tsx script can read
 * it.
 *
 * @module
 */
import type { GalleryProcedureSlug } from '@workspace/shared/schemas/gallery'

export const procedureMentions: Readonly<Record<GalleryProcedureSlug, RegExp>> =
    {
        'brazilian-butt-lift-bbl-miami': /\bbbl\b|brazilian butt/i,
        'breast-augmentation-miami':
            /breast aug|breast implant|\bimplantes? (?:de )?(?:seno|mamario)|aumento (?:de )?(?:senos|busto|pecho)|aumento mamario|boob job/i,
        'breast-lift-miami':
            /breast lift|mastopex|levantamiento de (?:senos|busto|pecho)/i,
        'breast-reduction-miami':
            /breast reduction|reducci[oó]n (?:de (?:senos|busto|pecho)|mamaria)/i,
        'tummy-tuck-miami': /tummy tuck|abdominoplast/i,
        'liposuction-miami': /\blipo|liposuc|lipoescultura/i,
        'mommy-makeover-miami': /\bmom(?:my|mi)? makeover|\bmami makeover/i,
        'facelift-miami':
            /\bface ?lift|facial lift|lifting facial|ritidectom|neck ?lift/i,
        'blepharoplasty-miami': /blepharo|\bbleph\b|eyelid|p[aá]rpado/i,
    }

/**
 * `true` when `text` names the procedure. `false` for a slug with no
 * pattern, so an unknown page never claims a review or a photo.
 */
export function mentionsProcedure(
    slug: string,
    text: string | null | undefined
): boolean {
    const pattern = procedureMentions[slug as GalleryProcedureSlug]
    return Boolean(pattern && text && pattern.test(text))
}
