import type { Article, BlogPosting, WithContext } from 'schema-dts'

import { buildArticleJsonLd } from '../../schemas/article.schema'
import { JsonLd } from '../json-ld.component'
import type { ArticleSchemaProps } from '../../types/schema/article.type'

export function ArticleSchema(props: ArticleSchemaProps) {
    const data: WithContext<Article | BlogPosting> = buildArticleJsonLd(props)
    return <JsonLd data={data} />
}
