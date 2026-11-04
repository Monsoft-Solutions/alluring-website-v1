/**
 * The mommy makeover page module's values that are not copy: its renders, the
 * worked price examples (none yet) and the sources the page cites. The label
 * every AI image of a person carries is the kit's `AI_MODEL_LABEL`.
 *
 * The copy itself lives in each section component, next to the markup that
 * lays it out. Figures come from `mommy-makeover.facts.ts`, and
 * `pnpm --filter web check:procedure-copy --slug mommy-makeover-miami` checks
 * the built page against it.
 *
 * @module
 */

import type { ModuleImage } from '@/components/procedures/module-kit/module-ui.constant'
import {
    mommyMakeoverSources,
    type MommyMakeoverSourceId,
} from '@/lib/data/procedures/facts/mommy-makeover.facts'
import type { ProcedurePriceOption } from '@/lib/types/procedure.type'

const BLOB =
    'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/procedures/mommy-makeover/2026-11'

/**
 * The 2026-11 renders, the same woman in all of them. Candidates, the picks and
 * the prompts are recorded in
 * `implementation-plans/2026-11-03-mommy-makeover-page-and-cluster/page/images/README.md`.
 */
export const mommyMakeoverImages = {
    /** 4:5. The page hero. */
    hero: {
        src: `${BLOB}/hero-woman-linen-dress-terrace-alluring-plastic-surgery-miami.jpg`,
        width: 1440,
        height: 1800,
        alt: 'Woman with a long dark braid in a sand linen shirt dress, sitting in a rattan chair on a shaded terrace, holding a coffee cup at a stone table with a small straw sun hat on it, palm shadows on the plaster wall behind her',
    },
    /**
     * 16:9, the same URL as `procedure.image` in the data file: og:image, the
     * procedure cards and the landing hero. Not rendered by this module.
     */
    heroWide: {
        src: `${BLOB}/hero-wide-woman-linen-dress-terrace-alluring-plastic-surgery-miami.jpg`,
        width: 2000,
        height: 1116,
        alt: 'Wide view of a woman with a long dark braid in a sand linen shirt dress, sitting in a rattan chair at a round stone table with a coffee cup and a small straw sun hat, on a shaded terrace with a garden on the left and palm shadows on a plaster wall on the right',
    },
    /** 3:2. `#recovery`: another adult with the child while she rests. */
    recovery: {
        src: `${BLOB}/recovery-reading-on-sofa-toddler-playing-alluring-plastic-surgery-miami.jpg`,
        width: 2000,
        height: 1328,
        alt: 'Woman with a long dark braid resting on a sofa with pillows behind her and a knitted throw over her legs, holding an open book, while another woman and a toddler play with wooden blocks on the rug behind her, out of focus',
    },
    /** 3:2, shown through an arch. `#candidate`: writing her own questions. */
    questions: {
        src: `${BLOB}/questions-notebook-cafe-table-alluring-plastic-surgery-miami.jpg`,
        width: 2000,
        height: 1328,
        alt: 'Woman with a long dark braid in a cream blouse writing in a small notebook at a marble café table in a shaded stone arcade, with a coffee cup and a glass of water beside her',
    },
} as const satisfies Record<string, ModuleImage>

/**
 * Worked examples of a whole plan: none, because the practice's price sheet has
 * no mommy makeover line and how a plan is priced waits on the owner.
 * `#pricing` renders the table only when this list has rows, so adding them is
 * this list plus a `price-example-*` fact for each figure in
 * `mommy-makeover.facts.ts`, and the sweep's `no-total` rule relaxed for them.
 */
export const planExamples: ProcedurePriceOption[] = []

/**
 * The sources this page cites, in the order the list shows them: the facts file
 * also holds sources only the cluster's blog posts use, and the page lists what
 * it actually draws on.
 */
const pageSourceIds: readonly MommyMakeoverSourceId[] = [
    'asps-mommy-makeover',
    'asps-mommy-makeover-candidates',
    'asps-mommy-makeover-cost',
    'asps-postpartum-2024',
    'asps-campanile-2018',
    'asps-wu-2019',
    'asps-vitenas-2018',
    'asps-tummy-tuck',
    'asps-tummy-tuck-cost',
    'asps-breast-augmentation-cost',
    'asps-breast-lift-cost',
    'aesthetic-society-mommy-makeover',
    'aesthetic-society-aftercare',
    'aesthetic-society-preparing',
    'aesthetic-society-liposuction-recovery',
    'cleveland-clinic-mommy-makeovers',
    'cleveland-clinic-tummy-tuck-scar',
    'fda-implant-risks',
    'medlineplus-wound-care',
    'medlineplus-dvt',
    'winocour-2015',
    'winocour-2017',
    'hardy-2014',
    'skorochod-wolf-2026',
    'karunaratne-2023',
    'florida-rule-64b8-9-009',
]

export const mommyMakeoverPageSources = pageSourceIds.flatMap((id) =>
    mommyMakeoverSources.filter((source) => source.id === id)
)

/**
 * The gallery groups the results rail reads, this procedure's own first: a
 * mommy makeover is often filed under one of its parts. The rail keeps only the
 * photos that name a mommy makeover.
 */
export const RESULT_GROUPS = [
    'mommy-makeover-miami',
    'tummy-tuck-miami',
    'breast-lift-miami',
    'breast-reduction-miami',
    'liposuction-miami',
] as const

/**
 * Photos taken in the operating room or still in surgical dressings are real,
 * but they aren't results: the page says a final result takes months to show.
 * They stay in the gallery and out of the rail.
 */
export const NOT_A_RESULT = /operating room|surgical dressings/i

/**
 * Gallery records the rail skips by name, found by opening the rail on
 * 2026-11-03, because their text can't tell the page. The first two show the
 * "after" on the operating table, though their alt text doesn't say so. The
 * other three are byte-for-byte copies of a photo the rail already shows under
 * another slug (`...-body-contouring` and `...-body-contouring-miami`). All five
 * are on the list for the admin; once they are fixed there, this can go.
 */
export const RAIL_SKIP_SLUGS: ReadonlySet<string> = new Set([
    'mommy-makeover-before-after-miami-6',
    'mommy-makeover-before-after-miami-7',
    'mommy-makeover-before-after-miami-body-contour',
    'mommy-makeover-before-after-miami-body-transformation',
    'mommy-makeover-before-after-miami-transformation',
])

/**
 * A review crediting another surgeon, which sits badly under "one surgeon
 * performs every mommy makeover". It is still on Google and at `/reviews`. What
 * happens to it across the site is the owner's call; once decided, this can go.
 */
export const NAMES_ANOTHER_SURGEON = /\bDr\.?\s*Lofman\b/i

/** Reviews of the parts of a plan, which fill in after the ones naming it. */
export const RELATED_REVIEW_SLUGS = [
    'tummy-tuck-miami',
    'breast-augmentation-miami',
    'breast-lift-miami',
    'liposuction-miami',
] as const
