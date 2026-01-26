// SEO Config types
export type {
    SEOConfig,
    DefaultMetadata,
    TwitterConfig,
    TwitterCardType,
    OpenGraphConfig,
    OpenGraphType,
    OrganizationConfig,
    RobotsConfig,
    EnvironmentConfig,
    SocialProfile,
    ContactInfo,
    ImageMetadata,
} from '../config/seo-config.type'

// Schema types
export type {
    ArticleSchemaProps,
    ArticleAuthor,
    ArticleReviewer,
} from './schema/article.type'
export type {
    BreadcrumbItem,
    BreadcrumbSchemaProps,
} from './schema/breadcrumb.type'
export type { FAQItem, FAQSchemaProps } from './schema/faq.type'
export type {
    ProductOffer,
    ProductAggregateRating,
    ProductSchemaProps,
} from './schema/product.type'
export type {
    ReviewRating,
    ReviewSchemaProps,
    ReviewVideo,
    ItemReviewedType,
} from './schema/review.type'
export type {
    LocalBusinessAddress,
    LocalBusinessGeo,
    LocalBusinessOpeningHours,
    LocalBusinessSchemaProps,
} from './schema/local-business.type'
export type {
    MedicalClinicAddress,
    MedicalClinicGeo,
    MedicalClinicOpeningHours,
    MedicalClinicAggregateRating,
    MedicalClinicContactPoint,
    MedicalClinicService,
    MedicalClinicSchemaProps,
} from './schema/medical-clinic.type'
export type { OrganizationSchemaProps } from './schema/organization.type'
export type { WebSiteSchemaProps } from './schema/website.type'
export type { WebPageSchemaProps } from './schema/webpage.type'
export type { ImageObjectSchemaProps } from './schema/image-object.type'
export type {
    SpeakableSpecification,
    SpeakableSchemaProps,
    ArticleWithSpeakable,
    WebPageWithSpeakable,
} from './schema/speakable.type'
export type {
    OfferSchemaProps,
    OfferCatalogSchemaProps,
    OfferAvailability,
    OfferedItem,
    OfferProvider,
    OfferProviderAddress,
    OfferCatalogItem,
} from './schema/offer.type'
export type {
    ItemListElement,
    ItemListSchemaProps,
} from './schema/item-list.type'
export type {
    MedicalProcedureSchemaProps,
    MedicalProcedurePerformer,
} from './schema/medical-procedure.type'
export type {
    ProfilePageSchemaProps,
    ProfilePageMainEntity,
} from './schema/profile-page.type'
export type {
    CollectionPageSchemaProps,
    CollectionItem,
    CollectionAbout,
} from './schema/collection-page.type'
