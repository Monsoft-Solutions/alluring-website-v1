/**
 * DrKarlinskyCredentialsWall
 *
 * Heavyweight E-E-A-T section. Splits into:
 *   1) A wall of all 6 board/fellowship badges with their full names.
 *   2) Two "verified profile" cards linking to Healthgrades & RealSelf
 *      (the externalProfiles drive PhysicianSchema sameAs as well).
 */
import { ExternalLink, ShieldCheck } from 'lucide-react'
import Image from 'next/image'

import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import { surgeons } from '@/lib/data/surgeons/surgeons-data'

type ExternalProfileCard = {
    readonly key: string
    readonly platform: string
    readonly tagline: string
    readonly url: string
}

export type DrKarlinskyCredentialsWallProps = {
    readonly id?: string
}

export function DrKarlinskyCredentialsWall({
    id = 'credentials',
}: DrKarlinskyCredentialsWallProps) {
    const surgeon = surgeons[0]
    if (!surgeon) {
        return null
    }

    const badges = surgeon.certificationBadges ?? []
    const certifications = surgeon.certifications

    const externalCards: ExternalProfileCard[] = []
    if (surgeon.externalProfiles?.healthgrades) {
        externalCards.push({
            key: 'healthgrades',
            platform: 'Healthgrades',
            tagline: 'Verified physician profile & patient reviews',
            url: surgeon.externalProfiles.healthgrades,
        })
    }
    if (surgeon.externalProfiles?.realself) {
        externalCards.push({
            key: 'realself',
            platform: 'RealSelf',
            tagline: 'Featured cosmetic surgeon profile & Q&A',
            url: surgeon.externalProfiles.realself,
        })
    }

    return (
        <SectionContainer
            id={id}
            variant='default'
            className='relative overflow-hidden bg-stone-950'
            paddingY='py-20 lg:py-28'
        >
            {/* Subtle gold ambient */}
            <div className='pointer-events-none absolute inset-0'>
                <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.12),_transparent_60%)]' />
                <div className='bg-gold-500/10 absolute -top-1/4 left-1/3 h-[500px] w-[500px] rounded-full blur-3xl' />
            </div>

            <ContentWrapper
                size='xl'
                paddingX='px-6 md:px-12'
                className='relative z-10'
            >
                <div className='mx-auto mb-14 max-w-3xl text-center lg:mb-16'>
                    <p className='text-gold-400 mb-3 text-xs font-bold tracking-[0.22em] uppercase'>
                        The Receipts
                    </p>
                    <h2 className='font-serif text-3xl leading-tight text-white md:text-4xl lg:text-5xl'>
                        Verified credentials.{' '}
                        <span className='text-gold-300 italic'>
                            Not just claims.
                        </span>
                    </h2>
                    <p className='mt-4 text-base leading-relaxed text-stone-300 lg:text-lg'>
                        Six board certifications and fellowships. Two
                        independent physician directories. Look us up —
                        we&apos;ll wait.
                    </p>
                </div>

                {/* Badge wall */}
                {badges.length > 0 && (
                    <div className='mb-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6'>
                        {badges.map((badge, index) => {
                            const certName = certifications[index] ?? badge.alt
                            return (
                                <div
                                    key={badge.alt}
                                    className='ring-gold-500/15 group flex flex-col items-center gap-3 rounded-2xl bg-white/5 p-5 ring-1 backdrop-blur-md transition-all duration-300 hover:bg-white/[0.08]'
                                >
                                    <div className='flex h-20 w-20 items-center justify-center rounded-xl bg-white p-2.5 shadow-lg shadow-stone-950/40'>
                                        <Image
                                            src={badge.src}
                                            alt={badge.alt}
                                            width={80}
                                            height={80}
                                            className='h-full w-auto object-contain'
                                        />
                                    </div>
                                    <p className='text-center text-[11px] leading-snug font-medium text-stone-300'>
                                        {certName}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* External profile cards */}
                {externalCards.length > 0 && (
                    <div>
                        <div className='mb-6 flex items-center justify-center gap-3'>
                            <ShieldCheck className='text-gold-400 h-5 w-5' />
                            <p className='text-gold-300 text-sm font-semibold tracking-[0.18em] uppercase'>
                                Independently Verified
                            </p>
                            <ShieldCheck className='text-gold-400 h-5 w-5' />
                        </div>
                        <div className='mx-auto grid max-w-3xl gap-4 sm:grid-cols-2'>
                            {externalCards.map((card) => (
                                <a
                                    key={card.key}
                                    href={card.url}
                                    target='_blank'
                                    rel='noopener noreferrer nofollow'
                                    className='ring-gold-500/20 hover:ring-gold-400/60 group flex items-center justify-between gap-4 rounded-xl bg-white/[0.04] p-5 ring-1 backdrop-blur-md transition-all duration-300 hover:bg-white/[0.08]'
                                >
                                    <div>
                                        <p className='text-gold-300 text-xs font-semibold tracking-wide uppercase'>
                                            View on
                                        </p>
                                        <p className='mt-1 font-serif text-2xl text-white'>
                                            {card.platform}
                                        </p>
                                        <p className='mt-1 text-sm text-stone-400'>
                                            {card.tagline}
                                        </p>
                                    </div>
                                    <ExternalLink className='text-gold-400 group-hover:text-gold-300 h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5' />
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </ContentWrapper>
        </SectionContainer>
    )
}
