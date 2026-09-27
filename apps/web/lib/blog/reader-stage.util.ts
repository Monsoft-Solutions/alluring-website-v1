/**
 * Who a blog post's reader is (epic #293, S3): someone recovering from the
 * procedure, or checking what recovery is like, versus someone still planning.
 * Read from the title: 75 of the 131 published posts are recovery posts, and
 * they carry three quarters of blog sessions.
 *
 * The stage picks the consultation thread's heading and reaches the lead as a
 * note line, so the coordinator knows which reader they are texting.
 *
 * @module lib/blog/reader-stage
 */

export type ReaderStage = 'recovering' | 'planning'

/** Words that make a title a recovery question. */
const RECOVERING =
    /\b(after|post[- ]?op|recovery|recover|weeks?|heal(ing)?|swelling|sleep|massages?|drains?|scars?|garments?|compression|stitches|itch(ing)?|numb(ness)?|sensation|fibrosis|dents|feed the fat|stink|smell|drop and fluff|push-ups|exercises?|foam|boards)\b/i

/** "Before and after" is a results phrase, not a recovery one. */
const BEFORE_AND_AFTER = /\bbefore\s+(?:and|&)\s+after\b/gi

/**
 * @param title - The post's title
 * @returns 'recovering' when the title asks about recovery, else 'planning'
 */
export function getReaderStage(title: string): ReaderStage {
    return RECOVERING.test(title.replace(BEFORE_AND_AFTER, ''))
        ? 'recovering'
        : 'planning'
}
