import Link from 'next/link'
import {
    Check,
    CreditCard,
    Percent,
    Stethoscope,
    UserCheck,
    Building2,
    Calendar,
    ArrowRight,
} from 'lucide-react'

import { Button } from '@workspace/ui/components/button'

import { SectionContainer } from '../shared/section-container.component'
import { ContentWrapper } from '../shared/content-wrapper.component'

/**
 * Pricing item type
 */
type PricingItem = {
    readonly name: string
    readonly slug: string
    readonly description: string
}

/**
 * Included item type
 */
type IncludedItem = {
    readonly icon: React.ReactNode
    readonly text: string
}

/**
 * Pricing Preview Component
 *
 * Displays transparent all-inclusive pricing for top procedures.
 * Server-rendered for SEO optimization on cost-related queries.
 *
 * Features:
 * - Top 4 procedures with "Starting at" prices
 * - "What's Included" checklist
 * - 0% Interest financing badge
 * - CTA to financing page
 */
export function PricingPreview() {
    const procedures: PricingItem[] = [
        {
            name: 'Brazilian Butt Lift',
            slug: 'brazilian-butt-lift-bbl-miami',
            description: 'Natural curves with fat transfer',
        },
        {
            name: 'Mommy Makeover',
            slug: 'mommy-makeover-miami',
            description: 'Tummy tuck + breast procedure',
        },
        {
            name: 'Breast Augmentation',
            slug: 'breast-augmentation-miami',
            description: 'Saline or silicone implants',
        },
        {
            name: 'Liposuction',
            slug: 'liposuction-miami',
            description: 'Targeted fat removal',
        },
    ]

    const includedItems: IncludedItem[] = [
        {
            icon: <UserCheck className='h-4 w-4' />,
            text: 'Board-Certified Surgeon Fees',
        },
        {
            icon: <Stethoscope className='h-4 w-4' />,
            text: 'Anesthesia & Anesthesiologist',
        },
        {
            icon: <Building2 className='h-4 w-4' />,
            text: 'Accredited Surgical Facility',
        },
        {
            icon: <Calendar className='h-4 w-4' />,
            text: 'All Post-Op Follow-Up Visits',
        },
    ]

    return (
        <SectionContainer
            id='pricing'
            variant='default'
            className='relative overflow-hidden bg-stone-50'
            paddingY='py-24 lg:py-32'
            ariaLabel='Pricing information'
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')] opacity-[0.02]" />

            <ContentWrapper
                size='lg'
                paddingX='px-6 md:px-12'
                className='relative'
            >
                {/* Header */}
                <div className='mb-16 grid gap-8 lg:grid-cols-2 lg:gap-16'>
                    <div>
                        <span className='text-gold-500 mb-4 block text-sm font-bold tracking-widest uppercase'>
                            Transparent Pricing
                        </span>
                        <h2 className='mb-6 font-serif text-4xl leading-tight text-stone-900 md:text-5xl'>
                            All-Inclusive Pricing,{' '}
                            <span className='text-stone-400 italic'>
                                No Surprises
                            </span>
                        </h2>
                        <p
                            className='text-xl leading-relaxed font-light text-stone-600'
                            data-speakable='true'
                        >
                            We believe in complete transparency. Our quoted
                            prices include surgeon fees, anesthesia, facility
                            costs, and all follow-up visits. No hidden fees,
                            ever.
                        </p>
                    </div>

                    {/* Financing Badge */}
                    <div className='flex items-center lg:justify-end'>
                        <div className='border-gold-200 inline-flex flex-col items-center rounded-lg border bg-gradient-to-br from-white to-stone-50 p-6 shadow-sm md:p-8'>
                            <div className='bg-gold-100 text-gold-600 mb-3 flex h-12 w-12 items-center justify-center rounded-full'>
                                <Percent className='h-6 w-6' />
                            </div>
                            <span className='mb-1 text-2xl font-bold text-stone-900'>
                                0% Interest
                            </span>
                            <span className='text-sm text-stone-500'>
                                Financing Available
                            </span>
                            <Link
                                href='/plastic-surgery-financing-miami'
                                className='text-gold-600 hover:text-gold-700 mt-3 text-sm font-medium underline underline-offset-2'
                            >
                                Learn more
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Pricing Cards Grid */}
                <div className='mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                    {procedures.map((procedure) => (
                        <Link
                            key={procedure.slug}
                            href={`/procedures/${procedure.slug}`}
                            className='hover:border-gold-300 group flex flex-col border border-stone-200 bg-white p-6 transition-all duration-300 hover:shadow-lg'
                        >
                            <div className='mb-4 flex-1'>
                                <h3 className='font-serif text-lg font-medium text-stone-900 group-hover:text-stone-700'>
                                    {procedure.name}
                                </h3>
                                <p className='text-sm text-stone-500'>
                                    {procedure.description}
                                </p>
                            </div>
                            <div className='border-t border-stone-100 pt-4'>
                                <span className='text-gold-600 group-hover:text-gold-700 flex items-center gap-1 text-sm font-medium'>
                                    Get Your Quote
                                    <ArrowRight className='h-3.5 w-3.5 transition-transform group-hover:translate-x-1' />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* What's Included Section */}
                <div className='rounded-lg border border-stone-200 bg-white p-6 md:p-8'>
                    <div className='flex flex-col gap-8 md:flex-row md:items-center md:justify-between'>
                        <div>
                            <h3 className='mb-4 font-serif text-xl font-medium text-stone-900'>
                                What&apos;s Included in Every Quote
                            </h3>
                            <ul className='grid gap-3 sm:grid-cols-2'>
                                {includedItems.map((item, index) => (
                                    <li
                                        key={index}
                                        className='flex items-center gap-3 text-stone-600'
                                    >
                                        <span className='text-gold-500 flex-shrink-0'>
                                            {item.icon}
                                        </span>
                                        <span className='text-sm'>
                                            {item.text}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* CTA */}
                        <div className='flex flex-col items-center gap-3 md:flex-shrink-0'>
                            <Button variant='gold' size='lg' asChild>
                                <Link
                                    href='/plastic-surgery-financing-miami'
                                    className='flex items-center gap-2'
                                >
                                    <CreditCard className='h-4 w-4' />
                                    Explore Financing Options
                                </Link>
                            </Button>
                            <span className='text-xs text-stone-500'>
                                Payments as low as $99/month
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bottom Note */}
                <p className='mt-6 text-center text-sm text-stone-500'>
                    Prices vary based on individual anatomy and procedure
                    complexity.{' '}
                    <Link
                        href='/free-consultation'
                        className='text-gold-600 hover:text-gold-700 underline underline-offset-2'
                    >
                        Schedule a free consultation
                    </Link>{' '}
                    for your personalized quote.
                </p>
            </ContentWrapper>
        </SectionContainer>
    )
}
