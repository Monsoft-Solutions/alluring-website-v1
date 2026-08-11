/**
 * MedicalWebPageSchema Component
 *
 * Emits a MedicalWebPage JSON-LD node for health content pages. MedicalWebPage
 * tells search engines and LLMs that the page carries medical information about
 * a specific topic and is written for patients — a stronger topical signal than
 * a bare WebPage/BlogPosting pair for YMYL content.
 *
 * `lastReviewed` and `reviewedBy` are deliberately NOT part of this component:
 * blog content has no named medical reviewer yet, and structured data must not
 * assert a review that never happened. Add them here once a real reviewer signs
 * off on the content.
 */
import type { MedicalWebPage, WithContext } from 'schema-dts'

import { JsonLd } from '@workspace/seo/react'

type MedicalWebPageSchemaProps = {
    /** Stable entity ID for the page node (e.g. "https://site.com/post#webpage") */
    id: string
    /** Canonical URL of the page */
    url: string
    /** Page title */
    name: string
    /** Short summary of the page */
    description?: string
    /** ISO 8601 publication date */
    datePublished?: string
    /** ISO 8601 last modification date */
    dateModified?: string
    /** Medical topic the page covers (e.g. the post's primary category) */
    about?: string
    /** Entity ID of the publishing organization */
    publisherId?: string
    /** BCP 47 language tag of the content */
    inLanguage?: string
}

/**
 * Renders MedicalWebPage structured data for a medical content page.
 */
export function MedicalWebPageSchema({
    id,
    url,
    name,
    description,
    datePublished,
    dateModified,
    about,
    publisherId,
    inLanguage = 'en-US',
}: MedicalWebPageSchemaProps) {
    const data: WithContext<MedicalWebPage> = {
        '@context': 'https://schema.org',
        '@type': 'MedicalWebPage',
        '@id': id,
        url,
        name,
        inLanguage,
        // Written for patients researching a procedure, not for clinicians
        audience: {
            '@type': 'MedicalAudience',
            audienceType: 'Patient',
        },
        ...(description && { description }),
        ...(datePublished && { datePublished }),
        ...(dateModified && { dateModified }),
        ...(about && {
            about: {
                '@type': 'MedicalEntity',
                name: about,
            },
        }),
        ...(publisherId && { publisher: { '@id': publisherId } }),
    }

    return <JsonLd data={data} />
}
