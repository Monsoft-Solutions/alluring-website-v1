import Link from 'next/link'
import type { ReactNode } from 'react'

type BlogHeroBadge = {
    icon: ReactNode
    text: string
}

type BlogHeroNavigationLink = {
    href: string
    icon: ReactNode
    text: string
}

type BlogHeroSectionProps = {
    badge?: BlogHeroBadge
    title: string
    description: ReactNode
    navigationLinks?: BlogHeroNavigationLink[]
}

export function BlogHeroSection({
    badge,
    title,
    description,
    navigationLinks,
}: BlogHeroSectionProps) {
    return (
        <header className='mb-24 space-y-12'>
            {/* Hero Content */}
            <div className='space-y-8 text-center'>
                <div className='space-y-4'>
                    {badge && (
                        <div className='bg-primary/10 text-primary inline-flex items-center rounded-full px-4 py-2'>
                            {badge.icon}
                            <span className='text-sm font-medium'>
                                {badge.text}
                            </span>
                        </div>
                    )}

                    <h1 className='text-foreground mx-auto text-5xl leading-tight font-bold tracking-tight sm:text-6xl sm:leading-tight lg:text-7xl lg:leading-tight'>
                        {title}
                    </h1>

                    <div className='text-muted-foreground mx-auto max-w-4xl text-xl leading-relaxed sm:text-2xl sm:leading-relaxed'>
                        {description}
                    </div>
                </div>
            </div>

            {/* Navigation Links */}
            {navigationLinks && navigationLinks.length > 0 && (
                <div className='border-border/30 flex flex-wrap items-center gap-6 border-t pt-10'>
                    {navigationLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className='text-primary hover:text-primary/80 inline-flex items-center gap-2 text-sm font-medium transition-colors duration-200 hover:underline hover:decoration-1 hover:underline-offset-4'
                        >
                            {link.icon}
                            {link.text}
                        </Link>
                    ))}
                </div>
            )}
        </header>
    )
}
