/**
 * Speakable Schema Builder
 *
 * Builds SpeakableSpecification structured data for voice search optimization.
 * This tells search engines which content is suitable for text-to-speech.
 *
 * @see https://schema.org/SpeakableSpecification
 * @see https://developers.google.com/search/docs/appearance/structured-data/speakable
 */
import type {
    SpeakableSpecification as SchemaSpeakable,
    WithContext,
} from 'schema-dts'

import type { SpeakableSchemaProps } from '../types/schema/speakable.type'
import { withContext } from './_internal'

/**
 * Build a standalone SpeakableSpecification JSON-LD object
 *
 * Note: Speakable is typically embedded within Article or WebPage schemas,
 * not used as a standalone type. This function is provided for flexibility.
 *
 * @param props - Speakable specification properties
 * @returns WithContext<SpeakableSpecification>
 */
export function buildSpeakableJsonLd(
    props: SpeakableSchemaProps
): WithContext<SchemaSpeakable> {
    const speakable: SchemaSpeakable = {
        '@type': 'SpeakableSpecification',
        ...(props.cssSelector &&
            props.cssSelector.length > 0 && {
                cssSelector: props.cssSelector,
            }),
        ...(props.xpath &&
            props.xpath.length > 0 && {
                xpath: props.xpath,
            }),
    }

    return withContext(speakable)
}

/**
 * Create a speakable property object for embedding in Article/WebPage schemas
 *
 * This is the most common use case - adding speakable to an existing schema.
 *
 * @param selectors - CSS selectors or XPath expressions for speakable content
 * @returns Speakable property object (without @context)
 *
 * @example
 * ```typescript
 * const articleSchema = {
 *     '@type': 'Article',
 *     headline: 'My Article',
 *     ...createSpeakableProperty({
 *         cssSelector: ['.article-summary', 'h1']
 *     })
 * }
 * ```
 */
export function createSpeakableProperty(
    selectors: SpeakableSchemaProps
): { speakable: SchemaSpeakable } | Record<string, never> {
    // Don't add speakable if no selectors provided
    if (
        (!selectors.cssSelector || selectors.cssSelector.length === 0) &&
        (!selectors.xpath || selectors.xpath.length === 0)
    ) {
        return {}
    }

    return {
        speakable: {
            '@type': 'SpeakableSpecification',
            ...(selectors.cssSelector &&
                selectors.cssSelector.length > 0 && {
                    cssSelector: selectors.cssSelector,
                }),
            ...(selectors.xpath &&
                selectors.xpath.length > 0 && {
                    xpath: selectors.xpath,
                }),
        },
    }
}

/**
 * Default CSS selectors for common speakable content
 *
 * These target content that is typically suitable for TTS:
 * - Headlines and titles
 * - Article summaries and lead paragraphs
 * - Quick answers and featured snippets
 */
export const DEFAULT_SPEAKABLE_SELECTORS = [
    'h1',
    '.article-summary',
    '.quick-answer',
    '.lead-paragraph',
    '[data-speakable="true"]',
]

/**
 * Procedure-specific speakable selectors
 *
 * Optimized for medical procedure pages where users might ask
 * voice assistants about procedure details.
 */
export const PROCEDURE_SPEAKABLE_SELECTORS = [
    'h1',
    '.procedure-intro',
    '.quick-answer',
    '.procedure-summary',
    '[data-speakable="true"]',
]

/**
 * Blog post speakable selectors
 *
 * Optimized for blog articles and educational content.
 */
export const BLOG_SPEAKABLE_SELECTORS = [
    'h1',
    '.article-summary',
    '.post-excerpt',
    '.quick-answer',
    '[data-speakable="true"]',
]
