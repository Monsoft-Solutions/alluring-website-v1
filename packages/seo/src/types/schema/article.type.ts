/**
 * ArticleSchemaProps
 *
 * Enhanced for E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)
 * signals, especially important for YMYL (Your Money Your Life) healthcare content.
 *
 * @see https://schema.org/Article
 * @see https://schema.org/BlogPosting
 */

import type { SpeakableSpecification } from './speakable.type'

/**
 * Author information with optional Knowledge Graph linking
 */
export type ArticleAuthor =
    | string
    | {
          /** Author's name */
          name: string
          /** URL to author's profile page */
          url?: string
          /**
           * Entity ID for Knowledge Graph linking
           * Format: "https://example.com/#physician-{slug}"
           * Links to Physician/Person schema on author page
           */
          '@id'?: string
          /** Author's job title (e.g., "Board-Certified Plastic Surgeon") */
          jobTitle?: string
          /** Image URL of the author */
          image?: string
      }

/**
 * Reviewer information for medical content (E-E-A-T signal)
 */
export type ArticleReviewer = {
    /** Reviewer's name */
    name: string
    /** URL to reviewer's profile page */
    url?: string
    /**
     * Entity ID for Knowledge Graph linking
     * Links to Physician schema on reviewer's page
     */
    '@id'?: string
    /** Reviewer's job title */
    jobTitle?: string
}

export type ArticleSchemaProps = {
    type?: 'Article' | 'BlogPosting'
    headline: string
    description?: string
    /**
     * Article author - can be a simple string, or enhanced object with
     * @id for Knowledge Graph linking to Physician schema
     */
    author: ArticleAuthor
    /**
     * Medical reviewer who verified the article content (E-E-A-T signal)
     * Important for healthcare/YMYL content to establish trustworthiness
     */
    reviewedBy?: ArticleReviewer
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
