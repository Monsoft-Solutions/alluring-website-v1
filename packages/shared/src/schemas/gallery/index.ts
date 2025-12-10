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
} from './gallery-media-ai-analysis.schema'

export {
    // Const arrays
    GALLERY_PROCEDURE_SLUGS,
    // Zod schemas
    galleryProcedureSlugSchema,
    // Types
    type GalleryProcedureSlug,
} from './gallery-procedure.schema'

export {
    // Zod schemas
    seoContentSchema,
    visitorContentSchema,
    // Types
    type SEOContent,
    type VisitorContent,
} from './gallery-content.schema'

export {
    // Zod schemas
    groupSuggestionItemSchema,
    groupSuggestionSchema,
    // Types
    type GroupSuggestionItem,
    type GroupSuggestion,
    type AvailableGroup,
} from './gallery-group-suggestion.schema'
