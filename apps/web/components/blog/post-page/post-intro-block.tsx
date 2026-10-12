import type { ReactNode } from 'react'

import { ImplantSizeCalculatorLazy } from '@/components/calculators/implant-size/implant-size-calculator-lazy.component'

import { POST_CONSULT_ID } from './post-page.copy'

/**
 * Blocks the v2 template puts before a post's first H2, keyed on the slug.
 *
 * They live in code, never in the post's stored markdown: the autopilot
 * refresh loop rewrites post bodies and would drop or mangle them. Only the
 * slugs listed here render their block, and each block's client code is an
 * async chunk (`React.lazy`), so no other post downloads it.
 *
 * - `breast-implant-size-guide`: ranks around position 2 for "breast implant
 *   size calculator" (Search Console, 27 Sep to 9 Oct 2026, ~24 impressions a
 *   day, no clicks): the searcher wants a tool, so the post gets one.
 */
const POST_INTRO_BLOCKS: Readonly<Record<string, () => ReactNode>> = {
    'breast-implant-size-guide': () => (
        <ImplantSizeCalculatorLazy
            consultHref={`#${POST_CONSULT_ID}`}
            consultProcedure='breast-augmentation'
            consultEntry='calculator'
        />
    ),
}

/** The block for this post's intro, or null for every other post. */
export function getPostIntroBlock(slug: string): ReactNode {
    return POST_INTRO_BLOCKS[slug]?.() ?? null
}
