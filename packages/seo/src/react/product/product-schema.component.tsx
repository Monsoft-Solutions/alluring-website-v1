import type { Product, WithContext } from 'schema-dts'

import { buildProductJsonLd } from '../../schemas/product.schema'
import type { ProductSchemaProps } from '../../types/schema/product.type'
import { JsonLd } from '../JsonLd.component'

export function ProductSchema(props: ProductSchemaProps) {
    const data: WithContext<Product> = buildProductJsonLd(props)
    return <JsonLd data={data} />
}
