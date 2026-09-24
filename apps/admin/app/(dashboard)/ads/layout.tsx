import type { ReactNode } from 'react'

import { AdsRangeProvider } from '@/components/ads/ads-range.context'

// The provider reads `?from=&to=` with useSearchParams. Rendering on request
// lets it do that without a Suspense boundary — one here made the server and
// client disagree on the sidebar's Radix ids (a hydration mismatch).
export const dynamic = 'force-dynamic'

/**
 * The Ads console (epic #288). The date window lives here so it survives
 * moving between the /ads screens.
 */
export default function AdsLayout({ children }: { children: ReactNode }) {
    return <AdsRangeProvider>{children}</AdsRangeProvider>
}
