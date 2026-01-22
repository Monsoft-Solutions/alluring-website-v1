// Analytics schema
export {
    deviceTypeEnum,
    pageView,
    type PageView,
    type InsertPageView,
} from './analytics'

// Blog schema
export {
    blogPostStatus,
    blogPost,
    blogCategory,
    blogPostCategory,
    blogTag,
    author,
    blogPostTag,
    images,
    blogPostImages,
    blogPostAnalysis,
    blogPostTagsRelations,
    blogPostCategoriesRelations,
    blogPostsRelations,
    blogPostImagesRelations,
    blogTagsRelations,
    blogCategoriesRelations,
    authorsRelations,
    imagesRelations,
    imageDataSchema,
    createResourceSchema,
    type BlogPost,
    type InsertBlogPost,
    type BlogCategory,
    type InsertBlogCategory,
    type BlogPostCategory,
    type InsertBlogPostCategory,
    type BlogPostTag,
    type InsertBlogPostTag,
    type Image,
    type InsertImage,
    type BlogPostImage,
    type InsertBlogPostImage,
    type BlogPostAnalysis,
    type InsertBlogPostAnalysis,
    type BlogPostAnalysisDetails,
    type CreateResourceInput,
} from './blog'

// Chat schema
export {
    CHAT_MODELS,
    chatConfig,
    SESSION_STATUSES,
    CHAT_INTENTS,
    LEAD_GRADES,
    chatSession,
    MESSAGE_ROLES,
    chatMessage,
    QUICK_REPLY_CATEGORIES,
    chatQuickReply,
    ESCALATION_TRIGGER_TYPES,
    chatEscalationTrigger,
    type ChatModel,
    type ChatConfig,
    type InsertChatConfig,
    type SessionStatus,
    type ChatIntent,
    type LeadGrade,
    type ScoringSignals,
    type DbLeadProfile,
    type DbPsychographicData,
    type DbContactPreference,
    type DbActionableIntelligence,
    type DbConversationAnalysis,
    type ChatSession,
    type InsertChatSession,
    type MessageRole,
    type ChatMessage,
    type InsertChatMessage,
    type QuickReplyCategory,
    type ChatQuickReply,
    type InsertChatQuickReply,
    type EscalationTriggerType,
    type ChatEscalationTrigger,
    type InsertChatEscalationTrigger,
} from './chat'

// Contact schema
export {
    contactSubmission,
    type ContactSubmission,
    type InsertContactSubmission,
} from './contact'

// Emails schema
export {
    emailStatusEnum,
    emailLog,
    type InsertEmailLog,
    type SelectEmailLog,
} from './emails'

// Feedback schema
export {
    DEVICE_TYPES,
    BROWSER_TYPES,
    NAVIGATION_EASE_OPTIONS,
    betaFeedback,
    BUG_SEVERITY_LEVELS,
    BUG_STATUS_OPTIONS,
    bugReport,
    type DeviceType,
    type BrowserType,
    type NavigationEase,
    type BetaFeedback,
    type InsertBetaFeedback,
    type BugSeverity,
    type BugStatus,
    type BugReport,
    type InsertBugReport,
} from './feedback'

// Promotion schema
export {
    promotionStatus,
    promotionType,
    discountType,
    promotionLinkType,
    promotion,
    type Promotion,
    type InsertPromotion,
} from './promotion'

// Gallery schema
export {
    galleryMediaType,
    galleryMediaStatus,
    galleryMedia,
    galleryGroup,
    galleryMediaGroup,
    beforeAfterPair,
    mediaAnalysisType,
    mediaAnalysisSource,
    mediaAnalysisStatus,
    mediaAnalysis,
    mediaAnalysisItemType,
    mediaAnalysisItem,
    galleryMediaRelations,
    galleryGroupRelations,
    galleryMediaGroupRelations,
    beforeAfterPairRelations,
    mediaAnalysisRelations,
    mediaAnalysisItemRelations,
    type GalleryMedia,
    type InsertGalleryMedia,
    type GalleryGroup,
    type InsertGalleryGroup,
    type GalleryMediaGroup,
    type InsertGalleryMediaGroup,
    type BeforeAfterPair,
    type InsertBeforeAfterPair,
    type MediaAnalysis,
    type InsertMediaAnalysis,
    type MediaAnalysisItem,
    type InsertMediaAnalysisItem,
} from './gallery'

// Social Media schema
export {
    socialMediaPlatform,
    socialMediaSettings,
    instagramMediaType,
    instagramPost,
    instagramPostMedia,
    instagramPostRelations,
    instagramPostMediaRelations,
    type SocialMediaSettings,
    type InsertSocialMediaSettings,
    type InstagramPost,
    type InsertInstagramPost,
    type InstagramPostMedia,
    type InsertInstagramPostMedia,
} from './social-media'

// Reviews schema
export {
    googleReview,
    googleReviewsSettings,
    type GoogleReview,
    type InsertGoogleReview,
    type GoogleReviewsSettings,
    type InsertGoogleReviewsSettings,
} from './reviews'
