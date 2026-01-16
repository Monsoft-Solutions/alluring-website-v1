import {
    Sparkles,
    Images,
    Tag,
    CreditCard,
    Users,
    HelpCircle,
    BookOpen,
} from 'lucide-react'

import { LinkCard } from './link-card'

/**
 * Featured links configuration
 * Full-width cards for the most important page links
 */
const featuredLinks = [
    {
        href: '/procedures',
        title: 'Our Procedures',
        description: 'BBL, Breast, Body & More',
        icon: <Sparkles className='h-5 w-5' />,
        analyticsId: 'links-procedures',
    },
]

/**
 * Primary links configuration
 * Full-width for better readability
 */
const primaryLinks = [
    {
        href: '/gallery',
        title: 'Before & After',
        description: 'Real Patient Results',
        icon: <Images className='h-5 w-5' />,
        analyticsId: 'links-gallery',
    },
    {
        href: '/miami-plastic-surgery-specials',
        title: 'Specials',
        description: 'Limited Time Offers',
        icon: <Tag className='h-5 w-5' />,
        badge: 'New',
        analyticsId: 'links-specials',
    },
    {
        href: '/plastic-surgery-financing-miami',
        title: 'Financing',
        description: 'From $99/mo',
        icon: <CreditCard className='h-5 w-5' />,
        analyticsId: 'links-financing',
    },
    {
        href: '/about',
        title: 'Our Surgeons',
        description: 'Meet the Team',
        icon: <Users className='h-5 w-5' />,
        analyticsId: 'links-about',
    },
]

/**
 * Secondary links configuration
 * 2-column grid for supporting pages
 */
const secondaryLinks = [
    {
        href: '/faqs',
        title: 'FAQs',
        icon: <HelpCircle className='h-5 w-5' />,
        analyticsId: 'links-faqs',
    },
    {
        href: '/blog',
        title: 'Blog',
        icon: <BookOpen className='h-5 w-5' />,
        analyticsId: 'links-blog',
    },
]

/**
 * LinksGrid Component
 *
 * Displays all page links in an organized grid layout
 * - Featured links: Full-width
 * - Primary links: Full-width for readability
 * - Secondary links: 2-column grid
 */
export function LinksGrid() {
    return (
        <div className='flex w-full flex-col gap-3'>
            {/* Featured Links - Full Width */}
            <div className='flex flex-col gap-3'>
                {featuredLinks.map((link, index) => (
                    <LinkCard
                        key={link.href}
                        {...link}
                        variant='featured'
                        className={`animate-fade-in-up animate-delay-${(index + 3) * 100}`}
                    />
                ))}
            </div>

            {/* Primary Links - Full Width */}
            <div className='flex flex-col gap-3'>
                {primaryLinks.map((link, index) => (
                    <LinkCard
                        key={link.href}
                        {...link}
                        className={`animate-fade-in-up animate-delay-${(index + 4) * 100}`}
                    />
                ))}
            </div>

            {/* Divider */}
            <div className='my-2 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent' />

            {/* Secondary Links - 2 Column Grid */}
            <div className='grid grid-cols-2 gap-3'>
                {secondaryLinks.map((link, index) => (
                    <LinkCard
                        key={link.href}
                        {...link}
                        className={`animate-fade-in-up animate-delay-${(index + 8) * 100}`}
                    />
                ))}
            </div>
        </div>
    )
}
