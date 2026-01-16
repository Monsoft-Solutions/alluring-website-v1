import { SectionContainer } from '../shared/section-container.component'
import { ContentWrapper } from '../shared/content-wrapper.component'
import Image from 'next/image'
import Link from 'next/link'
import { getFeaturedGalleryMedia } from '@/lib/queries/gallery/gallery-list.query'

import type { GalleryMediaCard } from '@/lib/types/gallery/gallery-group.type'

const GalleryCard = ({ media }: { media: GalleryMediaCard }) => {
    return (
        <Link
            href={`/gallery/${media.slug}`}
            className='group relative block cursor-pointer'
        >
            <div className='relative aspect-[4/5] w-full overflow-hidden bg-stone-200 shadow-xl'>
                <Image
                    src={media.url}
                    alt={media.alt}
                    fill
                    className='h-full w-full object-cover transition-transform duration-700 group-hover:scale-105'
                    sizes='(max-width: 768px) 50vw, 25vw'
                    placeholder={media.blurDataUrl ? 'blur' : 'empty'}
                    blurDataURL={media.blurDataUrl ?? undefined}
                />
                {/* Overlay */}
                <div className='absolute inset-0 bg-stone-900/20 transition-colors duration-500 group-hover:bg-stone-900/0'></div>

                {/* Badge */}
                <div className='absolute top-4 left-4 bg-white/90 px-3 py-1 backdrop-blur-sm'>
                    <span className='text-xs font-bold tracking-widest text-stone-900 uppercase'>
                        Real Results
                    </span>
                </div>
            </div>

            <div className='mt-4 text-center'>
                <h4 className='group-hover:text-gold-600 font-serif text-xl text-stone-900 transition-colors'>
                    {media.title}
                </h4>
            </div>
        </Link>
    )
}

export async function BeforeAfter() {
    const { media } = await getFeaturedGalleryMedia(4)

    // Don't render section if no featured gallery images
    if (media.length === 0) {
        return null
    }

    return (
        <SectionContainer
            id='gallery'
            variant='default'
            className='bg-stone-50'
            paddingY='py-32'
        >
            <ContentWrapper size='lg' paddingX='px-6 md:px-12'>
                <div className='mx-auto mb-20 max-w-3xl text-center'>
                    <span className='text-gold-500 mb-3 block text-sm font-bold tracking-widest uppercase'>
                        The Evidence
                    </span>
                    <h2 className='mb-6 font-serif text-4xl text-stone-900 md:text-6xl'>
                        Real Results.
                    </h2>
                    <p className='text-xl font-light text-stone-600'>
                        Browse our verified patient transformations.
                    </p>
                </div>

                <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-4'>
                    {media.map((item) => (
                        <GalleryCard key={item.id} media={item} />
                    ))}
                </div>

                <div className='mt-16 text-center'>
                    <Link
                        href='/gallery'
                        className='inline-block border border-stone-200 px-8 py-4 text-sm font-bold tracking-widest text-stone-900 uppercase transition-colors hover:bg-stone-900 hover:text-white'
                    >
                        View Full Gallery
                    </Link>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
