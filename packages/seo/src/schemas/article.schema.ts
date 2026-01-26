import type { Article, BlogPosting, WithContext } from 'schema-dts'

import type {
    ArticleAuthor,
    ArticleReviewer,
    ArticleSchemaProps,
} from '../types/schema/article.type'
import { withContext } from './_internal'
import { createSpeakableProperty } from './speakable.schema'

/**
 * Build author object for Article schema with Knowledge Graph support
 */
function buildAuthorObject(author: ArticleAuthor): Record<string, unknown> {
    if (typeof author === 'string') {
        return { '@type': 'Person', name: author }
    }

    const authorObj: Record<string, unknown> = {
        '@type': 'Person',
        name: author.name,
    }

    // Add optional properties only if they exist
    if (author['@id']) {
        authorObj['@id'] = author['@id']
    }
    if (author.url) {
        authorObj.url = author.url
    }
    if (author.jobTitle) {
        authorObj.jobTitle = author.jobTitle
    }
    if (author.image) {
        authorObj.image = author.image
    }

    return authorObj
}

/**
 * Build reviewer object for E-E-A-T attribution
 */
function buildReviewerObject(
    reviewer: ArticleReviewer
): Record<string, unknown> {
    const reviewerObj: Record<string, unknown> = {
        '@type': 'Person',
        name: reviewer.name,
    }

    if (reviewer['@id']) {
        reviewerObj['@id'] = reviewer['@id']
    }
    if (reviewer.url) {
        reviewerObj.url = reviewer.url
    }
    if (reviewer.jobTitle) {
        reviewerObj.jobTitle = reviewer.jobTitle
    }

    return reviewerObj
}

export function buildArticleJsonLd(
    props: ArticleSchemaProps
): WithContext<Article | BlogPosting> {
    const type = props.type ?? 'Article'

    // Ensure image is always an array for consistent schema output
    const imageArray = props.image
        ? Array.isArray(props.image)
            ? props.image
            : [props.image]
        : undefined

    // Build speakable property if provided
    const speakableProps = props.speakable
        ? createSpeakableProperty(props.speakable)
        : {}

    const base: Record<string, unknown> = {
        '@type': type,
        headline: props.headline,
        description: props.description,
        author: buildAuthorObject(props.author),
        datePublished: props.datePublished,
        dateModified: props.dateModified,
        image: imageArray,
        mainEntityOfPage: props.mainEntityOfPage,
        publisher: props.publisher && {
            '@type': 'Organization',
            name: props.publisher.name,
            logo: props.publisher.logo,
            url: props.publisher.url,
        },
        // Enhanced SEO fields
        ...(props.wordCount && { wordCount: props.wordCount }),
        ...(props.articleSection && { articleSection: props.articleSection }),
        ...(props.keywords &&
            props.keywords.length > 0 && {
                keywords: props.keywords.join(', '),
            }),
        // Speakable for voice search
        ...speakableProps,
    }

    // Add reviewedBy for E-E-A-T (important for medical/YMYL content)
    if (props.reviewedBy) {
        base.reviewedBy = buildReviewerObject(props.reviewedBy)
    }

    return withContext(base as unknown as Article | BlogPosting)
}
