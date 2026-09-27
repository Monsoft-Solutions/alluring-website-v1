/**
 * Blog post template v2 (epic #293).
 *
 * Answer first: the H1, byline and quick answer open the page instead of a
 * full-screen photograph, then the procedure behind the question, then the
 * post's own text, unchanged, with the consultation thread at its split
 * point. Proof follows (real results, the surgeon), then a closing band and
 * the related reading. One form: the strip, the rail card, the closing band
 * and the sticky bar all lead to the thread with the post's procedure already
 * answered.
 *
 * Rendered only for posts `isBlogV2` lets through. It emits the same
 * structured data as the old template (`PostSchema`).
 *
 * `data-lead-popup="exit-only"` tells the lead popups to hold back everything
 * but exit intent on this page, and exit intent too once the thread is
 * started. The URL can't say so, because pre-2026 posts live at the root.
 */
import { parseQuickAnswer } from '@workspace/shared/content'
import { cn } from '@workspace/ui/lib/utils'

import { BlogViewTracker } from '@/components/blog/blog-view-tracker.component'
import { MobileTOC } from '@/components/blog/mobile-toc.component'
import { ReadingProgress } from '@/components/blog/reading-progress.component'
import { ModuleFaq } from '@/components/procedures/module-kit/module-faq.component'
import { moduleContainer } from '@/components/procedures/module-kit/module-ui.constant'
import { ConsultStickyBar } from '@/components/shared/consult-chat/consult-sticky-bar.component'
import { isFaqHeadingId } from '@/lib/blog/post-mdx.util'
import type { PostProcedure } from '@/lib/blog/post-procedure.util'
import { getTocSections } from '@/lib/blog/post-toc.util'
import type { ReaderStage } from '@/lib/blog/reader-stage.util'
import { getSmsLink, siteConfig } from '@/lib/data/site-config'
import type { AdjacentPosts } from '@/lib/queries/blog/adjacent-posts.query'
import type { InlineImage } from '@/lib/queries/blog/post-images.query'
import type { ProcedureGalleryData } from '@/lib/queries/gallery/procedure-galleries.query'
import { seoConfig } from '@/lib/seo-config'
import type { BlogPostCard } from '@/lib/types/blog/post-card.type'
import type { BlogPostDetail } from '@/lib/types/blog/post-detail.type'
import type { TOCHeading } from '@/lib/types/blog/toc.type'
import {
    getBlogPostAbsoluteUrl,
    getBlogPostUrl,
} from '@/lib/utils/blog-url.util'
import { getMeaningfulUpdateDate } from '@/lib/utils/content-freshness.util'

import { PostBody } from './post-body.component'
import { PostClose } from './post-close.component'
import { PostConsult } from './post-consult.component'
import { PostEnd } from './post-end.component'
import { PostHeader } from './post-header.component'
import { postOfferIntro } from './post-offer.util'
import {
    FAQ_HEADING,
    POST_CLOSE_ID,
    POST_CONSULT_ID,
    stickyLabel,
} from './post-page.copy'
import { PostProcedureStrip } from './post-procedure-strip.component'
import { PostRail } from './post-rail.component'
import { PostResults } from './post-results.component'
import { PostSchema } from './post-schema.component'
import { PostSurgeon } from './post-surgeon.component'

import '@/components/procedures/module-kit/module-kit.css'
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
    /** The procedure the title names (`getPostProcedure`); null on general posts. */
    procedure: PostProcedure | null
    /** Recovering or planning (`getReaderStage`). */
    stage: ReaderStage
    /** The live promotion for the thread's offer bubble, if any. */
    promotion: { title: string; endsAt: Date | null } | null
    /** Gallery photos of the procedure, for the results rail. */
    gallery: ProcedureGalleryData | null
    /** The Google rating for the strip; null hides its chip. */
    rating: { value: number; count: number } | null
}

export function BlogPostPage({
    post,
    relatedPosts,
    tableOfContents,
    beforeCTA,
    afterCTA,
    adjacentPosts,
    inlineImages,
    procedure,
    stage,
    promotion,
    gallery,
    rating,
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

    // The post's stored FAQs are shown only when its body has no FAQ section
    // of its own, so the questions never appear twice.
    const faqs = post.faqs ?? []
    const showStoredFaqs =
        faqs.length > 0 &&
        !tableOfContents.some(
            (heading) => heading.level === 2 && isFaqHeadingId(heading.id)
        )

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
                    strip={
                        procedure && (
                            <PostProcedureStrip
                                procedure={procedure}
                                rating={rating}
                            />
                        )
                    }
                />

                <div
                    className={cn(
                        moduleContainer,
                        'grid gap-16 pb-16 md:pb-24 lg:grid-cols-[minmax(0,1fr)_17rem] xl:grid-cols-[minmax(0,1fr)_19rem] xl:gap-20'
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
                                slot={
                                    <PostConsult
                                        procedure={procedure}
                                        stage={stage}
                                        path={getBlogPostUrl(
                                            post.slug,
                                            publishedAt
                                        )}
                                        title={post.title}
                                        offer={promotion?.title}
                                        intro={postOfferIntro(promotion)}
                                    />
                                }
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

                    <PostRail headings={tocSections} procedure={procedure} />
                </div>

                {showStoredFaqs && (
                    <ModuleFaq faqs={faqs} heading={FAQ_HEADING} />
                )}
                {procedure && gallery && (
                    <PostResults procedure={procedure} gallery={gallery} />
                )}
                <PostSurgeon />
                <PostClose procedure={procedure} />

                <div className={cn(moduleContainer, 'pt-4 pb-16 md:pb-24')}>
                    <PostEnd
                        post={publishedPost}
                        adjacentPosts={adjacentPosts}
                        relatedPosts={relatedPosts}
                    />
                </div>
            </article>

            <ConsultStickyBar
                chatId={POST_CONSULT_ID}
                label={stickyLabel(procedure)}
                phoneDigits={siteConfig.contact.phone.replace(/\D/g, '')}
                phoneLabel={`Call ${siteConfig.contact.phoneDisplay ?? siteConfig.contact.phone}`}
                smsLink={getSmsLink()}
                reveal='away-from-chat'
                procedure={procedure?.chatValue}
                // The closing band asks the same thing; two identical buttons
                // on one screen would compete.
                hideWhile={[POST_CLOSE_ID]}
            />
        </div>
    )
}
