import type { AggregateRating, Offer, Product, WithContext } from 'schema-dts'

import type {
    ProductOffer,
    ProductSchemaProps,
} from '../types/schema/product.type'
import { withContext } from './_internal'

export function buildProductJsonLd(
    props: ProductSchemaProps
): WithContext<Product> {
    const product: Product = {
        '@type': 'Product',
        name: props.name,
        description: props.description,
        sku: props.sku,
        brand: props.brand,
        image: props.image,
        url: props.url,
    }

    if (props.offers) {
        const mapOffer = (o: ProductOffer): Offer => ({
            '@type': 'Offer',
            price: String(o.price),
            priceCurrency: o.priceCurrency,
            availability: o.availability as unknown as Offer['availability'],
            url: o.url,
        })
        product.offers = Array.isArray(props.offers)
            ? ((props.offers as ProductOffer[]).map(
                  mapOffer
              ) as unknown as Offer[])
            : (mapOffer(props.offers as ProductOffer) as unknown as Offer)
    }

    if (props.aggregateRating) {
        const ar = props.aggregateRating
        const agg: AggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: ar.ratingValue,
            reviewCount: ar.reviewCount,
        }
        product.aggregateRating = agg
    }

    return withContext(product)
}
