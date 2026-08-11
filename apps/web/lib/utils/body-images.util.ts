/**
 * Body Images Utility
 *
 * Blog posts keep a junction table of associated images, but that association
 * is independent of the rendered body — a post can be linked to eleven images
 * and render none of them. Structured data must only describe images that are
 * actually on the page, so ImageObject emission is derived from the body and
 * merely enriched (dimensions, captions) by the stored metadata.
 */

/** Markdown image: ![alt](url "title") — the URL may be wrapped in <> */
const MARKDOWN_IMAGE_PATTERN = /!\[[^\]]*\]\(\s*<?([^)\s>]+)>?[^)]*\)/g

/** HTML/JSX image element: <img src="…">, <Figure src='…'>, <Image src={"…"}> */
const ELEMENT_SRC_PATTERN =
    /<(?:img|image|figure)\b[^>]*?\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|\{\s*['"`]([^'"`]+)['"`]\s*\})/gi

/**
 * Builds the set of comparable keys for an image source.
 *
 * Body markup and stored URLs can differ in casing, query string or origin
 * (root-relative vs absolute CDN URL), so each source contributes its full
 * normalized URL, its path and its filename.
 */
function toImageKeys(source: string): string[] {
    const trimmed = source.trim().replace(/^<|>$/g, '')
    const withoutQuery = trimmed.split(/[?#]/)[0] ?? ''
    if (!withoutQuery) return []

    let decoded: string
    try {
        decoded = decodeURI(withoutQuery)
    } catch {
        decoded = withoutQuery
    }

    const normalized = decoded.toLowerCase().replace(/\/+$/, '')
    if (!normalized) return []

    const keys = [normalized]

    // Path without the origin (handles absolute vs root-relative references)
    const protocolIndex = normalized.indexOf('://')
    if (protocolIndex !== -1) {
        const pathStart = normalized.indexOf('/', protocolIndex + 3)
        if (pathStart !== -1) keys.push(normalized.slice(pathStart))
    }

    // Filename (handles CDN rewrites that keep the uploaded file name)
    const filename = normalized.slice(normalized.lastIndexOf('/') + 1)
    if (filename) keys.push(filename)

    return keys
}

/**
 * Extracts every image source referenced in markdown/MDX content.
 *
 * @param content - Raw markdown/MDX body
 * @returns Raw source strings in document order (duplicates included)
 */
export function extractBodyImageSources(content: string): string[] {
    if (!content) return []

    const sources: string[] = []

    for (const match of content.matchAll(MARKDOWN_IMAGE_PATTERN)) {
        if (match[1]) sources.push(match[1])
    }

    for (const match of content.matchAll(ELEMENT_SRC_PATTERN)) {
        const src = match[1] ?? match[2] ?? match[3]
        if (src) sources.push(src)
    }

    return sources
}

/**
 * Filters stored images down to the ones actually rendered in the body.
 *
 * @param images - Images associated with the post in the database
 * @param content - Raw markdown/MDX body of the post
 * @returns The subset of images referenced by the body, in stored order
 */
export function filterImagesPresentInBody<T extends { url: string }>(
    images: readonly T[],
    content: string
): T[] {
    if (images.length === 0) return []

    const bodyKeys = new Set(
        extractBodyImageSources(content).flatMap(toImageKeys)
    )
    if (bodyKeys.size === 0) return []

    return images.filter((image) =>
        toImageKeys(image.url).some((key) => bodyKeys.has(key))
    )
}
