'use client'

import { SectionContainer } from '../shared/section-container.component'
import { ContentWrapper } from '../shared/content-wrapper.component'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

// TODO: Add a link to the full gallery
const GalleryCard = ({
    image,
    label,
    subLabel,
}: {
    image: string
    label: string
    subLabel: string
}) => {
    return (
        <div className='group relative cursor-pointer'>
            <div className='relative aspect-[4/5] w-full overflow-hidden bg-stone-200 shadow-xl'>
                <Image
                    src={image}
                    alt={label}
                    fill
                    className='h-full w-full object-cover transition-transform duration-700 group-hover:scale-105'
                    sizes='(max-width: 768px) 50vw, 25vw'
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
                    {label}
                </h4>
                <p className='mt-1 text-base tracking-widest text-stone-500 uppercase'>
                    {subLabel}
                </p>
            </div>
        </div>
    )
}

export const BeforeAfter = () => {
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
                    <GalleryCard
                        image='https://www.alluringplasticsurgery.com/wp-content/uploads/2025/08/karlinsky-bbl-01.jpg'
                        label='BBL & Arm Lipo'
                        subLabel='Body Contouring'
                    />
                    <GalleryCard
                        image='https://www.alluringplasticsurgery.com/wp-content/uploads/2025/08/karlinsky-baug-04.jpg'
                        label='Breast Augmentation'
                        subLabel='Volume Enhancement'
                    />
                    <GalleryCard
                        image='https://www.alluringplasticsurgery.com/wp-content/uploads/2025/08/karlinsky-baug-05.jpg'
                        label='Breast Augmentation'
                        subLabel='Natural Profile'
                    />
                    <GalleryCard
                        image='https://www.alluringplasticsurgery.com/wp-content/uploads/2025/08/karlinsky-baug-11.jpg'
                        label='Breast Augmentation'
                        subLabel='Lifestyle Result'
                    />
                </div>

                <div className='mt-16 text-center'>
                    <Link href='/gallery'>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className='inline-block border border-stone-200 px-8 py-4 text-sm font-bold tracking-widest text-stone-900 uppercase transition-colors hover:bg-stone-900 hover:text-white'
                        >
                            View Full Gallery
                        </motion.button>
                    </Link>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
