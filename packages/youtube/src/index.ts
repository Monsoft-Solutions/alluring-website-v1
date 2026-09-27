/**
 * YouTube layer
 *
 * OAuth, token encryption and a Data API client for the practice's YouTube
 * channel, shared by the admin app and any script or agent tool that needs
 * the channel. Callers pass an access token; storage is theirs.
 *
 * @module @workspace/youtube
 */
export { readYouTubeEnv } from './env.js'
export type { YouTubeEnv } from './env.js'
export {
    buildAuthorizationUrl,
    emailFromIdToken,
    exchangeAuthorizationCode,
    isYouTubeConfigured,
    refreshAccessToken,
    revokeToken,
    YOUTUBE_OAUTH_SCOPES,
} from './youtube-oauth.service.js'
export type {
    YouTubeAccessToken,
    YouTubeTokens,
} from './youtube-oauth.service.js'
export {
    decryptToken,
    encryptToken,
    generateEncryptionKey,
} from './token-crypto.util.js'
export {
    isTransientYouTubeError,
    parseYouTubeError,
    YouTubeApiError,
    YouTubeAuthRevokedError,
    YouTubeNotConfiguredError,
} from './youtube-error.util.js'
export {
    countTagChars,
    validateVideoMetadata,
    YOUTUBE_DEFAULT_CATEGORY_ID,
    YOUTUBE_DESCRIPTION_MAX_CHARS,
    YOUTUBE_TAGS_MAX_CHARS,
    YOUTUBE_TITLE_MAX_CHARS,
} from './youtube-metadata.util.js'
export {
    addVideoToPlaylist,
    createPlaylist,
    getMyChannel,
    getVideoStatuses,
    listChannelVideos,
    listPlaylists,
    setThumbnailFromUrl,
    setVideoPrivacy,
    updateVideoSnippet,
    YOUTUBE_API_BASE,
    YOUTUBE_UPLOAD_BASE,
    youtubeRequest,
} from './youtube-client.service.js'
export {
    describeUploadSource,
    nextOffsetFromRange,
    queryUploadProgress,
    sendUploadBytes,
    startResumableUpload,
    uploadVideoFromUrl,
} from './youtube-upload.service.js'
export type { UploadProgress, UploadSource } from './youtube-upload.service.js'
export type {
    YouTubeChannel,
    YouTubeChannelVideo,
    YouTubePage,
    YouTubePlaylist,
    YouTubePrivacyStatus,
    YouTubeUploadedVideo,
    YouTubeVideoMetadata,
    YouTubeVideoStatus,
} from './youtube.type.js'
