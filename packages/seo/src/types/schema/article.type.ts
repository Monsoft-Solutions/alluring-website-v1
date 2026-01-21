/**
 * ArticleSchemaProps
 */

import type { SpeakableSpecification } from './speakable.type'

export type ArticleSchemaProps = {
    type?: 'Article' | 'BlogPosting'
    headline: string
    description?: string
    author: string | { name: string; url?: string }
    datePublished: string
    dateModified?: string
    image?: string | string[]
    mainEntityOfPage?: string
    publisher?: {
        name: string
        logo?: string
        url?: string
    }
    /** Estimated word count of the article content */
    wordCount?: number
    /** Primary category/section of the article */
    articleSection?: string
    /** Keywords/tags associated with the article */
    keywords?: string[]
    /**
     * Speakable specification for voice search optimization
     * Indicates content suitable for text-to-speech
     */
    speakable?: SpeakableSpecification
}
