/**
 * ExploreSection Component
 *
 * Grid of cards linking to key sections of the website.
 * Helps guide users to explore more content after form submission.
 *
 * Features:
 * - Grid layout with hover effects
 * - Icon-based cards with descriptions
 * - Links to main site sections
 */

import Link from 'next/link'
import {
    Sparkles,
    ImageIcon,
    BookOpen,
    CreditCard,
    Users,
    ArrowRight,
} from 'lucide-react'

import { SectionContainer } from '@/components/shared/section-container.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionHeader } from '@/components/shared/section-header.component'

export type ExploreSectionProps = {
    readonly id?: string
}

const exploreLinks = [
    {
        title: 'Our Procedures',
        description:
            'Explore our signature procedures and find the perfect one for you',
        href: '/procedures',
        icon: Sparkles,
    },
    {
        title: 'Gallery',
        description: 'See real patient results and transformations',
        href: '/gallery',
        icon: ImageIcon,
    },
    {
        title: 'Blog & Insights',
        description: 'Read expert tips and learn about plastic surgery',
        href: '/blog',
        icon: BookOpen,
    },
    {
        title: 'Financing Options',
        description: 'Flexible payment plans to make your dream affordable',
        href: '/plastic-surgery-financing-miami',
        icon: CreditCard,
    },
    {
        title: 'Current Specials',
        description: 'View our latest promotions and limited-time offers',
        href: '/miami-plastic-surgery-specials',
        icon: Sparkles,
    },
    {
        title: 'About Us',
        description: 'Meet our team of board-certified surgeons',
        href: '/about',
        icon: Users,
    },
]

export function ExploreSection({ id = 'explore' }: ExploreSectionProps) {
    return (
        <SectionContainer id={id} variant='muted'>
            <ContentWrapper size='lg'>
                {/* Section Header */}
                <SectionHeader
                    badge='While You Wait'
                    title='Explore More'
                    description='Learn more about our procedures, see patient results, and discover what makes us different.'
                    align='center'
                    className='mb-16'
                />

                {/* Grid of Links */}
                <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                    {exploreLinks.map((link, index) => (
                        <Link
                            key={index}
                            href={link.href}
                            className='group hover:border-gold-500/50 hover:shadow-gold-500/10 relative overflow-hidden rounded-xl border border-stone-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg'
                        >
                            {/* Background gradient on hover */}
                            <div className='from-gold-50/0 to-gold-50/0 absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100' />

                            <div className='relative'>
                                {/* Icon */}
                                <div className='bg-gold-100 text-gold-600 group-hover:bg-gold-500 mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110 group-hover:text-white'>
                                    <link.icon className='h-6 w-6' />
                                </div>

                                {/* Title */}
                                <h3 className='group-hover:text-gold-600 mb-2 font-serif text-xl font-semibold text-stone-900 transition-colors duration-300'>
                                    {link.title}
                                </h3>

                                {/* Description */}
                                <p className='mb-4 text-stone-600'>
                                    {link.description}
                                </p>

                                {/* Arrow indicator */}
                                <div className='text-gold-600 flex items-center text-sm font-medium'>
                                    <span className='mr-2'>Learn More</span>
                                    <ArrowRight className='h-4 w-4 transition-transform duration-300 group-hover:translate-x-1' />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
