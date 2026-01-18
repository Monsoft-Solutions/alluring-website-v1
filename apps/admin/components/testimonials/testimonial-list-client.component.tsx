'use client'

import type { ReactNode } from 'react'

interface TestimonialListClientProps {
    children: ReactNode
}

/**
 * Client wrapper for testimonial list.
 * Provides a container for client-side interactions.
 */
export function TestimonialListClient({
    children,
}: TestimonialListClientProps) {
    return <div className='space-y-4'>{children}</div>
}
