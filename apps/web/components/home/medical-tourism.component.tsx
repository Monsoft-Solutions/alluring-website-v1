import Link from 'next/link'
import {
    Video,
    Plane,
    Building,
    Languages,
    MapPin,
    Globe,
    ArrowRight,
} from 'lucide-react'

import { Button } from '@workspace/ui/components/button'

import { SectionContainer } from '../shared/section-container.component'
import { ContentWrapper } from '../shared/content-wrapper.component'

/**
 * Feature card type
 */
type FeatureCard = {
    readonly icon: React.ReactNode
    readonly title: string
    readonly description: string
}

/**
 * Service area type
 */
type ServiceArea = {
    readonly region: string
    readonly locations: string[]
}

/**
 * Medical Tourism Component
 *
 * Showcases the fly-in patient program for medical tourists.
 * Server-rendered for SEO optimization on medical tourism queries.
 *
 * Features:
 * - Virtual Consultations
 * - Travel Coordination
 * - Recovery Suites
 * - Bilingual Care
 */
export function MedicalTourism() {
    const features: FeatureCard[] = [
        {
            icon: <Video className='h-6 w-6' />,
            title: 'Virtual Consultations',
            description:
                'Meet your surgeon from anywhere in the world. Our HIPAA-compliant video consultations let you discuss goals, review options, and ask questions before traveling.',
        },
        {
            icon: <Plane className='h-6 w-6' />,
            title: 'Travel Coordination',
            description:
                'From airport pickup to hotel recommendations near our clinic, our concierge team handles every detail so you can focus on your transformation.',
        },
        {
            icon: <Building className='h-6 w-6' />,
            title: 'Recovery Suites',
            description:
                'Partner recovery facilities offer 24/7 nursing care, comfortable accommodations, and all the support you need during your initial healing period.',
        },
        {
            icon: <Languages className='h-6 w-6' />,
            title: 'Bilingual Care',
            description:
                'Our entire team is fluent in English and Spanish. We ensure nothing is lost in translation throughout your surgical journey.',
        },
    ]

    const serviceAreas: ServiceArea[] = [
        {
            region: 'United States',
            locations: [
                'New York',
                'Los Angeles',
                'Houston',
                'Chicago',
                'Atlanta',
            ],
        },
        {
            region: 'Latin America',
            locations: ['Colombia', 'Brazil', 'Mexico', 'Argentina', 'Peru'],
        },
        {
            region: 'Caribbean',
            locations: [
                'Puerto Rico',
                'Dominican Republic',
                'Jamaica',
                'Bahamas',
            ],
        },
    ]

    return (
        <SectionContainer
            id='medical-tourism'
            variant='default'
            className='relative overflow-hidden bg-stone-900 text-white'
            paddingY='py-24 lg:py-32'
            ariaLabel='Medical tourism services'
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')] opacity-[0.02]" />

            {/* Decorative Globe */}
            <div className='pointer-events-none absolute -top-20 -right-20 opacity-5'>
                <Globe className='h-80 w-80' />
            </div>

            <ContentWrapper
                size='lg'
                paddingX='px-6 md:px-12'
                className='relative'
            >
                {/* Header */}
                <div className='mb-16 max-w-2xl'>
                    <div className='bg-gold-500/10 text-gold-400 mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold tracking-widest uppercase'>
                        <Plane className='h-3.5 w-3.5' />
                        Fly-In Patient Program
                    </div>
                    <h2 className='mb-6 font-serif text-4xl leading-tight md:text-5xl'>
                        Medical Tourism{' '}
                        <span className='text-stone-400 italic'>Made Easy</span>
                    </h2>
                    <p
                        className='text-xl leading-relaxed font-light text-stone-400'
                        data-speakable='true'
                    >
                        Over 40% of our patients travel from outside Florida for
                        their procedures. We&apos;ve perfected the fly-in
                        experience so you can combine world-class plastic
                        surgery with the beauty of Miami.
                    </p>
                </div>

                {/* Feature Cards Grid */}
                <div className='mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className='hover:border-gold-500/30 group border border-stone-800 bg-stone-900/50 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-stone-800/50'
                        >
                            <div className='group-hover:bg-gold-500 mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-stone-800 text-stone-400 transition-all duration-300 group-hover:text-stone-900'>
                                {feature.icon}
                            </div>
                            <h3 className='mb-2 font-serif text-lg font-medium text-white'>
                                {feature.title}
                            </h3>
                            <p className='text-sm leading-relaxed text-stone-400'>
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Service Areas */}
                <div className='mb-12 rounded-lg border border-stone-800 bg-stone-900/50 p-6 backdrop-blur-sm md:p-8'>
                    <div className='mb-6 flex items-center gap-3'>
                        <MapPin className='text-gold-500 h-5 w-5' />
                        <h3 className='font-serif text-xl font-medium text-white'>
                            Patients Travel From
                        </h3>
                    </div>
                    <div className='grid gap-6 md:grid-cols-3'>
                        {serviceAreas.map((area, index) => (
                            <div key={index}>
                                <h4 className='text-gold-400 mb-2 text-sm font-bold tracking-wider uppercase'>
                                    {area.region}
                                </h4>
                                <ul className='space-y-1'>
                                    {area.locations.map(
                                        (location, locIndex) => (
                                            <li
                                                key={locIndex}
                                                className='text-sm text-stone-400'
                                            >
                                                {location}
                                            </li>
                                        )
                                    )}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className='flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center'>
                    <Button variant='gold' size='lg' asChild>
                        <Link
                            href='/fly-in-consultation'
                            className='flex items-center gap-2'
                        >
                            <Video className='h-4 w-4' />
                            Schedule Virtual Consultation
                        </Link>
                    </Button>
                    <Button
                        variant='outline'
                        size='lg'
                        className='border-stone-700 text-white hover:border-white hover:text-white'
                        asChild
                    >
                        <Link
                            href='/fly-in-consultation'
                            className='flex items-center gap-2'
                        >
                            Learn About Travel Packages
                            <ArrowRight className='h-4 w-4' />
                        </Link>
                    </Button>
                </div>

                {/* Trust Note */}
                <p className='mt-8 text-center text-sm text-stone-500'>
                    Need help planning your trip?{' '}
                    <Link
                        href='/fly-in-consultation'
                        className='text-gold-400 hover:text-gold-300 underline underline-offset-2'
                    >
                        Contact our patient concierge
                    </Link>{' '}
                    for personalized assistance.
                </p>
            </ContentWrapper>
        </SectionContainer>
    )
}
