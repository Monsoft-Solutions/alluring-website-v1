import type { FAQPage, Question, WithContext } from 'schema-dts'

import type { FAQSchemaProps } from '../types/schema/faq.type'
import { withContext } from './_internal'

export function buildFAQJsonLd(props: FAQSchemaProps): WithContext<FAQPage> {
    const mainEntity: Question[] = props.items.map((it) => ({
        '@type': 'Question',
        name: it.question,
        acceptedAnswer: { '@type': 'Answer', text: it.answer },
    }))

    const faq: FAQPage = {
        '@type': 'FAQPage',
        mainEntity,
    }

    return withContext(faq)
}
