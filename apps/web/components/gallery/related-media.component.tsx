import { cn } from '@workspace/ui/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

import type { GalleryMediaCard } from '@/lib/types/gallery/gallery-group.type'

type RelatedMediaProps = {
    readonly media: GalleryMediaCard[]
    readonly className?: string
}

/**
 * Related Media Component
 *
 * Displays related media items from the same groups.
 */
export function RelatedMedia({ media, className }: RelatedMediaProps) {
    if (media.length === 0) {
        return null
    }

    return (
        <section className={cn('border-t border-stone-200 pt-12', className)}>
            <h2 className='mb-8 font-serif text-2xl text-stone-900 md:text-3xl'>
                More From This Collection
            </h2>

            <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 lg:gap-6'>
                {media.map((item) => (
                    <Link
                        key={item.id}
                        href={`/gallery/media/${item.slug}`}
                        className='group focus:ring-gold-500 relative aspect-square overflow-hidden rounded-lg bg-stone-100 focus:ring-2 focus:ring-offset-2 focus:outline-none'
                        aria-label={`View ${item.title}`}
                    >
                        <Image
                            src={item.thumbnailUrl ?? item.url}
                            alt={item.alt}
                            fill
                            className='object-cover transition-transform duration-500 group-hover:scale-110'
                            sizes='(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw'
                            placeholder={item.blurDataUrl ? 'blur' : 'empty'}
                            blurDataURL={item.blurDataUrl ?? undefined}
                        />

                        {/* Hover Overlay */}
                        <div className='absolute inset-0 bg-stone-900/0 transition-colors duration-300 group-hover:bg-stone-900/40' />
                    </Link>
                ))}
            </div>
        </section>
    )
}
