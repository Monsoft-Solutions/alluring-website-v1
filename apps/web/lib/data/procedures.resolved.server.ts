/**
 * The procedure catalog with its claim tokens resolved (issue #354).
 *
 * Data files write an Alluring price inside prose as a claim token
 * (`[[price:tummy-tuck:full]]`), never a typed figure. Every server
 * component that prints procedure copy — the procedure routes, the home
 * cards, the procedures index, `llms*.txt`, the blog's related procedures —
 * reads it through here (or `resolveProcedureClaims`), so no raw token
 * reaches a reader. Read once per request (`cache`); the pricing resolver
 * underneath is cached and tagged `pricing`.
 *
 * Server-only: the catalog must never reach the client bundle (#210).
 *
 * @module lib/data/procedures.resolved
 */
import 'server-only'

import { cache } from 'react'

import { resolveProcedureClaims } from '@/lib/claims/resolve-claims.server'
import { procedures } from '@/lib/data/procedures.data'
import type { Procedure } from '@/lib/types/procedure.type'

/** Every procedure, in catalog order, tokens resolved. */
export const getResolvedProcedures = cache(
    (): Promise<Procedure[]> =>
        Promise.all(procedures.map(resolveProcedureClaims))
)

/** One procedure by slug, tokens resolved, or `undefined`. */
export async function getResolvedProcedureBySlug(
    slug: string
): Promise<Procedure | undefined> {
    return (await getResolvedProcedures()).find(
        (procedure) => procedure.slug === slug
    )
}
