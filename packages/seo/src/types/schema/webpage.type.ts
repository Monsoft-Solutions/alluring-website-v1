import type { SpeakableSpecification } from './speakable.type'

export type WebPageSchemaProps = {
    name: string
    url: string
    description?: string
    breadcrumbId?: string
    /** ISO date string when the page was last modified */
    dateModified?: string
    /** ISO date string when the page was first published */
    datePublished?: string
    /**
     * Speakable specification for voice search optimization
     * Indicates content suitable for text-to-speech
     */
    speakable?: SpeakableSpecification
}
