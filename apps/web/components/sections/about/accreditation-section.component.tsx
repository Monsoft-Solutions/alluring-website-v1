/**
 * Accreditation Section Component
 *
 * Dark background section with the credentials a reader can check with the
 * body that issued them. Only what the claims canon verifies (#354): the
 * American Board of Surgery certification since 2008, the FACS fellowship,
 * the Florida license, one surgeon and the Google rating. The facility
 * accreditation, board counts, patient volume and tenure it used to claim
 * are unverified and gone.
 */

import { Award, Heart, Plane, ShieldCheck, Star } from 'lucide-react'

import {
    KARLINSKY_CREDENTIALS_WITH_YEAR,
    KARLINSKY_FLORIDA_LICENSE,
    KARLINSKY_NAME,
    KARLINSKY_SHORT_NAME,
} from '@workspace/shared/claims/surgeon'

import { SectionContainer } from '@/components/shared/section-container.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { siteConfig } from '@/lib/data/site-config'

function accreditationBadges(ratingText: string) {
    return [
        {
            icon: ShieldCheck,
            title: 'American Board of Surgery',
            description: KARLINSKY_CREDENTIALS_WITH_YEAR.replace(
                /^She /,
                `${KARLINSKY_SHORT_NAME} `
            ),
        },
        {
            icon: Award,
            title: 'One Surgeon',
            // Per procedure, not "every procedure": /about still introduces
            // Dr. Rita Shats while decision D1 is open (canon §13).
            description: `One surgeon performs every body, breast and face procedure at Alluring: ${KARLINSKY_NAME}.`,
        },
        {
            icon: Heart,
            title: 'Florida License',
            description: `An active Florida medical license, ${KARLINSKY_FLORIDA_LICENSE}, with no discipline on record.`,
        },
        {
            icon: Star,
            title: `${ratingText} Stars on Google`,
            description:
                'Read what patients wrote on our Google Business Profile, unedited.',
        },
        {
            icon: Plane,
            title: 'Built for Fly-In Patients',
            description:
                'Virtual consultations, your surgery, pre-op and follow-up dates confirmed in writing, and how many nights to stay in Miami before you fly home. Care in English and Spanish.',
        },
    ]
}

/** Pass `rating` from the synced Google figures; siteConfig is the fallback. */
export function AccreditationSection({
    rating,
}: {
    readonly rating?: number | null
} = {}) {
    const ratingText =
        typeof rating === 'number'
            ? rating.toFixed(1)
            : (siteConfig.trustStats?.rating ?? '4.7')
    return (
        <SectionContainer
            id='accreditation'
            variant='default'
            className='relative overflow-hidden bg-stone-900 text-white'
            paddingY='py-24 lg:py-32'
        >
            {/* Background Decoration */}
            <div className='pointer-events-none absolute inset-0'>
                <div className='bg-gold-500/5 absolute top-0 right-0 h-[500px] w-[500px] rounded-full blur-[150px]' />
                <div className='absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-stone-700/20 blur-[100px]' />
            </div>

            <ContentWrapper
                size='lg'
                paddingX='px-6 md:px-12'
                className='relative z-10'
            >
                {/* Section Header */}
                <div className='mb-16 text-center'>
                    <span className='text-gold-400 mb-4 inline-block text-sm font-bold tracking-widest uppercase'>
                        Credentials
                    </span>
                    <h2 className='mb-6 font-serif text-4xl leading-tight text-white md:text-5xl lg:text-6xl'>
                        Certified.{' '}
                        <span className='text-stone-400 italic'>
                            On the record.
                        </span>
                    </h2>
                    <p className='mx-auto max-w-2xl text-xl leading-relaxed text-stone-300'>
                        Every credential below can be checked with the body that
                        issued it.
                    </p>
                </div>

                {/* Accreditation Grid */}
                <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
                    {accreditationBadges(ratingText).map((badge, idx) => (
                        <div
                            key={idx}
                            className='group hover:border-gold-500/50 border border-stone-800 bg-stone-800/40 p-8 backdrop-blur-sm transition-all duration-300 hover:bg-stone-800/60'
                        >
                            {/* Icon */}
                            <div className='group-hover:bg-gold-500 mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-stone-700 text-stone-300 transition-all duration-300 group-hover:text-white'>
                                <badge.icon className='h-7 w-7' />
                            </div>

                            {/* Title */}
                            <h3 className='mb-3 font-serif text-xl font-bold text-white'>
                                {badge.title}
                            </h3>

                            {/* Description */}
                            <p className='text-base leading-relaxed text-stone-400'>
                                {badge.description}
                            </p>
                        </div>
                    ))}
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
