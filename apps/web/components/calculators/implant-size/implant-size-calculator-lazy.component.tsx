'use client'

/**
 * The implant size calculator behind `React.lazy`, so its code is an async
 * chunk that only a page rendering it downloads.
 *
 * Every blog post renders through the same two routes, and a client component
 * imported directly from their server tree lands in the route's own chunks,
 * the ones every post loads. Measured with `pnpm size:check` on this branch
 * (2026-10-12, brotli first-load JS):
 *
 * - direct import: +1.9 KB on all 141 post routes;
 * - `next/dynamic`: +0.3 KB on post routes, and +0.16 KB on every other route,
 *   because Turbopack regrouped its loader modules in the root chunks;
 * - `React.lazy` (this file): +0.2 KB on post routes, about 0.01 KB elsewhere.
 *
 * The calculator still server-renders: the server resolves the import, the
 * form is in the HTML, and the Suspense boundary keeps that HTML on screen
 * until the chunk arrives and hydrates it.
 *
 * `LazyBoundary` renders nothing if the chunk fails to load (a tab left open
 * across a deploy), rather than letting the throw take down the post.
 *
 * @module components/calculators/implant-size/implant-size-calculator-lazy
 */
import { type ComponentProps, lazy, Suspense } from 'react'

import { LazyBoundary } from '@/components/shared/lazy-boundary.component'

import type { ImplantSizeCalculator as Calculator } from './implant-size-calculator.component'

const ImplantSizeCalculator = lazy(() =>
    import('./implant-size-calculator.component').then((module) => ({
        default: module.ImplantSizeCalculator,
    }))
)

export function ImplantSizeCalculatorLazy(
    props: ComponentProps<typeof Calculator>
) {
    return (
        <LazyBoundary label='Implant size calculator'>
            <Suspense fallback={null}>
                <ImplantSizeCalculator {...props} />
            </Suspense>
        </LazyBoundary>
    )
}
