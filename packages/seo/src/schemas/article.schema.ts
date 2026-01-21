import type { Article, BlogPosting, WithContext } from 'schema-dts'

import type { ArticleSchemaProps } from '../types/schema/article.type'
import { withContext } from './_internal'

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

    const base = {
        '@type': type,
        headline: props.headline,
        description: props.description,
        author:
            typeof props.author === 'string'
                ? { '@type': 'Person', name: props.author }
                : {
                      '@type': 'Person',
                      name: props.author.name,
                      url: props.author.url,
                  },
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
    } as Article | BlogPosting

    return withContext(base)
}
