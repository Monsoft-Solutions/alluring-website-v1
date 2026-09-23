/**
 * The liposuction page module's values that are not copy: its renders. The
 * label every AI image of a person carries is the kit's `AI_MODEL_LABEL`.
 *
 * The copy itself lives in each section component, next to the markup that
 * lays it out. Figures come from `lipo.facts.ts`, and
 * `pnpm --filter web check:procedure-copy --slug liposuction-miami` checks the
 * built page against it.
 *
 * @module
 */

import type { ModuleImage } from '@/components/procedures/module-kit/module-ui.constant'

const BLOB =
    'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/procedures/liposuction/2026-09'

const HERO_ALT =
    'Woman in ivory wide-leg linen trousers and a taupe knit top walking along a sunlit limestone hallway with a camel blazer over her arm, glancing toward the curtained windows'

/**
 * The 2026-09 hero. Prompts, job ids and the pick are recorded in
 * `implementation-plans/2026-09-22-liposuction-page-rebuild/images/README.md`.
 */
export const lipoImages = {
    /** 4:5. The page hero. */
    hero: {
        src: `${BLOB}/hero-alluring-plastic-surgery-miami.jpg`,
        width: 1440,
        height: 1800,
        alt: HERO_ALT,
    },
} as const satisfies Record<string, ModuleImage>
