// Deep import, not the `../utils` barrel — see the note in
// `json-ld.component.tsx`. The barrel pulls zod into client bundles (#210).
import { sanitizeForJsonLd } from '../utils/sanitize.util'

/**
 * One entity in a graph.
 *
 * Deliberately looser than `schema-dts`' `Thing`: that type is a union of
 * ~1,800 members, and asking TypeScript to relate a hand-assembled node to it
 * either fails or blows the union-complexity limit. The builders in this
 * package already cast at their own boundary for the same reason
 * (`service.schema.ts`, `offer.schema.ts`). What is enforced is the part that
 * matters for a graph — every node declares an `@type` — and callers holding a
 * `WithContext<Thing>` from a builder pass it through with one cast.
 */
export type JsonLdGraphNode = {
    '@type': string | readonly string[]
    [key: string]: unknown
}

type JsonLdGraphProps = {
    /**
     * The entities to publish. Each may carry its own `@context` — every
     * `build*JsonLd` helper in this package adds one — and it is stripped
     * here, because a graph declares the context once at the top.
     *
     * Falsy entries are dropped, so callers can write
     * `[node, condition && otherNode]` without filtering first.
     */
    nodes: readonly (JsonLdGraphNode | false | null | undefined)[]
}

/** `@context` belongs to the graph, not to the nodes inside it. */
function stripContext(node: JsonLdGraphNode): Record<string, unknown> {
    const copy: Record<string, unknown> = { ...node }
    delete copy['@context']
    return copy
}

/**
 * Renders several schema.org entities as **one** `@graph` script tag.
 *
 * A page that emits one `<script type="application/ld+json">` per entity —
 * the procedure pages emitted 16 to 18 of them — repeats `@context` and the
 * business's identity in every block, and leaves the entities unrelated:
 * nothing says the `SurgicalProcedure` and the `WebPage` are the same subject.
 * A graph states the context once and lets nodes reference each other by
 * `@id`, which is how Google's own documentation models a page.
 *
 * Renders a plain `<script>` for the same reason {@link JsonLd} does: AI
 * crawlers do not run JavaScript, so anything injected after hydration is
 * invisible to them.
 *
 * @param nodes - Entities to publish; falsy entries and `@context` keys are dropped.
 * @returns One JSON-LD script element, or `null` when there is nothing to publish.
 */
export function JsonLdGraph({ nodes }: JsonLdGraphProps) {
    const graph = nodes
        .filter((node): node is JsonLdGraphNode => Boolean(node))
        .map(stripContext)

    if (graph.length === 0) return null

    const json = sanitizeForJsonLd({
        '@context': 'https://schema.org',
        '@graph': graph,
    })

    return (
        <script
            type='application/ld+json'
            dangerouslySetInnerHTML={{ __html: json }}
        />
    )
}
