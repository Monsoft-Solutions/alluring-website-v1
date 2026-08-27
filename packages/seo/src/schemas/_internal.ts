import type { Thing, WithContext } from 'schema-dts'

// Deep import, not the `../config` barrel — that barrel also re-exports
// `seo.config`, whose helpers are dead weight in the browser. Every schema
// builder routes through `withContext`, and six client components render
// schema markup, so anything reachable from here ships to all of them.
// `image-object.schema.ts` already imports its constant this way.
import { SCHEMA_ORG_CONTEXT } from '../config/schema-org.constant'

export function withContext<T extends Thing>(value: T): WithContext<T> {
    // Use literal to satisfy schema-dts WithContext requirement
    const base = { '@context': SCHEMA_ORG_CONTEXT }
    const merged = Object.assign({}, base, value as object)
    return merged as WithContext<T>
}
