import type { Article, BlogPosting, WithContext } from 'schema-dts'

import type { ArticleSchemaProps } from '../types/schema/article.type'
import { withContext } from './_internal'

export function buildArticleJsonLd(
    props: ArticleSchemaProps
): WithContext<Article | BlogPosting> {
    const type = props.type ?? 'Article'
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
        image: props.image,
        mainEntityOfPage: props.mainEntityOfPage,
        publisher: props.publisher && {
            '@type': 'Organization',
            name: props.publisher.name,
            logo: props.publisher.logo,
            url: props.publisher.url,
        },
    } as Article | BlogPosting

    return withContext(base)
}
