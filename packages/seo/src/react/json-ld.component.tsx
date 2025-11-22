import Script from 'next/script'
import type { Thing, WithContext } from 'schema-dts'

import { sanitizeForJsonLd } from '../utils'

type JsonLdProps<T extends Thing> = {
    data: WithContext<T>
}

export function JsonLd<T extends Thing>({ data }: JsonLdProps<T>) {
    const json = sanitizeForJsonLd(data)
    return (
        <Script
            type='application/ld+json'
            strategy='beforeInteractive'
            dangerouslySetInnerHTML={{ __html: json }}
        />
    )
}
