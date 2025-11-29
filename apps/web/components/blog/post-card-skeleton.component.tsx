/**
 * PostCardSkeleton Component
 *
 * Luxury skeleton loader that matches the redesigned PostCard layout.
 * Features gold shimmer accent and stone color palette.
 */

export function PostCardSkeleton() {
    return (
        <article
            className='relative flex h-full flex-col overflow-hidden rounded-xl border border-stone-200/80 bg-white shadow-sm'
            aria-busy='true'
            aria-label='Loading post'
        >
            {/* Featured Image Skeleton */}
            <div className='relative aspect-[16/10] w-full overflow-hidden bg-stone-100'>
                <div className='via-gold-500/10 animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent to-transparent' />
            </div>

            {/* Content Skeleton */}
            <div className='flex flex-1 flex-col p-6'>
                {/* Meta information skeleton */}
                <div className='mb-4 flex items-center gap-3'>
                    <div className='h-3.5 w-20 animate-pulse rounded bg-stone-200' />
                    <span className='text-stone-300' aria-hidden='true'>
                        •
                    </span>
                    <div className='h-3.5 w-16 animate-pulse rounded bg-stone-200' />
                    <span className='text-stone-300' aria-hidden='true'>
                        •
                    </span>
                    <div className='h-3.5 w-12 animate-pulse rounded bg-stone-200' />
                </div>

                {/* Title skeleton */}
                <div className='mb-3 space-y-2'>
                    <div className='h-6 w-full animate-pulse rounded bg-stone-200' />
                    <div className='h-6 w-3/4 animate-pulse rounded bg-stone-200' />
                </div>

                {/* Excerpt skeleton */}
                <div className='mb-6 flex-1 space-y-2'>
                    <div className='h-4 w-full animate-pulse rounded bg-stone-100' />
                    <div className='h-4 w-5/6 animate-pulse rounded bg-stone-100' />
                </div>

                {/* Read more skeleton */}
                <div className='mt-auto border-t border-stone-100 pt-4'>
                    <div className='bg-gold-500/20 h-4 w-24 animate-pulse rounded' />
                </div>
            </div>

            {/* Bottom accent line placeholder */}
            <div className='bg-gold-500/20 absolute right-0 bottom-0 left-0 h-0.5' />
        </article>
    )
}

/**
 * PostCardSkeletonGroup Component
 *
 * Renders a group of skeleton cards with staggered animation delays
 * for a more natural loading appearance.
 */
type PostCardSkeletonGroupProps = {
    count?: number
    className?: string
}

export function PostCardSkeletonGroup({
    count = 6,
    className = '',
}: PostCardSkeletonGroupProps) {
    return (
        <div
            className={`grid gap-8 sm:grid-cols-2 lg:grid-cols-3 ${className}`}
        >
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    style={{
                        animationDelay: `${index * 0.1}s`,
                        animationFillMode: 'backwards',
                    }}
                    className='animate-fade-in'
                >
                    <PostCardSkeleton />
                </div>
            ))}
        </div>
    )
}
