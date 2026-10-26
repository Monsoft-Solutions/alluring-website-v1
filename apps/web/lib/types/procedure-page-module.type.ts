/**
 * The contract between `/procedures/[slug]` and the component that renders a
 * procedure's page body.
 *
 * The route owns everything that must stay identical across procedures —
 * metadata, static params, the JSON-LD graph — and hands the body to a page
 * module. Most procedures use the shared template; a procedure with a layout
 * of its own registers a module in `procedure-page-registry.ts` (#255).
 *
 * @module
 */
import type { ReactNode } from 'react'

import type { ProcedureSummary } from '@/lib/data/procedure-summary.util'
import type { ProcedurePrices } from '@/lib/claims/procedure-prices.util'
import type { Procedure } from '@/lib/types/procedure.type'

export type ProcedurePageModuleProps = {
    /** The validated procedure this page is about. */
    procedure: Procedure
    /** Up to three procedures from the same category, projected for cards. */
    relatedProcedures: ProcedureSummary[]
    /** The site origin, with no trailing slash. */
    siteUrl: string
    /** The canonical URL of this page. */
    pageUrl: string
    /**
     * The procedure's prices from the pricing resolver (#354): the starting
     * line, every line, BBL's range and the 456.062 statement while a
     * discount is on. The page prints these through `PriceTag`; the
     * structured-data graph reads the same object.
     */
    prices: ProcedurePrices
}

/** A server component that renders a procedure's page body. */
export type ProcedurePageModule = (
    props: ProcedurePageModuleProps
) => ReactNode | Promise<ReactNode>
