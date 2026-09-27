/**
 * YouTube metadata rules
 *
 * YouTube rejects an upload whose title, description or tags break its
 * limits, but only after the file has been sent. Checking first turns a
 * wasted upload into a message in the review screen.
 *
 * @module @workspace/youtube — metadata
 */
import type { YouTubeVideoMetadata } from './youtube.type.js'

export const YOUTUBE_TITLE_MAX_CHARS = 100
export const YOUTUBE_DESCRIPTION_MAX_CHARS = 5000
export const YOUTUBE_TAGS_MAX_CHARS = 500

/** "Howto & Style". The caller can pass another category per video. */
export const YOUTUBE_DEFAULT_CATEGORY_ID = '26'

/**
 * Characters the tag limit counts. YouTube counts the commas between tags,
 * and a tag containing a space counts two more for the quotes it adds.
 */
export function countTagChars(tags: string[]): number {
    const cleaned = tags.map((tag) => tag.trim()).filter(Boolean)
    const letters = cleaned.reduce(
        (sum, tag) => sum + tag.length + (tag.includes(' ') ? 2 : 0),
        0
    )
    return letters + Math.max(cleaned.length - 1, 0)
}

/**
 * Problems that would make YouTube reject the metadata, in plain words.
 * An empty list means it is safe to send.
 */
export function validateVideoMetadata(
    metadata: Pick<YouTubeVideoMetadata, 'title' | 'description' | 'tags'> &
        Partial<Pick<YouTubeVideoMetadata, 'privacyStatus' | 'publishAt'>>
): string[] {
    const problems: string[] = []
    const title = metadata.title.trim()
    const description = metadata.description ?? ''
    const tags = metadata.tags ?? []

    if (!title) problems.push('Title is empty.')
    if (title.length > YOUTUBE_TITLE_MAX_CHARS) {
        problems.push(
            `Title is ${title.length} characters; the limit is ${YOUTUBE_TITLE_MAX_CHARS}.`
        )
    }
    if (description.length > YOUTUBE_DESCRIPTION_MAX_CHARS) {
        problems.push(
            `Description is ${description.length} characters; the limit is ${YOUTUBE_DESCRIPTION_MAX_CHARS}.`
        )
    }
    if (/[<>]/.test(title) || /[<>]/.test(description)) {
        problems.push('Title and description cannot contain < or >.')
    }
    const tagChars = countTagChars(tags)
    if (tagChars > YOUTUBE_TAGS_MAX_CHARS) {
        problems.push(
            `Tags use ${tagChars} characters; the limit is ${YOUTUBE_TAGS_MAX_CHARS}.`
        )
    }
    if (metadata.publishAt && metadata.privacyStatus !== 'private') {
        problems.push('A scheduled publish time needs the video to be private.')
    }
    return problems
}
