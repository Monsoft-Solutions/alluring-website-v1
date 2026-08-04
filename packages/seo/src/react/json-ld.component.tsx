import type { Thing, WithContext } from 'schema-dts'

import { sanitizeForJsonLd } from '../utils'

type JsonLdProps<T extends Thing> = {
    data: WithContext<T>
}

/**
 * Renders a schema.org graph as a JSON-LD script tag in the server HTML.
 *
 * IMPORTANT — do not "modernize" this back to `next/script`.
 *
 * In the App Router, `next/script` (any strategy, including
 * `beforeInteractive`) never emits a literal
 * `<script type="application/ld+json">` into the server-rendered HTML. Next
 * serializes the script descriptor into the `self.__next_s` bootstrap array
 * and injects the tag from JavaScript after hydration. Google's renderer
 * executes JS and can still pick that up, but AI crawlers — GPTBot,
 * ClaudeBot, PerplexityBot and friends — do not run JavaScript, so they see
 * a page with zero structured data.
 *
 * A plain `<script>` element rendered by this server component is emitted
 * verbatim into the initial HTML response, so every crawler sees the schema.
 *
 * The payload goes through {@link sanitizeForJsonLd}, which escapes `<`, `>`,
 * `&` and the U+2028/U+2029 line separators so the serialized data cannot
 * break out of the script tag.
 *
 * @param data - A schema.org entity including its `@context`.
 * @returns A JSON-LD script element containing the serialized entity.
 */
export function JsonLd<T extends Thing>({ data }: JsonLdProps<T>) {
    const json = sanitizeForJsonLd(data)
    return (
        <script
            type='application/ld+json'
            dangerouslySetInnerHTML={{ __html: json }}
        />
    )
}
