import {
    ArticleSchema,
    BreadcrumbSchema,
    FAQSchema,
} from '@workspace/seo/react'

import { BlogPostImagesSchema } from '@/components/blog/blog-post-images-schema.component'
import { MedicalWebPageSchema } from '@/components/blog/medical-web-page-schema.component'
import type { InlineImage } from '@/lib/queries/blog/post-images.query'
import { seoConfig } from '@/lib/seo-config'
import type { BlogPostDetail } from '@/lib/types/blog/post-detail.type'
import { filterImagesPresentInBody } from '@/lib/utils/body-images.util'
import { countMarkdownWords } from '@/lib/utils/word-count.util'

type PostSchemaProps = {
    post: BlogPostDetail & { publishedAt: string }
    /** Absolute canonical URL (respects the pre/post-2026 URL split). */
    postUrl: string
    /** The last meaningful edit, or the publish date. */
    dateModified: string
    /** Whether the page renders a `.quick-answer` for Speakable to point at. */
    hasQuickAnswer: boolean
    inlineImages?: InlineImage[]
}

/**
 * The post's structured data: the same five blocks, with the same values and
 * in the same order, as the old template (`blog-post-content.component.tsx`).
 * The template change must not change what search engines are told; the #294
 * acceptance compares the served `application/ld+json` tags one for one.
 * Delete the old copy in epic phase 4, not this one.
 */
export function PostSchema({
    post,
    postUrl,
    dateModified,
    hasQuickAnswer,
    inlineImages,
}: PostSchemaProps) {
    const primaryCategory = post.categories[0]

    /** Author entity, kept distinct from the organization node in the layout */
    const authorProfileUrl = `${seoConfig.siteUrl}/blog/authors/editorial-team`

    /** Real word count from the body, not an estimate derived from reading time */
    const wordCount = countMarkdownWords(post.content)

    /**
     * Only images rendered in the body may claim an ImageObject — the junction
     * table associates images that the article may never display.
     */
    const bodyImages = inlineImages
        ? filterImagesPresentInBody(inlineImages, post.content)
        : []

    const breadcrumbItems = [
        { name: 'Home', item: seoConfig.siteUrl },
        { name: 'Blog', item: `${seoConfig.siteUrl}/blog` },
        { name: post.title, item: postUrl },
    ]

    return (
        <>
            {/* Breadcrumb trail: Home > Blog > this post */}
            <BreadcrumbSchema items={breadcrumbItems} />

            {/* MedicalWebPage - topical signal for YMYL content */}
            <MedicalWebPageSchema
                id={`${postUrl}#webpage`}
                url={postUrl}
                name={post.title}
                description={post.excerpt ?? undefined}
                datePublished={post.publishedAt}
                dateModified={dateModified}
                about={primaryCategory?.name}
                publisherId={`${seoConfig.siteUrl}/#organization`}
            />

            <ArticleSchema
                type='BlogPosting'
                headline={post.title}
                description={post.excerpt ?? undefined}
                author={
                    post.author
                        ? {
                              name: post.author.name,
                              // Own entity ID so the author never collides
                              // with the organization node
                              '@id': `${authorProfileUrl}#author`,
                              url: authorProfileUrl,
                              jobTitle: 'Medical Content Team',
                          }
                        : (seoConfig.organization?.name ?? seoConfig.siteName)
                }
                // NOTE: no `reviewedBy` on purpose. Blog content has no named
                // medical reviewer yet, and structured data must not assert a
                // review that never happened. Add it back only when a real
                // physician signs off.
                datePublished={post.publishedAt}
                dateModified={dateModified}
                image={post.featuredImage?.url}
                mainEntityOfPage={postUrl}
                publisher={{
                    name: seoConfig.organization?.name ?? seoConfig.siteName,
                    logo: seoConfig.organization?.logo,
                    url: seoConfig.organization?.url ?? seoConfig.siteUrl,
                }}
                wordCount={wordCount || undefined}
                articleSection={primaryCategory?.name}
                keywords={
                    post.tags.length > 0
                        ? post.tags.map((t) => t.name)
                        : undefined
                }
                // `.quick-answer` is only claimed when the post renders one —
                // schema must not point at markup that isn't on the page.
                speakable={{
                    cssSelector: hasQuickAnswer
                        ? ['h1', '.quick-answer']
                        : ['h1'],
                }}
            />

            {post.faqs && post.faqs.length > 0 && (
                <FAQSchema
                    items={post.faqs.map((faq) => ({
                        question: faq.question,
                        answer: faq.answer,
                    }))}
                    mainEntityOfPage={postUrl}
                />
            )}

            {/* ImageObject schemas for images rendered in the body */}
            {bodyImages.length > 0 && (
                <BlogPostImagesSchema
                    images={bodyImages}
                    postUrl={postUrl}
                    postTitle={post.title}
                    authorName={post.author?.name}
                    datePublished={post.publishedAt}
                />
            )}
        </>
    )
}
