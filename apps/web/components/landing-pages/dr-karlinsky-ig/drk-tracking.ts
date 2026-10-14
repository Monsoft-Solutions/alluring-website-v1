/**
 * The page's own events: pushed to the dataLayer for GTM, like the ads
 * landing page's `lp_*` events, and sent to GA4 too, so the video can be
 * read in GA4 without a GTM change.
 *
 * Every event carries the page variant and the language. Nothing about the
 * visitor: no name, number or procedure.
 */

import { pushDataLayer } from '@/components/landing-pages/request-consultation/lp-tracking'
import { trackEvent } from '@/lib/analytics/analytics.client'

import { DRK_PAGE_VARIANT } from './drk-config'

type Params = Readonly<Record<string, string | number>>

export function trackDrkEvent(
    event: string,
    lang: string,
    params: Params = {}
): void {
    pushDataLayer({ event, pageVariant: DRK_PAGE_VARIANT, lang, ...params })
    trackEvent(event, { page_variant: DRK_PAGE_VARIANT, lang, ...params })
}
