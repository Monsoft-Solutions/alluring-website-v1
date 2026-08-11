/**
 * @workspace/shared
 *
 * Shared types, constants, and utilities used across apps in the workspace.
 */

export {
    CACHE_TAGS,
    ALLOWED_STATIC_TAGS,
    DYNAMIC_TAG_PREFIXES,
    isValidCacheTag,
    getAllPromotionTags,
    type StaticCacheTag,
    type DynamicTagPrefix,
} from './cache'

// Utilities
export {
    runWithConcurrency,
    BLOG_PREFIX_CUTOFF,
    getBlogPostUrl,
    getBlogPostAbsoluteUrl,
    usesBlogPrefix,
    resolveBlogPathToSlug,
} from './utils'

// Site Pages and Procedures
export {
    PROCEDURE_PAGES,
    WEBSITE_PAGES,
    SURGEON_PAGES,
    getAllMainPages,
} from './config/site-pages.constant'

export type { PageType, SitePage } from './types/site-pages.type'

// Gallery schemas
export {
    // Const arrays
    BEFORE_AFTER_TYPES,
    BODY_AREAS,
    IMAGE_QUALITY_LEVELS,
    PATIENT_GENDERS,
    // Zod schemas
    beforeAfterTypeSchema,
    bodyAreaSchema,
    imageQualitySchema,
    patientGenderSchema,
    patientDescriptionSchema,
    galleryMediaAIAnalysisSchema,
    // Types
    type BeforeAfterType,
    type BodyArea,
    type ImageQuality,
    type PatientGender,
    type PatientDescription,
    type GalleryMediaAIAnalysis,
} from './schemas/gallery'

// Text improvement schemas
export {
    // Const arrays
    OPERATIONS,
    TEXT_OPERATIONS,
    // Helper functions
    getOperationsByGroup,
    // Types
    type TextOperation,
    type OperationConfig,
} from './schemas/text'
