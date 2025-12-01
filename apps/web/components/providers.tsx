'use client'

import * as React from 'react'

import { ConsentProvider } from '@/lib/analytics/consent.context'
import { UTMTrackingProvider } from '@/lib/analytics/utm-tracking.context'

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <UTMTrackingProvider>
            <ConsentProvider>{children}</ConsentProvider>
        </UTMTrackingProvider>
    )
}
