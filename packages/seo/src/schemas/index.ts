// Schema builders
export { buildOrganizationJsonLd } from './organization.schema'
export { buildWebSiteJsonLd } from './website.schema'
export { buildWebPageJsonLd } from './webpage.schema'
export { buildArticleJsonLd } from './article.schema'
export { buildBreadcrumbJsonLd } from './breadcrumb.schema'
export { buildFAQJsonLd } from './faq.schema'
export { buildProductJsonLd } from './product.schema'
export { buildReviewJsonLd } from './review.schema'
export { buildLocalBusinessJsonLd } from './local-business.schema'
export { buildImageObjectJsonLd } from './image-object.schema'

// Schema types
export type { ArticleSchemaProps } from '../types/schema/article.type'
export type {
    BreadcrumbItem,
    BreadcrumbSchemaProps,
} from '../types/schema/breadcrumb.type'
export type { FAQItem, FAQSchemaProps } from '../types/schema/faq.type'
export type {
    ProductOffer,
    ProductAggregateRating,
    ProductSchemaProps,
} from '../types/schema/product.type'
export type {
    ReviewRating,
    ReviewSchemaProps,
} from '../types/schema/review.type'
export type {
    LocalBusinessAddress,
    LocalBusinessGeo,
    LocalBusinessOpeningHours,
    LocalBusinessSchemaProps,
} from '../types/schema/local-business.type'
export type { OrganizationSchemaProps } from '../types/schema/organization.type'
export type { WebSiteSchemaProps } from '../types/schema/website.type'
export type { WebPageSchemaProps } from '../types/schema/webpage.type'
export type { ImageObjectSchemaProps } from '../types/schema/image-object.type'
