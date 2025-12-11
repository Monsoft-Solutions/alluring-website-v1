'use client'

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@workspace/ui/components/avatar'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { CheckCircle2, Link as LinkIcon, MapPin, Settings } from 'lucide-react'
import Link from 'next/link'
import type { SocialMediaSettings } from '@workspace/db/schema'

interface InstagramProfileHeaderProps {
    profile: SocialMediaSettings
}

function formatNumber(num: number | null | undefined): string {
    if (num === null || num === undefined) return '0'
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
}

export function InstagramProfileHeader({
    profile,
}: InstagramProfileHeaderProps) {
    if (!profile) return null

    return (
        <div className='flex flex-col items-start gap-8 py-8 md:flex-row md:items-center'>
            {/* Profile Picture */}
            <div className='mx-auto shrink-0 md:mx-0'>
                <div className='rounded-full bg-linear-to-tr from-yellow-400 via-red-500 to-purple-500 p-1'>
                    <div className='bg-background rounded-full p-1'>
                        <Avatar className='border-background h-32 w-32 border-2 md:h-40 md:w-40'>
                            <AvatarImage
                                src={profile.profilePictureUrl || undefined}
                                alt={
                                    profile.fullName ||
                                    profile.handle ||
                                    'Profile'
                                }
                                className='object-cover'
                            />
                            <AvatarFallback className='text-4xl'>
                                {profile.handle?.slice(0, 2).toUpperCase() ??
                                    'IG'}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </div>

            {/* Profile Info */}
            <div className='w-full flex-1 space-y-4 md:space-y-6'>
                {/* Handle & Actions */}
                <div className='flex flex-col items-start gap-4 md:flex-row md:items-center'>
                    <div className='flex items-center gap-2'>
                        <h2 className='text-foreground text-xl font-normal md:text-xl'>
                            {profile.handle}
                        </h2>
                        {profile.isVerified && (
                            <CheckCircle2 className='h-4 w-4 fill-blue-500 text-white' />
                        )}
                    </div>

                    <div className='flex w-full gap-2 md:ml-4 md:w-auto'>
                        <Button
                            variant='secondary'
                            className='bg-secondary hover:bg-secondary/80 h-8 flex-1 px-4 text-sm font-semibold md:flex-none'
                            asChild
                        >
                            <Link href='/social-media/settings'>
                                Edit Profile
                            </Link>
                        </Button>
                        <Button
                            variant='secondary'
                            size='icon'
                            className='bg-secondary hover:bg-secondary/80 h-8 w-8'
                            asChild
                        >
                            <Link href='/social-media/settings'>
                                <Settings className='h-4 w-4' />
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className='flex justify-around gap-10 border-y py-3 text-[16px] md:justify-start md:border-none md:py-0'>
                    <div className='flex flex-col items-center gap-1 md:flex-row'>
                        <span className='font-semibold'>
                            {formatNumber(profile.postsCount)}
                        </span>
                        <span className='text-muted-foreground md:text-foreground'>
                            posts
                        </span>
                    </div>
                    <div className='flex flex-col items-center gap-1 md:flex-row'>
                        <span className='font-semibold'>
                            {formatNumber(profile.followersCount)}
                        </span>
                        <span className='text-muted-foreground md:text-foreground'>
                            followers
                        </span>
                    </div>
                    <div className='flex flex-col items-center gap-1 md:flex-row'>
                        <span className='font-semibold'>
                            {formatNumber(profile.followingCount)}
                        </span>
                        <span className='text-muted-foreground md:text-foreground'>
                            following
                        </span>
                    </div>
                </div>

                {/* Bio */}
                <div className='space-y-0.5 px-4 text-sm md:px-0'>
                    {profile.fullName && (
                        <div className='font-semibold'>{profile.fullName}</div>
                    )}

                    {profile.categoryName && (
                        <div className='text-muted-foreground'>
                            {profile.categoryName}
                        </div>
                    )}

                    {profile.biography && (
                        <div className='mt-1 whitespace-pre-wrap'>
                            {profile.biography}
                        </div>
                    )}

                    {profile.businessAddress && (
                        <div className='mt-1 flex items-center gap-1 text-[#00376b] dark:text-[#e0f1ff]'>
                            <MapPin className='h-3 w-3' />
                            <span>
                                {[
                                    profile.businessAddress.streetAddress,
                                    profile.businessAddress.cityName,
                                    profile.businessAddress.zipCode,
                                ]
                                    .filter(Boolean)
                                    .join(', ')}
                            </span>
                        </div>
                    )}

                    {profile.externalUrl && (
                        <a
                            href={profile.externalUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='mt-1 flex items-center gap-1 font-semibold text-[#00376b] hover:underline dark:text-[#e0f1ff]'
                        >
                            <LinkIcon className='h-3 w-3' />
                            {profile.externalUrl.replace(/^https?:\/\//, '')}
                        </a>
                    )}
                </div>
            </div>
        </div>
    )
}
