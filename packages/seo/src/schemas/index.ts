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
export { buildMedicalClinicJsonLd } from './medical-clinic.schema'
export { buildImageObjectJsonLd } from './image-object.schema'
export { buildVideoObjectJsonLd } from './video-object.schema'
export { buildImageGalleryJsonLd } from './image-gallery.schema'
export { buildMedicalProcedureJsonLd } from './medical-procedure.schema'
export { buildPhysicianJsonLd } from './physician.schema'
export { buildServiceJsonLd } from './service.schema'
export {
    buildSpeakableJsonLd,
    createSpeakableProperty,
    DEFAULT_SPEAKABLE_SELECTORS,
    PROCEDURE_SPEAKABLE_SELECTORS,
    BLOG_SPEAKABLE_SELECTORS,
} from './speakable.schema'
export { buildOfferJsonLd, buildOfferCatalogJsonLd } from './offer.schema'
export { buildItemListJsonLd } from './item-list.schema'

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
    ReviewVideo,
    ItemReviewedType,
} from '../types/schema/review.type'
export type {
    LocalBusinessAddress,
    LocalBusinessGeo,
    LocalBusinessOpeningHours,
    LocalBusinessSchemaProps,
} from '../types/schema/local-business.type'
export type {
    MedicalClinicAddress,
    MedicalClinicGeo,
    MedicalClinicOpeningHours,
    MedicalClinicAggregateRating,
    MedicalClinicContactPoint,
    MedicalClinicService,
    MedicalClinicSchemaProps,
} from '../types/schema/medical-clinic.type'
export type { OrganizationSchemaProps } from '../types/schema/organization.type'
export type { WebSiteSchemaProps } from '../types/schema/website.type'
export type { WebPageSchemaProps } from '../types/schema/webpage.type'
export type { ImageObjectSchemaProps } from '../types/schema/image-object.type'
export type { VideoObjectSchemaProps } from '../types/schema/video-object.type'
export type {
    ImageGalleryImage,
    ImageGallerySchemaProps,
} from '../types/schema/image-gallery.type'
export type { MedicalProcedureSchemaProps } from '../types/schema/medical-procedure.type'
export type {
    PhysicianSchemaProps,
    PhysicianService,
    PhysicianMembership,
    PhysicianEducation,
    PhysicianAddress,
    PhysicianCredential,
} from '../types/schema/physician.type'
export type {
    ServiceSchemaProps,
    ServiceProvider,
    ServiceOffer,
} from '../types/schema/service.type'
export type {
    OfferSchemaProps,
    OfferCatalogSchemaProps,
    OfferAvailability,
    OfferedItem,
    OfferProvider,
    OfferProviderAddress,
    OfferCatalogItem,
} from '../types/schema/offer.type'
export type {
    ItemListElement,
    ItemListSchemaProps,
} from '../types/schema/item-list.type'
