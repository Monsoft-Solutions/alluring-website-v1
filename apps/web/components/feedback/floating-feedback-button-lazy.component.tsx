/**
 * Lazy boundary for the beta feedback widget.
 *
 * The widget is gated on NEXT_PUBLIC_BETA_MODE, which is unset in
 * production — but a static import is bundled whether or not the component
 * ever renders, and this one drags react-hook-form, zod, @hookform/resolvers
 * and Radix Form into the shared chunk of every route. Loading it through
 * next/dynamic moves that stack into a chunk nothing fetches unless the flag
 * is on. See issue #199.
 *
 * @module components/feedback/floating-feedback-button-lazy
 */
'use client'

import dynamic from 'next/dynamic'

export const FloatingFeedbackButtonLazy = dynamic(
    () =>
        import('./floating-feedback-button.component').then(
            (m) => m.FloatingFeedbackButton
        ),
    { ssr: false }
)
