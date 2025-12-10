import { cn } from '@workspace/ui/lib/utils'
import { Images } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import type { GalleryGroupCard as GalleryGroupCardType } from '@/lib/types/gallery/gallery-group.type'

type GalleryGroupCardProps = {
    readonly group: GalleryGroupCardType
    readonly className?: string
}

/**
 * Gallery Group Card Component
 *
 * Displays a gallery group with cover image, name, and media count.
 * Links to the group detail page.
 */
export function GalleryGroupCard({ group, className }: GalleryGroupCardProps) {
    return (
        <Link
            href={`/gallery/${group.slug}`}
            className={cn(
                'group relative block overflow-hidden rounded-xl',
                'focus:ring-gold-500 focus:ring-2 focus:ring-offset-2 focus:outline-none',
                className
            )}
            aria-label={`View ${group.name} gallery - ${group.mediaCount} photos`}
        >
            {/* Image Container */}
            <div className='relative aspect-[4/3] w-full overflow-hidden bg-stone-100'>
                {group.coverImage ? (
                    <Image
                        src={group.coverImage.url}
                        alt={group.coverImage.alt}
                        fill
                        className='object-cover transition-transform duration-700 ease-out group-hover:scale-110'
                        sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                        placeholder={
                            group.coverImage.blurDataUrl ? 'blur' : 'empty'
                        }
                        blurDataURL={group.coverImage.blurDataUrl ?? undefined}
                    />
                ) : (
                    <div className='flex h-full w-full items-center justify-center bg-stone-200'>
                        <Images className='h-12 w-12 text-stone-400' />
                    </div>
                )}

                {/* Gradient Overlay */}
                <div className='absolute inset-0 bg-linear-to-t from-stone-900/90 via-stone-900/30 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90' />

                {/* Content */}
                <div className='absolute inset-x-0 bottom-0 p-6'>
                    {/* Media Count Badge */}
                    <div className='mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm'>
                        <Images className='text-gold-400 h-4 w-4' />
                        <span className='text-sm font-medium text-white'>
                            {group.mediaCount}{' '}
                            {group.mediaCount === 1 ? 'Photo' : 'Photos'}
                        </span>
                    </div>

                    {/* Group Name */}
                    <h3 className='group-hover:text-gold-400 mb-2 font-serif text-2xl font-medium text-white transition-colors duration-300 md:text-3xl'>
                        {group.name}
                    </h3>

                    {/* Description */}
                    {group.description && (
                        <p className='line-clamp-2 text-sm leading-relaxed text-stone-300'>
                            {group.description}
                        </p>
                    )}

                    {/* View Gallery Link */}
                    <div className='group-hover:text-gold-400 mt-4 flex items-center gap-2 text-sm font-medium text-white/80 transition-colors duration-300'>
                        <span>View Gallery</span>
                        <svg
                            className='h-4 w-4 transition-transform duration-300 group-hover:translate-x-1'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M17 8l4 4m0 0l-4 4m4-4H3'
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </Link>
    )
}
