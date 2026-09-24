'use client'

/**
 * Web Vitals Reporter
 *
 * Sends the Core Web Vitals of each page load to GA4 as `web_vital`, so page
 * speed can be read per page type and procedure next to the page's
 * engagement and leads. Issue #279.
 *
 * - `metric_value` is in milliseconds, except CLS, which is ×1000 (GA4
 *   metrics are whole numbers): a CLS of 0.1 is sent as 100.
 * - The page context is the page that loaded, not the page open when the
 *   metric is reported: CLS and INP arrive when the tab is hidden, which can
 *   be several client navigations later.
 *
 * @module components/analytics/web-vitals-reporter
 */
import { useReportWebVitals } from 'next/web-vitals'
import { useEffect, useRef } from 'react'

import { trackEvent } from '@/lib/analytics/analytics.client'
import { getPageContext, type PageContext } from '@/lib/analytics/page-context'

const REPORTED_METRICS = new Set(['LCP', 'INP', 'CLS'])

/** The fields used from Next's metric (typed here: its re-export is opaque to lint). */
type ReportedMetric = {
    readonly id: string
    readonly name: string
    readonly value: number
    readonly rating: 'good' | 'needs-improvement' | 'poor'
}

export function WebVitalsReporter() {
    const loadedPage = useRef<PageContext | null>(null)

    // Mounted once, in the root layout: the path now is the page that loaded.
    useEffect(() => {
        loadedPage.current = getPageContext(window.location.pathname)
    }, [])

    useReportWebVitals((metric: ReportedMetric) => {
        if (!REPORTED_METRICS.has(metric.name)) return

        trackEvent('web_vital', {
            ...(loadedPage.current ?? getPageContext(window.location.pathname)),
            metric_name: metric.name,
            metric_value: Math.round(
                metric.name === 'CLS' ? metric.value * 1000 : metric.value
            ),
            metric_rating: metric.rating,
            metric_id: metric.id,
            non_interaction: true,
        })
    })

    return null
}
