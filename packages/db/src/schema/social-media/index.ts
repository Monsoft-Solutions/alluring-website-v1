// Social Media Settings
export {
    socialMediaPlatform,
    socialMediaSettings,
    type SocialMediaSettings,
    type InsertSocialMediaSettings,
} from './social-media-settings.table'

// Instagram Post
export {
    instagramMediaType,
    instagramAnalysisStatus,
    instagramPost,
    type InstagramPost,
    type InsertInstagramPost,
} from './instagram-post.table'

// Instagram Post Media (Junction for carousels)
export {
    instagramPostMedia,
    type InstagramPostMedia,
    type InsertInstagramPostMedia,
} from './instagram-post-media.table'

// Relations
export {
    instagramPostRelations,
    instagramPostMediaRelations,
} from './social-media-relations'
