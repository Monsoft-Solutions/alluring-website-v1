/**
 * BlogSubpageHeader Component
 *
 * A simpler header component for blog sub-pages (categories, tags).
 * Uses the luxury aesthetic but in a more compact form.
 */
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { cn } from '@workspace/ui/lib/utils'

import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'

type NavigationLink = {
    href: string
    icon: ReactNode
    text: string
}

type BlogSubpageHeaderProps = {
    badge?: string
    title: string
    description: string
    navigationLinks?: NavigationLink[]
    className?: string
}

export function BlogSubpageHeader({
    badge,
    title,
    description,
    navigationLinks,
    className,
}: BlogSubpageHeaderProps) {
    return (
        <SectionContainer
            variant='default'
            className={cn('bg-stone-900 py-16 md:py-24', className)}
        >
            <ContentWrapper size='lg' paddingX='px-6 md:px-12'>
                {/* Back to Blog Link */}
                <Link
                    href='/blog'
                    className='text-gold-400 hover:text-gold-300 mb-8 inline-flex items-center gap-2 text-sm font-medium transition-colors'
                >
                    <ArrowLeft className='h-4 w-4' />
                    Back to Blog
                </Link>

                <div className='max-w-2xl'>
                    {/* Badge */}
                    {badge && (
                        <div className='mb-4 flex items-center gap-3'>
                            <span className='bg-gold-400 h-px w-12' />
                            <span className='text-gold-500 text-sm font-bold tracking-[0.2em] uppercase'>
                                {badge}
                            </span>
                        </div>
                    )}

                    {/* Title */}
                    <h1 className='mb-4 font-serif text-4xl text-white md:text-5xl'>
                        {title}
                    </h1>

                    {/* Gold accent line */}
                    <div className='bg-gold-500 mb-6 h-1 w-16 shadow-[0_0_15px_rgba(234,179,8,0.3)]' />

                    {/* Description */}
                    <p className='mb-8 text-base leading-relaxed font-light text-stone-300 md:text-lg'>
                        {description}
                    </p>

                    {/* Navigation Links */}
                    {navigationLinks && navigationLinks.length > 0 && (
                        <div className='flex flex-wrap items-center gap-4'>
                            {navigationLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className='hover:border-gold-500/50 inline-flex items-center gap-2 rounded-full border border-stone-700 bg-stone-800/50 px-4 py-2 text-sm font-medium text-stone-300 transition-all duration-200 hover:bg-stone-800 hover:text-white'
                                >
                                    {link.icon}
                                    {link.text}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
