/**
 * DrKarlinskyTrustStrip
 *
 * Quiet authority bar that anchors credibility right below the hero.
 * Pulls the certification badges already attached to Dr. Karlinsky's
 * surgeon record so the SVGs stay the source of truth.
 */
import Image from 'next/image'

import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import { surgeons } from '@/lib/data/surgeons/surgeons-data'

export type DrKarlinskyTrustStripProps = {
    readonly id?: string
}

export function DrKarlinskyTrustStrip({
    id = 'trust-strip',
}: DrKarlinskyTrustStripProps) {
    const badges = surgeons[0]?.certificationBadges ?? []
    if (badges.length === 0) {
        return null
    }

    return (
        <SectionContainer
            id={id}
            variant='default'
            className='relative border-y border-stone-200/70 bg-stone-50'
            paddingY='py-8 lg:py-10'
        >
            <ContentWrapper size='xl' paddingX='px-6 md:px-12'>
                <div className='flex flex-col items-center gap-6 md:flex-row md:items-center md:justify-between md:gap-10'>
                    <div className='shrink-0 text-center md:text-left'>
                        <p className='text-gold-600 text-xs font-bold tracking-[0.22em] uppercase'>
                            Verified Credentials
                        </p>
                        <p className='mt-1 font-serif text-lg text-stone-800'>
                            Trusted by the institutions that matter.
                        </p>
                    </div>
                    <ul
                        className='-mx-6 flex w-full snap-x items-center gap-5 overflow-x-auto px-6 md:mx-0 md:flex-wrap md:justify-end md:overflow-visible md:px-0'
                        aria-label='Board certifications and fellowships'
                    >
                        {badges.map((badge) => (
                            <li
                                key={badge.alt}
                                className='shrink-0 snap-center rounded-lg bg-white p-2.5 shadow-sm ring-1 ring-stone-200/70 transition-shadow hover:shadow-md'
                                title={badge.alt}
                            >
                                <Image
                                    src={badge.src}
                                    alt={badge.alt}
                                    width={96}
                                    height={64}
                                    className='h-12 w-auto object-contain grayscale transition-all duration-300 hover:grayscale-0 md:h-14'
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
