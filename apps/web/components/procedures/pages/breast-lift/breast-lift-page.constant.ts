/**
 * The breast lift page module's values that are not copy: its renders. The
 * label every AI image of a person carries is the kit's `AI_MODEL_LABEL`.
 *
 * The copy itself lives in each section component, next to the markup that
 * lays it out. Figures come from `breast-lift.facts.ts`, and
 * `pnpm --filter web check:procedure-copy --slug breast-lift-miami` checks
 * the built page against it.
 *
 * @module
 */

import type { ModuleImage } from '@/components/procedures/module-kit/module-ui.constant'

const HERO_ALT =
    'Woman with long chestnut waves in a white short-sleeved midi dress and woven sandals, standing on a shaded Coconut Grove garden path under a banyan tree, one hand resting on a hanging aerial root'

/**
 * The 2026-09 hero: candidate 2 of four (`gpt_image_2_5`, job
 * `5d5dfc82-7595-4f3b-b409-a611f7852a44`), picked 2026-10-28. Candidates and
 * prompts:
 * `implementation-plans/2026-09-30-breast-lift-page-rebuild/images/README.md`.
 */
export const breastLiftImages = {
    /** 4:5. The page hero. */
    hero: {
        src: 'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/procedures/breast-lift/2026-11/hero-alluring-plastic-surgery-miami.jpg',
        width: 1440,
        height: 1800,
        alt: HERO_ALT,
    },
} as const satisfies Record<string, ModuleImage>
