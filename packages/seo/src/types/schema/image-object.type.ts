/**
 * ImageObjectSchemaProps
 */
export type ImageObjectSchemaProps = {
    /**
     * The URL of the image
     */
    url: string

    /**
     * Alternative text for the image
     */
    alt?: string

    /**
     * Caption for the image
     */
    caption?: string

    /**
     * Width of the image in pixels
     */
    width?: number

    /**
     * Height of the image in pixels
     */
    height?: number

    /**
     * Name of the image
     */
    name?: string

    /**
     * Thumbnail URL for the image
     */
    thumbnailUrl?: string

    /**
     * URL to the actual content (if different from url)
     */
    contentUrl?: string

    /**
     * MIME type of the image (e.g., 'image/jpeg')
     */
    encodingFormat?: string

    /**
     * Whether this image is representative of the page content
     */
    representativeOfPage?: boolean

    /**
     * Author of the image
     */
    author?:
        | string
        | { '@type'?: 'Person' | 'Organization'; name: string; url?: string }

    /**
     * Copyright holder of the image
     */
    copyrightHolder?: string

    /**
     * License URL for the image
     */
    license?: string

    /**
     * Description of the image (separate from alt text)
     */
    description?: string

    /**
     * Date when the image was first published (ISO 8601)
     */
    datePublished?: string

    /**
     * URL of the page where this image is the main entity (for gallery pages)
     */
    mainEntityOfPage?: string
}
