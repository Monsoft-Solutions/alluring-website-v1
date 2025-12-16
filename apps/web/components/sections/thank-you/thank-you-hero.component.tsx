/**
 * ThankYouHero Component
 *
 * Hero section for the thank-you page confirming form submission.
 * Displays success message, sets expectations for follow-up, and provides trust indicators.
 *
 * Features:
 * - Animated success icon
 * - Confirmation message about Beauty Specialist callback
 * - Trust badges (Double Board-Certified)
 * - Business hours and immediate contact option
 */

import { Phone, Clock, Award, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'

import { siteConfig, getPhoneLink } from '@/lib/data/site-config'

export type ThankYouHeroProps = {
    readonly id?: string
}

export function ThankYouHero({ id = 'thank-you-hero' }: ThankYouHeroProps) {
    return (
        <section
            id={id}
            className='relative min-h-[70vh] w-full overflow-hidden bg-stone-900'
        >
            {/* Background Layers */}
            <div className='pointer-events-none absolute inset-0'>
                {/* Gradient Overlay */}
                <div className='absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900' />

                {/* Decorative Blurs */}
                <div className='bg-gold-600/10 absolute -top-[20%] left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-3xl' />
                <div className='absolute -bottom-[20%] left-1/4 h-[400px] w-[400px] rounded-full bg-stone-700/30 blur-3xl' />
                <div className='bg-gold-500/5 absolute top-[40%] right-1/4 h-[300px] w-[300px] rounded-full blur-3xl' />

                {/* Subtle Pattern */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')] opacity-[0.02]" />
            </div>

            {/* Content Container */}
            <div className='relative z-10 container mx-auto px-6 py-40 md:px-12'>
                <div className='mx-auto max-w-4xl text-center'>
                    {/* Heading */}
                    <h1 className='mb-6 font-serif text-4xl leading-tight text-white md:text-5xl lg:text-6xl'>
                        Thank You for{' '}
                        <span className='text-gold-400 italic'>
                            Reaching Out
                        </span>
                    </h1>

                    {/* Gold Accent Line */}
                    <div className='bg-gold-500 mx-auto mb-8 h-1 w-24 shadow-[0_0_20px_rgba(234,179,8,0.4)]' />

                    {/* Main Message */}
                    <div className='mb-10 space-y-4'>
                        <p className='text-xl leading-relaxed text-stone-200 md:text-2xl'>
                            We&apos;ve received your information and one of our{' '}
                            <span className='font-semibold text-white'>
                                Beauty Specialists
                            </span>{' '}
                            will call you within the next{' '}
                            <span className='font-semibold text-white'>
                                24 hours
                            </span>{' '}
                            to discuss your goals and schedule your
                            consultation.
                        </p>
                        <p className='text-lg text-stone-300'>
                            In the meantime, feel free to explore our site to
                            learn more about our procedures and see real patient
                            results.
                        </p>
                    </div>

                    {/* Trust Indicators */}
                    <div className='mb-10 flex flex-wrap justify-center gap-6'>
                        <div className='flex items-center gap-2 text-stone-400'>
                            <ShieldCheck className='text-gold-400 h-5 w-5' />
                            <span className='text-sm font-medium'>
                                {siteConfig.trustStats?.accreditation ??
                                    'Double Board-Certified'}{' '}
                                Accredited
                            </span>
                        </div>
                        <div className='flex items-center gap-2 text-stone-400'>
                            <Award className='text-gold-400 h-5 w-5' />
                            <span className='text-sm font-medium'>
                                Board-Certified
                            </span>
                        </div>
                        <div className='flex items-center gap-2 text-stone-400'>
                            <Clock className='text-gold-400 h-5 w-5' />
                            <span className='text-sm font-medium'>
                                24hr Response
                            </span>
                        </div>
                    </div>

                    {/* Immediate Contact CTA */}
                    <div className='rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm'>
                        <p className='mb-4 text-lg text-stone-300'>
                            <span className='font-semibold text-white'>
                                Need to speak with someone right away?
                            </span>
                            <br />
                            We&apos;re available{' '}
                            {
                                siteConfig.contact.businessHours?.[0]?.days
                            } from {siteConfig.contact.businessHours?.[0]?.open}{' '}
                            to {siteConfig.contact.businessHours?.[0]?.close}
                        </p>
                        <Button
                            asChild
                            size='lg'
                            className='bg-gold-500 hover:bg-gold-600 border-none px-8 font-bold tracking-wide text-white uppercase shadow-lg shadow-amber-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/30'
                        >
                            <Link href={getPhoneLink()}>
                                <Phone className='mr-2 h-5 w-5' />
                                {siteConfig.contact.phoneDisplay}
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
