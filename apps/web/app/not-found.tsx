/**
 * Custom 404 Not Found Page
 *
 * Friendly error page displayed when users navigate to non-existent URLs.
 * Acknowledges recent website updates and provides navigation to main areas.
 *
 * Features:
 * - Luxury design matching brand (stone-900 bg, gold accents)
 * - Witty, friendly messaging about website updates
 * - Quick navigation links to all main site areas
 * - Full-height centered layout with decorative elements
 */

import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'
import { Home, Info, CreditCard, BookOpen, Image, Phone } from 'lucide-react'

import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { mainNavigation } from '@/lib/data/navigation'
import { siteConfig } from '@/lib/data/site-config'

/**
 * Icon mapping for navigation items
 */
const navigationIcons = {
    Home: Home,
    About: Info,
    Financing: CreditCard,
    Blog: BookOpen,
    Gallery: Image,
    Contact: Phone,
}

export default function NotFoundPage() {
    return (
        <main className='relative flex min-h-screen items-center justify-center overflow-hidden bg-stone-900'>
            {/* Decorative Background Elements */}
            <div className='bg-gold-500/10 pointer-events-none absolute top-1/4 left-0 h-[400px] w-[400px] -translate-x-1/2 rounded-full blur-[120px]' />
            <div className='bg-gold-400/5 pointer-events-none absolute right-0 bottom-0 h-[300px] w-[300px] translate-x-1/3 rounded-full blur-[100px]' />

            <ContentWrapper size='md' className='relative z-10 py-16'>
                <div className='flex flex-col items-center text-center'>
                    {/* 404 Display */}
                    <div className='animate-fade-in-up mb-8'>
                        <div className='mb-4 font-serif text-9xl font-bold text-white md:text-[12rem]'>
                            404
                        </div>
                        <div className='bg-gold-500 mx-auto h-1 w-24 shadow-[0_0_20px_rgba(234,179,8,0.4)]' />
                    </div>

                    {/* Headline */}
                    <h1 className='animate-fade-in-up mb-6 font-serif text-4xl leading-tight font-bold text-white [animation-delay:150ms] md:text-5xl lg:text-6xl'>
                        Oops! This Page Took a Vacation
                    </h1>

                    {/* Witty Description */}
                    <div className='animate-fade-in-up mb-12 max-w-2xl text-lg leading-relaxed text-stone-300 [animation-delay:300ms] md:text-xl'>
                        We just gave our website a major makeover (think of it
                        as a digital facelift!), and some pages are still
                        finding their new home. Unlike our surgery results, this
                        page seems to have disappeared completely.
                    </div>

                    {/* CTA Text */}
                    <p className='text-gold-400 animate-fade-in-up mb-8 text-lg font-medium [animation-delay:450ms]'>
                        Let&apos;s get you back on track:
                    </p>

                    {/* Navigation Links */}
                    <div className='animate-fade-in-up grid w-full max-w-3xl grid-cols-2 gap-4 [animation-delay:600ms] sm:grid-cols-3 md:gap-6'>
                        {mainNavigation.map((item) => {
                            const Icon =
                                navigationIcons[
                                    item.label as keyof typeof navigationIcons
                                ]

                            return (
                                <Button
                                    key={item.href}
                                    asChild
                                    variant='outline'
                                    size='lg'
                                    className='hover:border-gold-500/50 group h-auto flex-col gap-3 border-white/20 bg-white/5 px-6 py-6 backdrop-blur-sm transition-all duration-300 hover:bg-white/10'
                                >
                                    <Link href={item.href}>
                                        {Icon && (
                                            <Icon className='text-gold-400 h-8 w-8 transition-transform group-hover:scale-110' />
                                        )}
                                        <span className='text-base font-semibold text-white'>
                                            {item.label}
                                        </span>
                                    </Link>
                                </Button>
                            )
                        })}
                    </div>

                    {/* Emergency Contact */}
                    <div className='animate-fade-in-up mt-12 border-t border-white/10 pt-8 text-center [animation-delay:750ms]'>
                        <p className='mb-4 text-stone-400'>
                            Need immediate assistance?
                        </p>
                        <Button
                            asChild
                            size='lg'
                            className='bg-gold-500 hover:bg-gold-600 min-w-[200px] border-none px-8 text-white shadow-lg shadow-amber-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/30'
                        >
                            <a href={`tel:${siteConfig.contact.phone}`}>
                                <Phone className='mr-2 h-5 w-5' />
                                Call Us Now
                            </a>
                        </Button>
                    </div>
                </div>
            </ContentWrapper>
        </main>
    )
}
