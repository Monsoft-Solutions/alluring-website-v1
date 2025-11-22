/**
 * TeamSection Component
 *
 * Displays team members in a responsive grid layout with avatars,
 * names, roles, bios, and optional social media links.
 *
 * @example
 * ```tsx
 * <TeamSection
 *   headline="Meet Our Team"
 *   members={[
 *     {
 *       name: "John Doe",
 *       role: "CEO",
 *       bio: "Visionary leader...",
 *       avatar: "/images/john.jpg",
 *       social: { linkedin: "https://linkedin.com/in/johndoe" }
 *     },
 *     // ... more members
 *   ]}
 * />
 * ```
 */
import { cn } from '@workspace/ui/lib/utils'
import { Linkedin, Mail, Twitter } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { ContentWrapper } from '@/components/shared/ContentWrapper.component'
import { SectionContainer } from '@/components/shared/SectionContainer.component'
import { SectionHeader } from '@/components/shared/SectionHeader.component'
import type { TeamSectionProps } from '@/lib/types/sections/team-section.type'

/**
 * Map column count to grid classes
 */
const columnClasses = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
}

export function TeamSection({
    badge,
    headline,
    description,
    members,
    columns = 3,
    variant = 'default',
    className,
    id,
}: TeamSectionProps) {
    return (
        <SectionContainer
            variant={variant}
            id={id}
            className={cn('py-16 md:py-24 lg:py-32', className)}
        >
            {/* Section Header */}
            {(badge || headline) && (
                <SectionHeader
                    badge={badge}
                    title={headline}
                    description={description}
                    align='center'
                    className='mb-12 md:mb-16'
                />
            )}

            {/* Team Members Grid */}
            <ContentWrapper>
                <div
                    className={cn(
                        'grid grid-cols-1 gap-8 md:gap-10',
                        columnClasses[columns]
                    )}
                >
                    {members.map((member, index) => (
                        <div
                            key={`team-member-${index}`}
                            className='flex flex-col items-center text-center'
                        >
                            {/* Avatar */}
                            <div className='relative mb-6 overflow-hidden rounded-lg'>
                                <div className='relative mx-auto aspect-square h-48 w-48'>
                                    <Image
                                        src={member.avatar}
                                        alt={member.name}
                                        fill
                                        className='object-cover'
                                        sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw'
                                    />
                                </div>
                            </div>

                            {/* Team Member Info */}
                            <div className='w-full space-y-3'>
                                {/* Name */}
                                <h3 className='text-foreground text-lg font-semibold md:text-xl'>
                                    {member.name}
                                </h3>

                                {/* Role */}
                                <p className='text-primary text-sm font-medium tracking-wide uppercase'>
                                    {member.role}
                                </p>

                                {/* Bio */}
                                {member.bio && (
                                    <p className='text-muted-foreground text-sm leading-relaxed'>
                                        {member.bio}
                                    </p>
                                )}

                                {/* Social Links */}
                                {member.social && (
                                    <div className='flex justify-center gap-4 pt-3'>
                                        {member.social.linkedin && (
                                            <Link
                                                href={member.social.linkedin}
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                aria-label={`${member.name} LinkedIn profile`}
                                                className='text-muted-foreground hover:text-primary transition-colors'
                                            >
                                                <Linkedin className='size-5' />
                                            </Link>
                                        )}
                                        {member.social.twitter && (
                                            <Link
                                                href={member.social.twitter}
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                aria-label={`${member.name} Twitter profile`}
                                                className='text-muted-foreground hover:text-primary transition-colors'
                                            >
                                                <Twitter className='size-5' />
                                            </Link>
                                        )}
                                        {member.social.email && (
                                            <Link
                                                href={`mailto:${member.social.email}`}
                                                aria-label={`Email ${member.name}`}
                                                className='text-muted-foreground hover:text-primary transition-colors'
                                            >
                                                <Mail className='size-5' />
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
