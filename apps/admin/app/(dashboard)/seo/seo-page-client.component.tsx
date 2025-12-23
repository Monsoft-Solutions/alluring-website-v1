'use client'

import type { ReactNode } from 'react'

import { useSearchConsoleSummary } from '@/hooks/use-search-console.hook'
import { SearchConsoleNotConfigured } from '@/components/seo/search-console-not-configured.component'
import { Skeleton } from '@workspace/ui/components/skeleton'

type SeoPageClientProps = {
    children: ReactNode
}

/**
 * Client wrapper for SEO page that checks if Search Console is configured.
 * Shows setup instructions if not configured, otherwise renders children.
 */
export function SeoPageClient({ children }: SeoPageClientProps) {
    const { data, isLoading } = useSearchConsoleSummary()

    if (isLoading) {
        return (
            <div className='space-y-6'>
                <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className='h-28' />
                    ))}
                </div>
                <Skeleton className='h-80' />
                <Skeleton className='h-96' />
            </div>
        )
    }

    // If not configured, show setup instructions
    if (!data?.configured) {
        return <SearchConsoleNotConfigured />
    }

    // Configured - show the actual dashboard
    return <>{children}</>
}
