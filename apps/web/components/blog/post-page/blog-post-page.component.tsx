/**
 * Blog post template v2 (epic #293).
 *
 * Answer first: the H1, byline and quick answer open the page instead of a
 * full-screen photograph, and the post's own text follows unchanged, with the
 * table of contents in a desktop rail or a sticky bar on phones. Phase 1
 * (#294) is the shell; phase 2 (#295) puts the procedure strip, the consult
 * thread (in the split slot), proof and the sticky bar into it.
 *
 * Rendered only for posts `isBlogV2` lets through. It takes the same props as
 * `BlogPostContent`, so the routes switch templates without fetching anything
 * different, and it emits the same structured data (`PostSchema`).
 *
 * `data-lead-popup="exit-only"` tells the lead popups (from #295) to hold back
 * everything but exit intent on this page. The URL can't, because pre-2026
 * posts live at the root.
 */
import { parseQuickAnswer } from '@workspace/shared/content'
import { cn } from '@workspace/ui/lib/utils'

import { BlogViewTracker } from '@/components/blog/blog-view-tracker.component'
import { MobileTOC } from '@/components/blog/mobile-toc.component'
import { ReadingProgress } from '@/components/blog/reading-progress.component'
import { moduleContainer } from '@/components/procedures/module-kit/module-ui.constant'
import { getTocSections } from '@/lib/blog/post-toc.util'
import type { AdjacentPosts } from '@/lib/queries/blog/adjacent-posts.query'
import type { InlineImage } from '@/lib/queries/blog/post-images.query'
import { seoConfig } from '@/lib/seo-config'
import type { BlogPostCard } from '@/lib/types/blog/post-card.type'
import type { BlogPostDetail } from '@/lib/types/blog/post-detail.type'
import type { TOCHeading } from '@/lib/types/blog/toc.type'
import { getBlogPostAbsoluteUrl } from '@/lib/utils/blog-url.util'
import { getMeaningfulUpdateDate } from '@/lib/utils/content-freshness.util'

import { PostBody } from './post-body.component'
import { PostEnd } from './post-end.component'
import { PostHeader } from './post-header.component'
import { PostRail } from './post-rail.component'
import { PostSchema } from './post-schema.component'

import './post-page.css'

type BlogPostPageProps = {
    post: BlogPostDetail
    relatedPosts: BlogPostCard[]
    tableOfContents: TOCHeading[]
    beforeCTA: string
    afterCTA: string | null
    adjacentPosts: AdjacentPosts
    /** Inline images for schema generation */
    inlineImages?: InlineImage[]
}

export function BlogPostPage({
    post,
    relatedPosts,
    tableOfContents,
    beforeCTA,
    afterCTA,
    adjacentPosts,
    inlineImages,
}: BlogPostPageProps) {
    const { publishedAt } = post

    // Guard: publishedAt is required for published posts
    if (!publishedAt) {
        throw new Error(
            `BlogPostPage: publishedAt is required for published post "${post.slug}"`
        )
    }

    const publishedPost = { ...post, publishedAt }

    /** Absolute canonical URL — respects the pre/post-2026 URL split */
    const postUrl = getBlogPostAbsoluteUrl(
        seoConfig.siteUrl,
        post.slug,
        publishedAt
    )

    // Computed exactly as the old template does, so the schema's
    // `dateModified` stays byte-identical and the byline shows the same date.
    const updatedAt = getMeaningfulUpdateDate(
        publishedAt,
        post.contentUpdatedAt
    )
    const dateModified = updatedAt?.toISOString() ?? publishedAt

    const quickAnswer = parseQuickAnswer(post.quickAnswer)
    const tocSections = getTocSections(tableOfContents)

    return (
        <div className='bp-page' data-lead-popup='exit-only'>
            <ReadingProgress />
            <BlogViewTracker postId={post.id} />

            <article>
                <PostHeader
                    post={post}
                    quickAnswer={quickAnswer}
                    dateModified={dateModified}
                    isUpdated={updatedAt !== null}
                />

                <div
                    className={cn(
                        moduleContainer,
                        'grid gap-16 pb-16 md:pb-24 lg:grid-cols-[minmax(0,1fr)_16rem] xl:gap-24'
                    )}
                >
                    <div className='min-w-0'>
                        <MobileTOC
                            headings={tocSections}
                            className='-mx-5 mb-8 md:-mx-8'
                        />
                        <div className='max-w-[44rem]'>
                            <PostBody
                                beforeCTA={beforeCTA}
                                afterCTA={afterCTA}
                            />
                        </div>

                        {/* Right after the body, where the old template emits
                            it: the related-post cards below add ImageObjects
                            of their own, and the tags keep the same order. */}
                        <PostSchema
                            post={publishedPost}
                            postUrl={postUrl}
                            dateModified={dateModified}
                            hasQuickAnswer={quickAnswer !== null}
                            inlineImages={inlineImages}
                        />
                    </div>

                    <PostRail headings={tocSections} />

                    <div className='max-w-[44rem] lg:col-span-2 lg:max-w-none'>
                        <PostEnd
                            post={publishedPost}
                            adjacentPosts={adjacentPosts}
                            relatedPosts={relatedPosts}
                        />
                    </div>
                </div>
            </article>
        </div>
    )
}
