/**
 * Procedure Context Data
 *
 * Provides procedure-specific context for AI-powered blog topic generation.
 * This data enriches AI prompts with relevant keywords, pain points, and audience hints.
 */

/**
 * Procedure context for AI enrichment
 */
export type ProcedureContext = {
    /** Display name of the procedure */
    name: string
    /** URL slug matching the web app procedures */
    slug: string
    /** Related SEO keywords for this procedure */
    relatedKeywords: string[]
    /** Common patient concerns and pain points */
    commonPainPoints: string[]
    /** Target audience segment hints */
    targetAudienceHints: string[]
}

/**
 * Procedure-specific context data for all supported procedures
 */
export const PROCEDURE_CONTEXTS: ProcedureContext[] = [
    {
        name: 'Brazilian Butt Lift (BBL)',
        slug: 'brazilian-butt-lift-bbl-miami',
        relatedKeywords: [
            'bbl miami',
            'bbl cost',
            'bbl recovery',
            'bbl before after',
            'brazilian butt lift price',
            'bbl surgery miami',
            'bbl results',
            'fat transfer bbl',
        ],
        commonPainPoints: [
            'Recovery timeline and sitting restrictions',
            'Cost and financing options',
            'Safety concerns and surgeon qualifications',
            'How long results last',
            'Pain management during recovery',
            'When can I sit after BBL',
            'BBL vs implants comparison',
        ],
        targetAudienceHints: [
            'Women 25-45 seeking body contouring',
            'First-time cosmetic surgery patients',
            'Out-of-state patients flying to Miami for surgery',
            'Patients researching cost vs quality',
        ],
    },
    {
        name: 'Mommy Makeover',
        slug: 'mommy-makeover-miami',
        relatedKeywords: [
            'mommy makeover miami',
            'mommy makeover cost',
            'mommy makeover recovery',
            'tummy tuck breast lift combo',
            'post pregnancy body',
            'mommy makeover before after',
            'mommy makeover financing',
        ],
        commonPainPoints: [
            'Combining multiple procedures safely',
            'Recovery time with children at home',
            'Cost of combined procedures',
            'Best timing after having kids',
            'What procedures are included',
            'Scarring concerns',
            'Long-term results after weight changes',
        ],
        targetAudienceHints: [
            'Mothers 30-50 post-childbearing',
            'Women done having children',
            'Patients seeking multiple procedure value',
            'Busy moms planning recovery logistics',
        ],
    },
    {
        name: 'Tummy Tuck',
        slug: 'tummy-tuck-miami',
        relatedKeywords: [
            'tummy tuck miami',
            'abdominoplasty cost',
            'tummy tuck recovery',
            'tummy tuck before after',
            'mini tummy tuck',
            'tummy tuck scars',
            'tummy tuck vs liposuction',
        ],
        commonPainPoints: [
            'Scarring and scar placement',
            'Recovery timeline and restrictions',
            'Mini vs full tummy tuck decision',
            'Muscle repair (diastasis recti)',
            'Weight requirements before surgery',
            'Long-term maintenance of results',
            'Combining with liposuction',
        ],
        targetAudienceHints: [
            'Post-pregnancy women',
            'Weight loss patients with excess skin',
            'Patients with abdominal muscle separation',
            'Those seeking permanent core restoration',
        ],
    },
    {
        name: 'Breast Augmentation',
        slug: 'breast-augmentation-miami',
        relatedKeywords: [
            'breast augmentation miami',
            'breast implants cost',
            'breast augmentation recovery',
            'silicone vs saline implants',
            'breast implant sizes',
            'breast augmentation before after',
            'natural looking breast implants',
        ],
        commonPainPoints: [
            'Choosing the right implant size',
            'Silicone vs saline decision',
            'Over vs under the muscle placement',
            'How long implants last',
            'Breastfeeding after augmentation',
            'Natural-looking results concerns',
            'Capsular contracture risks',
        ],
        targetAudienceHints: [
            'Women 25-45 seeking enhancement',
            'Post-breastfeeding volume restoration',
            'First-time augmentation patients',
            'Patients wanting subtle, natural results',
        ],
    },
    {
        name: 'Breast Lift',
        slug: 'breast-lift-miami',
        relatedKeywords: [
            'breast lift miami',
            'mastopexy cost',
            'breast lift without implants',
            'breast lift recovery',
            'breast lift scars',
            'breast lift before after',
            'breast lift with augmentation',
        ],
        commonPainPoints: [
            'Scarring patterns and visibility',
            'Lift alone vs with implants',
            'How long lift results last',
            'Nipple sensation after surgery',
            'Recovery and return to activities',
            'Breastfeeding after lift',
            'Combining with reduction',
        ],
        targetAudienceHints: [
            'Women experiencing breast sagging',
            'Post-pregnancy or weight loss patients',
            'Those preferring natural solution over implants',
            'Patients 35-55 seeking rejuvenation',
        ],
    },
    {
        name: 'Breast Reduction',
        slug: 'breast-reduction-miami',
        relatedKeywords: [
            'breast reduction miami',
            'breast reduction cost',
            'breast reduction recovery',
            'breast reduction insurance',
            'breast reduction before after',
            'breast reduction scars',
        ],
        commonPainPoints: [
            'Insurance coverage requirements',
            'How much can be removed',
            'Scarring and healing',
            'Breastfeeding after reduction',
            'Back and neck pain relief',
            'Cup size predictions',
            'Recovery and exercise restrictions',
        ],
        targetAudienceHints: [
            'Women with chronic back/neck pain',
            'Patients seeking functional improvement',
            'Those limited in physical activities',
            'Women seeking insurance-covered procedure',
        ],
    },
    {
        name: 'Liposuction',
        slug: 'liposuction-miami',
        relatedKeywords: [
            'liposuction miami',
            'lipo cost',
            'liposuction recovery',
            'liposuction before after',
            'lipo 360',
            'liposuction vs coolsculpting',
            'tumescent liposuction',
            'vaser liposuction',
        ],
        commonPainPoints: [
            'Liposuction vs non-surgical alternatives',
            'How much fat can be removed',
            'Recovery and compression garments',
            'Areas that can be treated',
            'Maintaining results long-term',
            'Lipo 360 vs targeted areas',
            'Skin tightening concerns',
        ],
        targetAudienceHints: [
            'Patients near ideal weight with stubborn fat',
            'Those who tried diet and exercise',
            'Patients seeking body contouring',
            'BBL candidates (fat transfer source)',
        ],
    },
    {
        name: 'Facelift',
        slug: 'facelift-miami',
        relatedKeywords: [
            'facelift miami',
            'facelift cost',
            'facelift recovery',
            'mini facelift',
            'facelift before after',
            'deep plane facelift',
            'facelift scars',
        ],
        commonPainPoints: [
            'Natural vs "done" look concerns',
            'Mini vs full facelift decision',
            'Recovery time and visibility',
            'How long results last',
            'Combining with neck lift',
            'Scar placement and visibility',
            'Age appropriateness for surgery',
        ],
        targetAudienceHints: [
            'Men and women 45-65',
            'Those with jowls and sagging',
            'Patients wanting long-lasting results',
            'Those seeking natural rejuvenation',
        ],
    },
    {
        name: 'Blepharoplasty (Eyelid Surgery)',
        slug: 'blepharoplasty-miami',
        relatedKeywords: [
            'blepharoplasty miami',
            'eyelid surgery cost',
            'upper eyelid surgery',
            'lower eyelid surgery',
            'blepharoplasty recovery',
            'eyelid surgery before after',
            'hooded eyelid surgery',
        ],
        commonPainPoints: [
            'Upper vs lower eyelid surgery',
            'Recovery and bruising timeline',
            'Natural-looking results',
            'Combining with other facial procedures',
            'Functional vs cosmetic surgery',
            'Insurance coverage for vision obstruction',
            'Scarring visibility',
        ],
        targetAudienceHints: [
            'Patients 40+ with tired appearance',
            'Those with hooded or droopy eyelids',
            'Patients seeking subtle rejuvenation',
            'Those with vision obstruction from eyelids',
        ],
    },
]

/**
 * Get procedure context by slug
 *
 * @param slug - The procedure URL slug
 * @returns ProcedureContext if found, undefined otherwise
 */
export function getProcedureContext(
    slug: string
): ProcedureContext | undefined {
    return PROCEDURE_CONTEXTS.find((p) => p.slug === slug)
}

/**
 * Get all procedure options for form dropdowns
 *
 * @returns Array of {value, label} pairs for select inputs
 */
export function getProcedureOptions(): { value: string; label: string }[] {
    return PROCEDURE_CONTEXTS.map((p) => ({
        value: p.slug,
        label: p.name,
    }))
}
