import Image from 'next/image'
import Link from 'next/link'
import type { QuickAnswerParts } from '@workspace/shared/content'
import { cn } from '@workspace/ui/lib/utils'

import { moduleContainer } from '@/components/procedures/module-kit/module-ui.constant'
import { QuickAnswer } from '@/components/shared/quick-answer.component'
import { seoConfig } from '@/lib/seo-config'
import type { BlogPostDetail } from '@/lib/types/blog/post-detail.type'

/** The profile the Article schema names as every post's author page. */
const AUTHOR_PAGE = '/blog/authors/editorial-team'

type PostHeaderProps = {
    post: BlogPostDetail
    quickAnswer: QuickAnswerParts | null
    /**
     * The schema's `dateModified`: the last meaningful edit, or the publish
     * date. The byline shows the same date, so a reader and a crawler are
     * never told different things.
     */
    dateModified: string
    /** Whether `dateModified` is a real revision rather than the publish date. */
    isUpdated: boolean
}

/** "Sep 12, 2026". UTC, like the server that prerenders it. */
function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
    })
}

/**
 * The answer-first opening of a v2 post: category and reading time, the H1,
 * the byline, and the post's quick answer when it has one, so a reader who
 * came from a search sees the answer on the first screen of a phone. The
 * featured image sits in an arch: after the answer on phones, beside the
 * text from `lg`.
 *
 * No reviewer line and no credential claims: the blog has no medical
 * reviewer yet, and the Article schema says as much by leaving `reviewedBy`
 * out.
 */
export function PostHeader({
    post,
    quickAnswer,
    dateModified,
    isUpdated,
}: PostHeaderProps) {
    const primaryCategory = post.categories[0]
    const image = post.featuredImage

    return (
        <header className='bg-stone-50'>
            {/* The top padding clears the fixed nav plus the announcement
                bar as fixed lengths. `--announcement-bar-height` is only set
                after hydration, so padding built on it would push the answer
                down 40 px after first paint (CLS 0.04 on phones). */}
            <div
                className={cn(
                    moduleContainer,
                    'grid gap-9 pt-[9.5rem] pb-10 md:pt-40 md:pb-14',
                    'lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center lg:gap-20 lg:pt-44 lg:pb-16 xl:grid-cols-[minmax(0,1fr)_27rem]'
                )}
            >
                <div className='flex min-w-0 flex-col gap-5'>
                    {(primaryCategory || post.readingTime) && (
                        <p className='text-gold-700 flex flex-wrap items-center gap-x-2.5 text-xs font-semibold tracking-[0.18em] uppercase'>
                            {primaryCategory && (
                                <Link
                                    href={`/blog/categories/${primaryCategory.slug}`}
                                    className='underline-offset-4 hover:underline'
                                >
                                    {primaryCategory.name}
                                </Link>
                            )}
                            {primaryCategory && post.readingTime && (
                                <span aria-hidden='true'>·</span>
                            )}
                            {post.readingTime && (
                                <span className='text-stone-600'>
                                    {post.readingTime} min read
                                </span>
                            )}
                        </p>
                    )}

                    <h1 className='font-serif text-[2.125rem] leading-[1.08] font-normal tracking-[-0.01em] text-balance text-stone-900 sm:text-[2.75rem] lg:text-[3.25rem] lg:leading-[1.04]'>
                        {post.title}
                    </h1>

                    <p className='text-[0.9375rem] leading-snug text-stone-600'>
                        By{' '}
                        {/* The same author the Article schema names: the
                            author row with its profile, or the practice. */}
                        {post.author ? (
                            <Link
                                href={AUTHOR_PAGE}
                                className='decoration-gold-500 font-semibold text-stone-900 underline decoration-1 underline-offset-4 hover:decoration-stone-900'
                            >
                                {post.author.name}
                            </Link>
                        ) : (
                            <span className='font-semibold text-stone-900'>
                                {seoConfig.organization?.name ??
                                    seoConfig.siteName}
                            </span>
                        )}
                        <span aria-hidden='true' className='mx-2'>
                            ·
                        </span>
                        {isUpdated ? 'Updated' : 'Published'}{' '}
                        <time dateTime={dateModified}>
                            {formatDate(dateModified)}
                        </time>
                    </p>

                    {/* Without a quick answer (most posts written before the
                        pipeline made one), the excerpt the old hero showed
                        opens the post instead. */}
                    {!quickAnswer && post.excerpt && (
                        <p className='max-w-[38rem] text-[1.0625rem] leading-[1.6] text-stone-700 md:text-lg'>
                            {post.excerpt}
                        </p>
                    )}

                    {quickAnswer && (
                        <div className='bp-answer mt-2 rounded-[1.25rem] border border-stone-200 bg-stone-100 p-5 md:p-7'>
                            <QuickAnswer
                                id='quick-answer'
                                question={quickAnswer.question ?? post.title}
                                answer={quickAnswer.answer}
                                variant='featured'
                                headingLevel='h2'
                            />
                        </div>
                    )}
                </div>

                {image && (
                    <div
                        className={cn(
                            'bp-arch relative aspect-[16/11] w-full bg-stone-200 sm:aspect-[16/10]',
                            // A portrait window beside a long answer; a
                            // squarer one beside a title and a lede.
                            quickAnswer ? 'lg:aspect-[4/5]' : 'lg:aspect-square'
                        )}
                    >
                        <Image
                            src={image.url}
                            alt={image.alt}
                            fill
                            priority
                            sizes='(min-width: 80rem) 27rem, (min-width: 64rem) 24rem, calc(100vw - 2.5rem)'
                            placeholder={image.blurDataUrl ? 'blur' : 'empty'}
                            blurDataURL={image.blurDataUrl ?? undefined}
                            // Faces sit in the upper third of the blog's
                            // photographs; a centred crop in the wide phone
                            // arch cuts them at the brow.
                            className='object-cover object-[50%_20%]'
                        />
                    </div>
                )}
            </div>
        </header>
    )
}
