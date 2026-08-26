import Link from 'next/link'
import { Award, Calendar, CreditCard, Star, Users } from 'lucide-react'

import { siteConfig } from '@/lib/data/site-config'

import { SectionContainer } from '../shared/section-container.component'
import { ContentWrapper } from '../shared/content-wrapper.component'

/**
 * Trust Stat Item
 * Individual trust metric with icon and text
 */
type TrustStatItem = {
    readonly icon: React.ReactNode
    readonly label: string
    readonly value: string
    readonly href?: string
    readonly ariaLabel?: string
}

/**
 * Trust Bar Component
 *
 * Displays key trust signals immediately after the hero section.
 * Server-rendered for SEO. Uses site-config.ts as source of truth.
 *
 * Highlights:
 * - 5,000+ Happy Patients
 * - 15+ Years Experience
 * - Double Board-Certified
 * - Google rating (from siteConfig.trustStats, linked to reviews)
 * - Financing from $99/mo
 */
export function TrustBar() {
    const trustStats = siteConfig.trustStats

    // Don't render if trustStats is not configured
    if (!trustStats) {
        return null
    }

    const stats: TrustStatItem[] = [
        {
            icon: <Users className='h-5 w-5' />,
            value: trustStats.patients,
            label: 'Happy Patients',
            ariaLabel: `${trustStats.patients} happy patients`,
        },
        {
            icon: <Calendar className='h-5 w-5' />,
            value: trustStats.years,
            label: 'Years Experience',
            ariaLabel: `${trustStats.years} years of experience`,
        },
        {
            icon: <Award className='h-5 w-5' />,
            value: trustStats.accreditation ?? 'Board-Certified',
            label: 'Surgeons',
            ariaLabel: `${trustStats.accreditation ?? 'Board-Certified'} surgeons`,
        },
        {
            icon: <Star className='h-5 w-5 fill-current' />,
            value: `${trustStats.rating}★`,
            label: 'Google Rating',
            href: '#reviews',
            ariaLabel: `${trustStats.rating} star Google rating - click to see reviews`,
        },
        {
            icon: <CreditCard className='h-5 w-5' />,
            value: 'From $99/mo',
            label: 'Financing',
            href: '/plastic-surgery-financing-miami',
            ariaLabel: 'Financing available from $99 per month',
        },
    ]

    return (
        <SectionContainer
            as='div'
            variant='default'
            className='border-y border-stone-200 bg-white'
            paddingY='py-6 md:py-8'
            ariaLabel='Trust signals and credentials'
        >
            <ContentWrapper size='lg' paddingX='px-6 md:px-12'>
                <div
                    className='grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5 lg:gap-8'
                    role='list'
                    aria-label='Key trust metrics'
                >
                    {stats.map((stat, index) => (
                        <TrustStatCard key={index} stat={stat} />
                    ))}
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}

/**
 * Trust Stat Card
 * Individual stat display with optional link
 */
function TrustStatCard({ stat }: { readonly stat: TrustStatItem }) {
    const content = (
        <div
            className='flex items-center gap-3'
            role='listitem'
            aria-label={stat.ariaLabel}
        >
            {/* Icon */}
            <div className='text-gold-500 flex-shrink-0' aria-hidden='true'>
                {stat.icon}
            </div>

            {/* Text */}
            <div className='min-w-0'>
                <div className='truncate text-base font-bold text-stone-900 md:text-lg'>
                    {stat.value}
                </div>
                <div className='truncate text-xs text-stone-500 md:text-sm'>
                    {stat.label}
                </div>
            </div>
        </div>
    )

    if (stat.href) {
        return (
            <Link
                href={stat.href}
                className='group transition-colors hover:opacity-80'
                aria-label={stat.ariaLabel}
            >
                {content}
            </Link>
        )
    }

    return content
}
