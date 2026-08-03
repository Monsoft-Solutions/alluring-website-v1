import Link from 'next/link'
import {
    Video,
    Plane,
    Building,
    CalendarCheck,
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
 * Fly-In Patient Component
 *
 * Showcases the fly-in patient program for out-of-state patients
 * traveling to Miami from elsewhere in the United States.
 * Server-rendered for SEO optimization on fly-in surgery queries.
 *
 * Naming note: the file name, component name and `id='medical-tourism'`
 * DOM anchor predate the US-only market scope and are kept for anchor
 * and import stability. All user-facing copy speaks to domestic (US)
 * patients only — see CLAUDE.md "Market scope is the United States only".
 *
 * Scope note: Alluring does NOT coordinate travel and does NOT partner
 * with recovery houses or recovery suites. Every claim in this section is
 * limited to what happens inside the practice — consultation, surgery,
 * clinical timeline, follow-up. The disclosure below the cards states the
 * boundary plainly so out-of-town patients plan their own lodging and
 * transport with correct expectations. Do not reintroduce airport pickup,
 * hotel booking, partner recovery facilities or "travel packages" here.
 */
export function MedicalTourism() {
    const features: FeatureCard[] = [
        {
            icon: <Video className='h-6 w-6' />,
            title: 'Virtual Consultations',
            description:
                'Meet your surgeon from anywhere in the U.S. Our HIPAA-compliant video consultations let you discuss goals, review options, and ask questions before you book anything.',
        },
        {
            icon: <CalendarCheck className='h-6 w-6' />,
            title: 'Dates Before You Book',
            description:
                'You get your surgery date, your pre-op date and your follow-up dates in writing first — so you book flights around a confirmed schedule instead of guessing.',
        },
        {
            icon: <Building className='h-6 w-6' />,
            title: 'One Miami Facility',
            description:
                'Pre-op, surgery and every follow-up happen at our accredited Miami surgical facility. No second location to get to, no procedure sent out to a partner clinic.',
        },
        {
            icon: <Languages className='h-6 w-6' />,
            title: 'Bilingual Care',
            description:
                'Our entire team is fluent in English and Spanish. We ensure nothing is lost in translation throughout your surgical journey.',
        },
    ]

    /**
     * Domestic only, by design. This section speaks to patients flying in
     * from elsewhere in the United States; international regions were
     * removed so the fly-in messaging is not making promises about
     * cross-border travel, visas or care abroad that the practice does not
     * handle. Spanish-language care is still surfaced above via the
     * Bilingual Care card.
     */
    const serviceAreas: ServiceArea[] = [
        {
            region: 'Northeast',
            locations: [
                'New York',
                'Boston',
                'Philadelphia',
                'Washington, D.C.',
                'New Jersey',
            ],
        },
        {
            region: 'South & Midwest',
            locations: ['Atlanta', 'Houston', 'Dallas', 'Chicago', 'Nashville'],
        },
        {
            region: 'West',
            locations: [
                'Los Angeles',
                'San Francisco',
                'Las Vegas',
                'Phoenix',
                'Seattle',
            ],
        },
    ]

    return (
        <SectionContainer
            id='medical-tourism'
            variant='default'
            className='relative overflow-hidden bg-stone-900 text-white'
            paddingY='py-24 lg:py-32'
            ariaLabel='Fly-in patient program'
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
                        Flying In for Surgery,{' '}
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
                <div className='mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
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

                {/* Scope disclosure. Stated plainly and directly under the
                    cards rather than buried at the foot of the section: an
                    out-of-town patient needs to know what they are booking
                    themselves before they read any further. */}
                <div className='mb-16 border-l-2 border-stone-700 py-1 pl-5'>
                    <p className='text-sm leading-relaxed text-stone-400'>
                        <span className='font-semibold text-stone-200'>
                            What we don&apos;t do:
                        </span>{' '}
                        we don&apos;t book flights, hotels or transportation,
                        and we don&apos;t own or partner with recovery houses.
                        You arrange your own stay. What we give you is the
                        medical side you can&apos;t plan without — your dates,
                        how many nights you need to be in Miami, and when your
                        surgeon clears you to fly home.
                    </p>
                </div>

                {/* Service Areas */}
                <div className='mb-12 rounded-lg border border-stone-800 bg-stone-900/50 p-6 backdrop-blur-sm md:p-8'>
                    <div className='mb-6 flex items-center gap-3'>
                        <MapPin className='text-gold-500 h-5 w-5' />
                        <h3 className='font-serif text-xl font-medium text-white'>
                            Patients Fly In From Across the U.S.
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
                            How Fly-In Surgery Works
                            <ArrowRight className='h-4 w-4' />
                        </Link>
                    </Button>
                </div>

                {/* Trust Note */}
                <p className='mt-8 text-center text-sm text-stone-500'>
                    Not sure how many days to plan for?{' '}
                    <Link
                        href='/fly-in-consultation'
                        className='text-gold-400 hover:text-gold-300 underline underline-offset-2'
                    >
                        Ask us before you book
                    </Link>{' '}
                    — the answer depends on your procedure.
                </p>
            </ContentWrapper>
        </SectionContainer>
    )
}
