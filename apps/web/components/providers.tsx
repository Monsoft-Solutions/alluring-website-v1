'use client'

import * as React from 'react'

import { ConsentProvider } from '@/lib/analytics'

export function Providers({ children }: { children: React.ReactNode }) {
    return <ConsentProvider>{children}</ConsentProvider>
}
