/**
 * The breast augmentation page module's values that are not copy: its
 * renders. The label every AI image of a person carries is the kit's
 * `AI_MODEL_LABEL`.
 *
 * The copy itself lives in each section component, next to the markup that
 * lays it out. Figures come from `breast-augmentation.facts.ts`, and
 * `pnpm --filter web check:procedure-copy --slug breast-augmentation-miami`
 * checks the built page against it.
 *
 * @module
 */

import type { ModuleImage } from '@/components/procedures/module-kit/module-ui.constant'

const HERO_ALT =
    'Woman with dark hair in a low ponytail, in an ivory knit top, an open camel blazer and wide camel trousers, walking past a sculptural white facade with a palm beside it'

/**
 * CHECKPOINT ONLY, NOT FOR MERGE: candidate 1 of the 2026-09-30 round
 * (Design District), served as a local file so the review screenshots show
 * the real composition. Once the user picks a hero, the finals go to Blob
 * under `procedures/breast-augmentation/<yyyy-mm>/` and this points at the
 * URL `put()` returns. The candidates and prompts are in
 * `implementation-plans/2026-09-30-breast-augmentation-page-rebuild/images/README.md`.
 */
export const breastAugmentationImages = {
    /** 4:5. The page hero. */
    hero: {
        src: '/images/procedures/breast-augmentation-candidate/hero-candidate-1.jpg',
        width: 1440,
        height: 1800,
        alt: HERO_ALT,
    },
} as const satisfies Record<string, ModuleImage>
