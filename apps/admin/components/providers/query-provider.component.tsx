'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, type ReactNode } from 'react'

import { env } from '@/env'

type QueryProviderProps = {
    children: ReactNode
}

/**
 * TanStack Query provider with optimized defaults for admin dashboard.
 *
 * Configuration:
 * - staleTime: 30s - Data considered fresh for 30 seconds
 * - gcTime: 5min - Unused data garbage collected after 5 minutes
 * - retry: 2 - Retry failed requests twice
 * - refetchOnWindowFocus: true - Refetch when window regains focus
 */
export function QueryProvider({ children }: QueryProviderProps) {
    // Create QueryClient in state to prevent recreation on re-renders
    // and ensure one client per component tree
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Data stays fresh for 30 seconds before refetching
                        staleTime: 30_000,
                        // Garbage collect unused data after 5 minutes
                        gcTime: 5 * 60 * 1000,
                        // Retry failed requests twice with exponential backoff
                        retry: 2,
                        // Refetch when window regains focus
                        refetchOnWindowFocus: true,
                        // Don't refetch on mount if data is fresh
                        refetchOnMount: true,
                        // Refetch on reconnect
                        refetchOnReconnect: true,
                    },
                    mutations: {
                        // Retry mutations once
                        retry: 1,
                    },
                },
            })
    )

    const isDevelopment = env.NODE_ENV === 'development'

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {isDevelopment && (
                <ReactQueryDevtools
                    initialIsOpen={false}
                    buttonPosition='bottom-left'
                />
            )}
        </QueryClientProvider>
    )
}
