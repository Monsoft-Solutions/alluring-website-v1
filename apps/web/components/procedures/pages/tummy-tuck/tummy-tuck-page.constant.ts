/**
 * The tummy tuck page module's values that are not copy: its renders. The
 * label every AI image of a person carries is the kit's `AI_MODEL_LABEL`.
 *
 * The copy itself lives in each section component, next to the markup that
 * lays it out. Figures come from `tummy-tuck.facts.ts`, and
 * `pnpm --filter web check:procedure-copy --slug tummy-tuck-miami` checks the
 * built page against it.
 *
 * @module
 */

import type { ModuleImage } from '@/components/procedures/module-kit/module-ui.constant'

const BLOB =
    'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/procedures/tummy-tuck/2026-09'

const HERO_ALT =
    'Woman with long dark curls in a black sleeveless high-neck top and a champagne pleated midi skirt, a woven bag on her shoulder, walking through a sunlit stone arcade with palms behind her'

/**
 * The 2026-09 hero, candidate 7 of two rounds, picked by the user.
 * Candidates, the pick and the prompts are recorded in
 * `implementation-plans/2026-09-28-tummy-tuck-page-rebuild/images/README.md`.
 */
export const tummyTuckImages = {
    /** 4:5. The page hero. */
    hero: {
        src: `${BLOB}/hero-alluring-plastic-surgery-miami.jpg`,
        width: 1440,
        height: 1800,
        alt: HERO_ALT,
    },
} as const satisfies Record<string, ModuleImage>
