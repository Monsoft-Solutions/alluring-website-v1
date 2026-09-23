/**
 * The BBL page module's values that are not copy: the #254 renders. The label
 * every AI image of a person carries is the kit's `AI_MODEL_LABEL`.
 *
 * The copy itself lives in each section component, next to the markup that
 * lays it out. Figures come from `bbl.facts.ts`, and
 * `pnpm --filter web check:bbl-copy` checks the built page against it.
 *
 * @module
 */

import type { ModuleImage } from '@/components/procedures/module-kit/module-ui.constant'

const BLOB =
    'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/procedures/brazilian-butt-lift/2026-09'

export type BblImage = ModuleImage

const HERO_ALT =
    'Woman in a sand linen midi dress with one hand on the window frame, looking out over the bay in morning light'

/**
 * The #254 renders. Prompts, job ids and picks are recorded in
 * `implementation-plans/2026-09-16-bbl-page-rebuild/images/README.md`. Shot 2,
 * the consultation render, stays on Blob but is off the page: it carried no
 * information, and a real photo will replace it.
 */
export const bblImages = {
    /** Shot 1, 4:5. The page hero. */
    hero: {
        src: `${BLOB}/hero-alluring-plastic-surgery-miami.jpg`,
        width: 1440,
        height: 1800,
        alt: HERO_ALT,
    },
    /**
     * Shot 1, outpainted to 16:9, for the places that need a wide crop:
     * og:image, the home signature card and the paid landing hero.
     */
    heroWide: {
        src: `${BLOB}/hero-wide-alluring-plastic-surgery-miami.jpg`,
        width: 2000,
        height: 1116,
        alt: HERO_ALT,
    },
} as const satisfies Record<string, BblImage>
