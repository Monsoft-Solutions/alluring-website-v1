/**
 * The A/B test on Dr. Karlinsky's page (#332): which hero a phone visitor
 * sees first. Both arms are new; the v1 hero (the whole form on the first
 * screen) is out of the test.
 *
 *   arch   her message's poster in a wide arch, the headline and one gold
 *          button that goes to the form, which starts right below a hairline
 *          (the user's pick)
 *   pick   "Pick one to start": her story ring, the headline and the
 *          procedures as big tiles; choosing one opens first name, mobile
 *          and the send button in place. "A message from me" further down
 *
 * On a desktop both arms show the story row and the form beside the film
 * (the pick arm's form with its tiles); the arm still applies there so the
 * numbers stay whole. Built on the ads landing page's machinery
 * (`lp-form-variant.ts`): the arm is chosen per visitor in `middleware.ts`
 * before the page renders, kept 90 days in a cookie, and handed to the page
 * in a request header, so nothing swaps after hydration. A cookie naming an
 * arm that no longer exists (v1's `form`) is simply drawn again.
 *
 *   ?hv=arch | ?hv=pick   forces an arm (QA), and keeps it
 *   DRK_HERO_SPLIT        each arm's share of new visitors: 'arch:50,pick:50'
 *                         when unset, 'arch:100' to end the test on the arch
 *
 * The arm is stored on the lead as part of `page_variant`
 * (`drk-ig-v2-arch` / `drk-ig-v2-pick`) and sent with every `drk_*` event as
 * `hero_arm`. No React and no Next here: the middleware (Edge) uses it.
 */

import {
    type AssignInput,
    type Assignment,
    assignVariant,
    COOKIE_MAX_AGE,
    parseSplit,
    type Split,
    toVariant,
} from '@/components/landing-pages/request-consultation/lp-form-variant'

export const DRK_HERO_ARMS = ['arch', 'pick'] as const
export type DrkHeroArm = (typeof DRK_HERO_ARMS)[number]

export const DRK_HERO_COOKIE = 'drk_hv'
export const DRK_HERO_HEADER = 'x-drk-hv'
export const DRK_HERO_QUERY = 'hv'
export const DRK_HERO_COOKIE_MAX_AGE = COOKIE_MAX_AGE

/** When the page renders without the middleware's header (tests, previews). */
export const DRK_HERO_FALLBACK: DrkHeroArm = 'arch'

export const DEFAULT_DRK_HERO_SPLIT: Split<DrkHeroArm> = { arch: 50, pick: 50 }

export const toDrkHeroArm = (value: string | null | undefined) =>
    toVariant(DRK_HERO_ARMS, value)

export const parseDrkHeroSplit = (raw: string | null | undefined) =>
    parseSplit(DRK_HERO_ARMS, DEFAULT_DRK_HERO_SPLIT, raw)

export const assignDrkHeroArm = (
    input: AssignInput<DrkHeroArm>
): Assignment<DrkHeroArm> => assignVariant(DRK_HERO_ARMS, input)
