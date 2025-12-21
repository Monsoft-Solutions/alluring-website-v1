/**
 * Instagram Hero Component
 *
 * Hero section with Instagram profile information.
 *
 * @module components/instagram/instagram-hero
 */
import Image from 'next/image'
import Link from 'next/link'
import { Instagram, ExternalLink } from 'lucide-react'

import { SectionContainer } from '@/components/shared/section-container.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import type { InstagramProfileInfo } from '@/types/instagram.type'
import { siteConfig } from '@/lib/data/site-config'

type InstagramHeroProps = {
    profile?: InstagramProfileInfo | null
    totalPosts?: number
}

/**
 * Format large numbers with K/M suffix
 */
function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
}

export function InstagramHero({ profile, totalPosts }: InstagramHeroProps) {
    const instagramUrl =
        siteConfig.social.find((s) => s.platform === 'instagram')?.url ??
        'https://instagram.com/alluringplasticsurgery'

    const handle = profile?.handle ?? 'alluringplasticsurgery'
    const postsCount = totalPosts ?? profile?.postsCount ?? 0

    return (
        <SectionContainer className='bg-white py-12 md:py-16'>
            <ContentWrapper>
                <div className='flex flex-col items-center gap-6 md:flex-row md:gap-12'>
                    {/* Profile Picture */}
                    <div className='relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-stone-200 md:h-36 md:w-36'>
                        {profile?.profilePictureUrl ? (
                            <Image
                                src={profile.profilePictureUrl}
                                alt={`${handle} profile`}
                                fill
                                className='object-cover'
                                priority
                            />
                        ) : (
                            <div className='flex h-full w-full items-center justify-center bg-stone-100'>
                                <Instagram className='h-10 w-10 text-stone-400 md:h-14 md:w-14' />
                            </div>
                        )}
                    </div>

                    {/* Profile Info */}
                    <div className='flex flex-1 flex-col items-center text-center md:items-start md:text-left'>
                        {/* Handle & Follow Button */}
                        <div className='flex flex-col items-center gap-4 md:flex-row'>
                            <h1 className='font-sans text-xl font-normal text-stone-900 md:text-2xl'>
                                @{handle}
                            </h1>
                            <Link
                                href={instagramUrl}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='inline-flex items-center gap-2 rounded-md bg-stone-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-stone-800'
                            >
                                <ExternalLink className='h-4 w-4' />
                                Follow on Instagram
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className='mt-4 flex gap-8'>
                            <div className='text-center md:text-left'>
                                <span className='font-bold text-stone-900'>
                                    {formatNumber(postsCount)}
                                </span>{' '}
                                <span className='text-stone-500'>posts</span>
                            </div>
                            {profile?.followersCount && (
                                <div className='text-center md:text-left'>
                                    <span className='font-bold text-stone-900'>
                                        {formatNumber(profile.followersCount)}
                                    </span>{' '}
                                    <span className='text-stone-500'>
                                        followers
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Name & Bio */}
                        <div className='mt-4'>
                            {profile?.fullName && (
                                <p className='font-serif text-lg font-medium text-stone-900'>
                                    {profile.fullName}
                                </p>
                            )}
                            {profile?.biography && (
                                <p className='mt-1 max-w-lg text-sm whitespace-pre-wrap text-stone-600'>
                                    {profile.biography}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
