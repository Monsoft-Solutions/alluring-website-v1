import type { Review, WithContext } from 'schema-dts'

import { buildReviewJsonLd } from '../../schemas/review.schema'
import type { ReviewSchemaProps } from '../../types/schema/review.type'
import { JsonLd } from '../JsonLd.component'

export function ReviewSchema(props: ReviewSchemaProps) {
    const data: WithContext<Review> = buildReviewJsonLd(props)
    return <JsonLd data={data} />
}
