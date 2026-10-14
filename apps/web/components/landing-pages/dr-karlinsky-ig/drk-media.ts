/**
 * Every image and video on /lp/dr-karlinsky, in one file. Swapping in a new
 * recording of her message is a change here and nowhere else.
 *
 * The video is a 9:16 cut (720×1280, H.264, faststart) with English captions
 * burned in, plus English and Spanish WebVTT tracks. Hosted on Vercel Blob:
 * use the URL `put()` returned, never a hand-written host.
 *
 * An empty `src` means there is no video yet: the page then hides every play
 * control and the "message" section, and shows her portrait only.
 */

export interface DrkVideo {
    /** The MP4. Empty while there is no video. */
    readonly src: string
    /** First frame shown before playing: her face, ≤ 60 KB. */
    readonly poster: string
    readonly posterWidth: number
    readonly posterHeight: number
    /** WebVTT captions. Empty when the cut has none in that language. */
    readonly captionsEn: string
    readonly captionsEs: string
    /** Length in seconds; the "0:46" label is derived from it. */
    readonly durationSec: number
}

export interface DrkImage {
    readonly src: string
    readonly width: number
    readonly height: number
    /**
     * Avatar only: true when `src` is a full portrait that must be zoomed to
     * her face; false for an image already cropped square to it.
     */
    readonly faceCrop?: boolean
}

/**
 * Stopgap cut (45.7 s) from her existing Instagram videos; the script for a
 * fresh recording is docs/landing/dr-karlinsky-ig-video.md. Blob files are
 * cached for a year: a new cut goes up under new `-v2` paths, never over these.
 */
export const DRK_VIDEO: DrkVideo = {
    src: 'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/landing/dr-karlinsky-ig/drk-ig-message-v1.mp4',
    poster: 'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/landing/dr-karlinsky-ig/drk-ig-poster-v1.webp',
    posterWidth: 720,
    posterHeight: 1280,
    captionsEn:
        'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/landing/dr-karlinsky-ig/drk-ig-message-v1.en.vtt',
    captionsEs:
        'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/landing/dr-karlinsky-ig/drk-ig-message-v1.es.vtt',
    durationSec: 46,
}

/** Her portrait, for the "about me" arch. */
export const DRK_PORTRAIT: DrkImage = {
    src: '/images/surgeons/dr-karlinsky.webp',
    width: 800,
    height: 1000,
}

/**
 * The story-ring avatar: a square crop of her face, or the portrait with
 * `faceCrop`, which CSS zooms to her face.
 */
export const DRK_AVATAR: DrkImage = {
    src: 'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/landing/dr-karlinsky-ig/drk-ig-avatar-v1.webp',
    width: 256,
    height: 256,
    faceCrop: false,
}

/** True when there is a video to play. */
export function hasDrkVideo(video: DrkVideo = DRK_VIDEO): boolean {
    return video.src.trim().length > 0
}
