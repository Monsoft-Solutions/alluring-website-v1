/**
 * WeightLossHero Component
 *
 * A conversion-focused hero section targeting post-weight loss patients (30-55):
 * - Emotional messaging about completing their transformation journey
 * - Addresses specific concerns: loose skin, body contouring after 50+ lbs loss
 * - Appeals to those who've worked hard through bariatric surgery, diet, or exercise
 *
 * Optimized for high-intent searches around body contouring after weight loss.
 */
import {
    Award,
    ShieldCheck,
    Clock,
    CreditCard,
    Quote,
    TrendingDown,
    Sparkles,
    Trophy,
} from 'lucide-react'
import Image from 'next/image'

import { ConsultationForm } from '@/components/shared/forms/consultation-form.component'
import { siteConfig } from '@/lib/data/site-config'
import { CONTACT_SOURCES } from '@/lib/types/forms/contact-form.type'

export type WeightLossHeroProps = {
    readonly id?: string
}

export function WeightLossHero({ id = 'hero' }: WeightLossHeroProps) {
    return (
        <section
            id={id}
            className='relative min-h-screen w-full overflow-hidden bg-stone-900 pt-32 lg:pt-40'
        >
            {/* Background Gradient */}
            <div className='pointer-events-none absolute inset-0'>
                <div className='absolute inset-0 bg-linear-to-br from-stone-900 via-stone-800 to-stone-900' />
                <div className='bg-gold-600/10 absolute -top-[20%] right-0 h-[800px] w-[800px] rounded-full blur-3xl' />
                <div className='bg-gold-500/5 absolute right-[20%] bottom-[10%] h-[400px] w-[400px] rounded-full blur-3xl' />
            </div>

            {/* 50/50 Split Layout */}
            <div className='relative z-10 flex min-h-screen flex-col lg:flex-row'>
                {/* Left Column - Transformation Image */}
                <div className='animate-fade-in-up relative w-full lg:w-1/2'>
                    <div className='h-[65vh] p-4 lg:h-full lg:p-20'>
                        <div className='shadow-gold-500/20 relative h-full w-full overflow-hidden rounded-2xl shadow-2xl sm:rounded-none sm:shadow-none'>
                            <Image
                                src='/images/landing/weight-loss-hero.jpg'
                                alt='Confident person celebrating their weight loss transformation'
                                fill
                                className='object-cover object-top lg:object-contain lg:object-center'
                                priority
                                sizes='(max-width: 1024px) 100vw, 50vw'
                            />
                            {/* Gradient overlay for text readability */}
                            <div className='absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent lg:hidden' />

                            {/* Mobile Badge Overlay */}
                            <div className='absolute right-6 bottom-6 left-6 lg:hidden'>
                                <div className='flex items-center gap-2 text-white'>
                                    <Trophy className='text-gold-400 h-4 w-4' />
                                    <span className='text-sm font-medium'>
                                        Finish Your Transformation
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Form */}
                <div className='animate-fade-in-up flex w-full flex-col justify-center px-6 py-8 delay-200 md:px-12 lg:w-1/2 lg:py-16'>
                    <div className='mx-auto w-full max-w-2xl'>
                        {/* Audience Badge - Desktop */}
                        <div className='mb-4 hidden items-center gap-2 lg:flex'>
                            <TrendingDown className='text-gold-400 h-4 w-4' />
                            <span className='text-sm font-medium text-stone-400'>
                                For Those Who&apos;ve Lost 50+ Pounds
                            </span>
                        </div>

                        {/* Emotional Headline */}
                        <div className='mb-6 text-center lg:text-left'>
                            <h1 className='mb-3 font-serif text-3xl leading-tight text-white md:text-4xl lg:text-5xl'>
                                You Did the{' '}
                                <span className='text-gold-400 italic'>
                                    Hard Part
                                </span>
                                <br />
                                <span className='text-2xl md:text-3xl lg:text-4xl'>
                                    Let Us Help You Finish
                                </span>
                            </h1>
                            <p className='text-lg leading-relaxed text-stone-300'>
                                You lost the weight. You changed your life. But
                                loose skin doesn&apos;t have to be your reward
                                for all that hard work. Now it&apos;s time to
                                see the body you&apos;ve earned.
                            </p>
                        </div>

                        {/* Trust Indicators */}
                        <div className='mb-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start'>
                            <div className='bg-gold-500/20 border-gold-500/30 inline-flex items-center gap-2 rounded-full border px-3 py-1.5'>
                                <Sparkles className='text-gold-400 h-4 w-4' />
                                <span className='text-gold-300 text-sm font-medium'>
                                    Body Contouring Specialists
                                </span>
                            </div>
                            <div className='bg-gold-500/20 border-gold-500/30 inline-flex items-center gap-2 rounded-full border px-3 py-1.5'>
                                <Trophy className='text-gold-400 h-4 w-4' />
                                <span className='text-gold-300 text-sm font-medium'>
                                    Post-Bariatric Experts
                                </span>
                            </div>
                        </div>

                        {/* Financing Callout */}
                        <div className='mb-6 flex items-center justify-center gap-2 lg:justify-start'>
                            <div className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2'>
                                <CreditCard className='text-gold-400 h-4 w-4' />
                                <span className='text-sm font-medium text-stone-300'>
                                    From $55/week | 0% APR available
                                </span>
                            </div>
                        </div>

                        {/* Form Container */}
                        <div
                            id='hero-form'
                            className='rounded-xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl md:p-8'
                        >
                            <ConsultationForm
                                title='Claim Your Free Consultation'
                                subtitle='Personalized Body Contouring Plan'
                                source={CONTACT_SOURCES.LANDING_PAGE}
                                analyticsFormName='weight_loss_landing_hero_form'
                                enableAnalytics
                                redirectOnSuccess='/thank-you'
                                showPreferredContactTime={false}
                            />
                        </div>

                        {/* Trust Cluster */}
                        <div className='mt-8 space-y-6'>
                            {/* Testimonial Quote */}
                            <div className='flex items-start gap-3 rounded-lg border border-white/5 bg-white/5 p-4'>
                                <Quote className='text-gold-400 mt-1 h-5 w-5 shrink-0' />
                                <div>
                                    <p className='text-sm leading-relaxed text-stone-300 italic'>
                                        &ldquo;I lost 120 pounds but
                                        couldn&apos;t see my progress because of
                                        all the excess skin. After my body lift
                                        at Alluring, I finally look like the
                                        healthy person I became.&rdquo;
                                    </p>
                                    <p className='text-gold-400 mt-2 text-xs font-medium'>
                                        — Marcus T., Lost 120 lbs
                                    </p>
                                </div>
                            </div>

                            {/* Trust Indicators */}
                            <div className='flex flex-wrap justify-center gap-6 lg:justify-start'>
                                <div className='flex items-center gap-2 text-stone-400 transition-colors hover:text-stone-300'>
                                    <ShieldCheck className='text-gold-400 h-5 w-5' />
                                    <span className='text-sm font-medium'>
                                        {siteConfig.trustStats?.accreditation ??
                                            'Board-Certified'}{' '}
                                        Surgeons
                                    </span>
                                </div>
                                <div className='flex items-center gap-2 text-stone-400 transition-colors hover:text-stone-300'>
                                    <Award className='text-gold-400 h-5 w-5' />
                                    <span className='text-sm font-medium'>
                                        Post-Bariatric Specialists
                                    </span>
                                </div>
                                <div className='flex items-center gap-2 text-stone-400 transition-colors hover:text-stone-300'>
                                    <Clock className='text-gold-400 h-5 w-5' />
                                    <span className='text-sm font-medium'>
                                        Same-Week Consultations
                                    </span>
                                </div>
                            </div>

                            {/* Risk Reversal Message */}
                            <p className='text-center text-sm text-stone-500 lg:text-left'>
                                ✓ Free consultation • ✓ Staged procedure options
                                • ✓ Flexible financing
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
