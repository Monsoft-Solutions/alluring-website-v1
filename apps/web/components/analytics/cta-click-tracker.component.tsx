'use client'

/**
 * CTA Click Tracker
 *
 * One delegated listener that sends `cta_click` — with where on the page the
 * button sat — for every conversion CTA on the site (`lib/analytics/
 * cta-click.ts`). Components mark a CTA with `data-cta="<name>"` instead of
 * tracking it themselves, so each click is sent once. Issue #279.
 *
 * Mount it once in the root layout; it renders nothing.
 *
 * @module components/analytics/cta-click-tracker
 */
import { useEffect } from 'react'

import { trackEvent } from '@/lib/analytics/analytics.client'
import { findCta, getCtaParams } from '@/lib/analytics/cta-click'

export function CtaClickTracker() {
    useEffect(() => {
        const onClick = (event: MouseEvent) => {
            const cta = findCta(event.target)
            if (cta) trackEvent('cta_click', getCtaParams(cta))
        }

        // Capture phase: runs before a handler can stop propagation or a
        // link navigates away.
        document.addEventListener('click', onClick, { capture: true })
        return () =>
            document.removeEventListener('click', onClick, { capture: true })
    }, [])

    return null
}
