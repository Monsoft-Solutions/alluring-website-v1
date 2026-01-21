/**
 * Speakable Schema Types
 *
 * Speakable schema markup tells search engines which content
 * is particularly suitable for text-to-speech (TTS) audio playback
 * using devices like Google Assistant, Alexa, and Siri.
 *
 * @see https://schema.org/SpeakableSpecification
 * @see https://developers.google.com/search/docs/appearance/structured-data/speakable
 */

/**
 * SpeakableSpecification properties
 *
 * The speakable property can be added to Article, BlogPosting,
 * or WebPage schemas to indicate content suitable for TTS.
 */
export type SpeakableSpecification = {
    /**
     * CSS selectors targeting content that is particularly suitable
     * for TTS. These should target concise, informative sections.
     *
     * @example ['.article-summary', '.quick-answer', 'h1']
     */
    cssSelector?: string[]

    /**
     * XPath expressions targeting content for TTS.
     * Alternative to cssSelector.
     *
     * @example ['/html/body/article/h1', '/html/body/article/p[1]']
     */
    xpath?: string[]
}

/**
 * Props for building speakable schema
 */
export type SpeakableSchemaProps = SpeakableSpecification & {
    /**
     * The URL of the page this speakable specification applies to.
     * If not provided, the specification applies to the current page.
     */
    url?: string
}

/**
 * Extended Article schema with speakable property
 */
export type ArticleWithSpeakable = {
    /** Primary speakable content selectors */
    speakable?: SpeakableSpecification
}

/**
 * Extended WebPage schema with speakable property
 */
export type WebPageWithSpeakable = {
    /** Primary speakable content selectors */
    speakable?: SpeakableSpecification
}
