/**
 * LazyBoundary
 *
 * Renders nothing if its child fails to load or throws.
 *
 * The exit-intent popup and the promotion modal are mounted from the root
 * layout and their panels are fetched on demand (issue #199). `next/dynamic`
 * wraps the import in `React.lazy`, so a rejected fetch throws during render —
 * and with no `app/error.tsx` or `app/global-error.tsx` in this app, that
 * throw escalates to Next's default global error boundary and replaces the
 * whole page.
 *
 * The realistic trigger is a stale tab: a visitor has the site open, a deploy
 * ships new hashed chunks, the old ones are purged, and 60 or 120 seconds
 * later the popup timer fires and the chunk 404s. Blanking the page over a
 * lead-capture popup the visitor never asked for is far worse than not showing
 * it, so a failure here is swallowed deliberately.
 *
 * @module components/shared/lazy-boundary
 */
'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'

export type LazyBoundaryProps = {
    children: ReactNode
    /** Labels the failure in the console so it is attributable. */
    label: string
}

type LazyBoundaryState = { hasError: boolean }

export class LazyBoundary extends Component<
    LazyBoundaryProps,
    LazyBoundaryState
> {
    state: LazyBoundaryState = { hasError: false }

    static getDerivedStateFromError(): LazyBoundaryState {
        return { hasError: true }
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        // Not silent — swallowing the render is the point, losing the signal
        // is not. A ChunkLoadError here usually means a deploy purged the
        // chunk this tab was holding a reference to.
        console.error(
            `[LazyBoundary] ${this.props.label} failed to load`,
            error,
            info.componentStack
        )
    }

    render() {
        return this.state.hasError ? null : this.props.children
    }
}
