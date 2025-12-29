/**
 * VideoObjectSchemaProps
 *
 * Props for VideoObject structured data following schema.org/VideoObject
 * @see https://schema.org/VideoObject
 * @see https://developers.google.com/search/docs/appearance/structured-data/video
 */

export type VideoObjectSchemaProps = {
    /** The title of the video */
    name: string
    /** A description of the video */
    description: string
    /** URL pointing to the thumbnail image of the video */
    thumbnailUrl: string | string[]
    /** Date when the video was first published (ISO 8601) */
    uploadDate: string
    /** Direct URL to the video file (MP4, etc.) */
    contentUrl?: string
    /** URL of the video embed player */
    embedUrl?: string
    /** Duration of the video in ISO 8601 format (e.g., PT1M30S for 1:30) */
    duration?: string
    /** Whether the video is a live stream */
    isLiveBroadcast?: boolean
    /** Date when live broadcast starts (ISO 8601) */
    startDate?: string
    /** Date when live broadcast ends (ISO 8601) */
    endDate?: string
    /** Width in pixels */
    width?: number
    /** Height in pixels */
    height?: number
    /** Publisher/creator of the video (Person or Organization) */
    author?:
        | string
        | { type: 'Person'; name: string; url?: string }
        | { type: 'Organization'; name: string; url?: string }
    /** Video transcript text */
    transcript?: string
    /** URL of the page where this video is the main entity (for watch pages) */
    mainEntityOfPage?: string
}
