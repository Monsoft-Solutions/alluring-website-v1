// Gallery Media
export {
    galleryMediaType,
    galleryMediaStatus,
    galleryMedia,
    type GalleryMedia,
    type InsertGalleryMedia,
} from './gallery-media.table'

// Gallery Media AI Analysis Types
export type {
    GalleryMediaAIAnalysis,
    BeforeAfterType,
    BodyArea,
    ImageQuality,
} from './gallery-media-ai-analysis.type'

// Gallery Group
export {
    galleryGroup,
    type GalleryGroup,
    type InsertGalleryGroup,
} from './gallery-group.table'

// Gallery Media Group (Junction)
export {
    galleryMediaGroup,
    type GalleryMediaGroup,
    type InsertGalleryMediaGroup,
} from './gallery-media-group.table'

// Before/After Pair
export {
    beforeAfterPair,
    type BeforeAfterPair,
    type InsertBeforeAfterPair,
} from './before-after-pair.table'

// Relations
export {
    galleryMediaRelations,
    galleryGroupRelations,
    galleryMediaGroupRelations,
    beforeAfterPairRelations,
} from './gallery-relations'
