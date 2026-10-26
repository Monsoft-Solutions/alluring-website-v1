/**
 * SpanishHero Component
 *
 * A Spanish-language hero section targeting Hispanic/Latino audiences:
 * - Full Spanish content for Miami's Hispanic population and Spanish
 * speakers travelling in from other US states
 * - Emphasizes bilingual staff and cultural understanding
 * - All procedures available with Spanish consultation
 *
 * Optimized for Spanish-language plastic surgery searches.
 */
import {
    ShieldCheck,
    Clock,
    CreditCard,
    Globe,
    Heart,
    MapPin,
} from 'lucide-react'
import Image from 'next/image'

import { KARLINSKY_ABS_CERTIFIED_YEAR } from '@workspace/shared/claims/surgeon'

import { ConsultationForm } from '@/components/shared/forms/consultation-form.component'
import { CONTACT_SOURCES } from '@/lib/types/forms/contact-form.type'

export type SpanishHeroProps = {
    readonly id?: string
}

export function SpanishHero({ id = 'hero' }: SpanishHeroProps) {
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
                                src='/images/landing/spanish-hero.jpg'
                                alt='Mujer latina sonriendo con confianza'
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
                                    <Globe className='text-gold-400 h-4 w-4' />
                                    <span className='text-sm font-medium'>
                                        Hablamos Tu Idioma
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Form */}
                <div className='animate-fade-in-up flex w-full flex-col justify-center px-6 py-8 delay-200 md:px-12 lg:w-1/2 lg:py-16'>
                    <div className='mx-auto w-full max-w-2xl'>
                        {/* Language Badge - Desktop */}
                        <div className='mb-4 hidden items-center gap-2 lg:flex'>
                            <MapPin className='text-gold-400 h-4 w-4' />
                            <span className='text-sm font-medium text-stone-400'>
                                Miami, Florida
                            </span>
                            <span className='text-gold-400'>|</span>
                            <span className='text-sm font-medium text-stone-400'>
                                Hablamos espa&ntilde;ol
                            </span>
                        </div>

                        {/* Emotional Headline - Spanish */}
                        <div className='mb-6 text-center lg:text-left'>
                            <h1 className='mb-3 font-serif text-3xl leading-tight text-white md:text-4xl lg:text-5xl'>
                                Cirug&iacute;a Pl&aacute;stica{' '}
                                <span className='text-gold-400 italic'>
                                    en Miami
                                </span>
                                <br />
                                <span className='text-2xl md:text-3xl lg:text-4xl'>
                                    En Tu Idioma
                                </span>
                            </h1>
                            <p className='text-lg leading-relaxed text-stone-300'>
                                Una sola cirujana en Miami, y un equipo que
                                habla espa&ntilde;ol. Desde la primera llamada
                                hasta tu recuperaci&oacute;n completa, te
                                atendemos en espa&ntilde;ol.
                            </p>
                        </div>

                        {/* Trust Indicators */}
                        <div className='mb-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start'>
                            <div className='bg-gold-500/20 border-gold-500/30 inline-flex items-center gap-2 rounded-full border px-3 py-1.5'>
                                <Globe className='text-gold-400 h-4 w-4' />
                                <span className='text-gold-300 text-sm font-medium'>
                                    Atenci&oacute;n en espa&ntilde;ol
                                </span>
                            </div>
                            <div className='bg-gold-500/20 border-gold-500/30 inline-flex items-center gap-2 rounded-full border px-3 py-1.5'>
                                <Heart className='text-gold-400 h-4 w-4' />
                                <span className='text-gold-300 text-sm font-medium'>
                                    Certificada por el American Board of Surgery
                                    desde {KARLINSKY_ABS_CERTIFIED_YEAR}
                                </span>
                            </div>
                        </div>

                        {/* Financing Callout */}
                        <div className='mb-6 flex items-center justify-center gap-2 lg:justify-start'>
                            <div className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2'>
                                <CreditCard className='text-gold-400 h-4 w-4' />
                                <span className='text-sm font-medium text-stone-300'>
                                    Financiamiento disponible
                                </span>
                            </div>
                        </div>

                        {/* Form Container */}
                        <div
                            id='hero-form'
                            className='rounded-xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl md:p-8'
                        >
                            <ConsultationForm
                                title='Agenda Tu Consulta Gratis'
                                subtitle='Sin Compromiso • Te Llamamos en Español'
                                source={CONTACT_SOURCES.LANDING_PAGE}
                                analyticsFormName='spanish_landing_hero_form'
                                enableAnalytics
                                redirectOnSuccess='/thank-you'
                                showPreferredContactTime={false}
                                lang='es'
                            />
                        </div>

                        {/* Trust Cluster */}
                        <div className='mt-8 space-y-6'>
                            {/* Trust Indicators */}
                            <div className='flex flex-wrap justify-center gap-6 lg:justify-start'>
                                <div className='flex items-center gap-2 text-stone-400 transition-colors hover:text-stone-300'>
                                    <ShieldCheck className='text-gold-400 h-5 w-5' />
                                    <span className='text-sm font-medium'>
                                        Una sola cirujana para cada
                                        procedimiento
                                    </span>
                                </div>
                                <div className='flex items-center gap-2 text-stone-400 transition-colors hover:text-stone-300'>
                                    <Clock className='text-gold-400 h-5 w-5' />
                                    <span className='text-sm font-medium'>
                                        En persona o por video
                                    </span>
                                </div>
                            </div>

                            {/* Risk Reversal Message */}
                            <p className='text-center text-sm text-stone-500 lg:text-left'>
                                ✓ Consulta gratis • ✓ Sin compromiso • ✓
                                Financiamiento disponible
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
